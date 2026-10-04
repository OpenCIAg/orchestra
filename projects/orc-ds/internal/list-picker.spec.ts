import { Component, TemplateRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Overlay } from '@angular/cdk/overlay';
import { ViewContainerRef } from '@angular/core';
import {
  attachListPickerOverlay,
  listPickerActiveId,
  listPickerActiveIndex,
  listPickerEnabledIndexes,
  listPickerEquality,
  listPickerFilterFields,
  listPickerFirstEnabled,
  listPickerOptionDisabled,
  listPickerOptionLabel,
  listPickerOptionValue,
  listPickerReadField,
  listPickerReadFieldPath,
  listPickerRowMatchesFilter,
  listPickerSkipDisabled,
  listPickerValueMatchesFilter,
  stepListPickerActive,
  toggleListPickerValue,
} from './list-picker';
import { registerOverlay } from './overlay-lifecycle';

describe('list-picker interaction core', () => {
  describe('option model normalization', () => {
    const option = { code: 7, caption: 'Seven', locked: true };

    it('reads direct fields and falls back to value/label/disabled', () => {
      expect(listPickerReadField(option, 'caption')).toBe('Seven');
      expect(listPickerReadField('solo', 'label')).toBeUndefined();

      expect(listPickerOptionValue(option, 'code')).toBe(7);
      expect(listPickerOptionValue({ value: 'v' }, undefined)).toBe('v');
      expect(listPickerOptionValue('solo', undefined)).toBe('solo');

      expect(listPickerOptionLabel(option, 'caption')).toBe('Seven');
      expect(listPickerOptionLabel({ label: 'Named' }, undefined)).toBe(
        'Named',
      );
      expect(listPickerOptionLabel('solo', undefined)).toBe('solo');
      expect(listPickerOptionLabel({ caption: 'X' }, 'missing')).toBe('');

      expect(listPickerOptionDisabled(option, 'locked')).toBeTrue();
      expect(listPickerOptionDisabled({ disabled: 1 }, undefined)).toBeTrue();
      expect(
        listPickerOptionDisabled({ locked: true }, (candidate) =>
          Boolean((candidate as { locked: boolean }).locked),
        ),
      ).toBeTrue();
    });

    it('resolves dotted paths for the dropdown contract', () => {
      const nested = { title: { text: 'Deep' }, meta: { blocked: 'yes' } };
      expect(listPickerReadFieldPath(nested, 'title.text')).toBe('Deep');
      expect(listPickerReadFieldPath(nested, 'meta.blocked')).toBe('yes');
      expect(listPickerReadFieldPath('plain', 'title.text')).toBeUndefined();
      expect(
        listPickerOptionLabel(nested, 'title.text', listPickerReadFieldPath),
      ).toBe('Deep');
      expect(
        listPickerOptionDisabled(
          nested,
          'meta.blocked',
          listPickerReadFieldPath,
        ),
      ).toBeTrue();
    });
  });

  describe('dataKey equality strategies', () => {
    const extract = listPickerEquality('id', 'extract');
    const bothSides = listPickerEquality('id', 'both-sides');
    const objects = listPickerEquality('id', 'objects');

    it('select: extracts keys from any side holding them', () => {
      expect(extract({ id: 1 }, 1)).toBeTrue();
      expect(extract(1, { id: 1 })).toBeTrue();
      expect(extract({ id: 1 }, { id: 1 })).toBeTrue();
      expect(extract({ id: 1 }, { id: 2 })).toBeFalse();
      expect(extract(null, null)).toBeTrue();
    });

    it('multi-select: compares by key only when both sides resolve', () => {
      expect(bothSides({ id: 1 }, { id: 1 })).toBeTrue();
      expect(bothSides({ id: 1 }, 1)).toBeFalse();
      expect(bothSides('a', 'a')).toBeTrue();
    });

    it('listbox: compares by key only when both sides are objects', () => {
      expect(objects({ id: 1 }, { id: 1 })).toBeTrue();
      expect(objects({ id: 1 }, 1)).toBeFalse();
      expect(objects({ id: 1 }, { id: 2 })).toBeFalse();
    });

    it('falls back to strict equality without a dataKey', () => {
      const strict = listPickerEquality(undefined, 'extract');
      expect(strict({ id: 1 }, { id: 1 })).toBeFalse();
      expect(strict('a', 'a')).toBeTrue();
    });
  });

  describe('filter machines', () => {
    it('matches single values with every declared mode and locale', () => {
      expect(
        listPickerValueMatchesFilter('Alpha', 'alp', 'contains'),
      ).toBeTrue();
      expect(
        listPickerValueMatchesFilter('Alpha', 'ALP', 'startsWith', 'tr'),
      ).toBeTrue();
      expect(
        listPickerValueMatchesFilter('Alpha', 'pha', 'endsWith'),
      ).toBeTrue();
      expect(
        listPickerValueMatchesFilter('Alpha', 'alpha', 'equals'),
      ).toBeTrue();
      expect(
        listPickerValueMatchesFilter('Alpha', 'alpha', 'notEquals'),
      ).toBeFalse();
      expect(listPickerValueMatchesFilter('Be', 'Al, Be', 'in')).toBeTrue();
      expect(listPickerValueMatchesFilter('Beta', 'Al, Be', 'in')).toBeFalse();
      expect(listPickerValueMatchesFilter('3', '5', 'lt')).toBeTrue();
      expect(listPickerValueMatchesFilter('5', '5', 'lte')).toBeTrue();
      expect(listPickerValueMatchesFilter('7', '5', 'gt')).toBeTrue();
      expect(listPickerValueMatchesFilter('5', '5', 'gte')).toBeTrue();
      expect(listPickerValueMatchesFilter('x', '5', 'gt')).toBeFalse();
    });

    it('applies the listbox row semantics for notEquals, in, and numeric modes', () => {
      expect(
        listPickerRowMatchesFilter(['Alpha', 'Same'], 'same', 'notEquals'),
      ).toBeFalse();
      expect(
        listPickerRowMatchesFilter(['Alpha', 'Other'], 'same', 'notEquals'),
      ).toBeTrue();
      expect(
        listPickerRowMatchesFilter([['hydrogen', 'light']], 'LIGHT', 'in'),
      ).toBeTrue();
      expect(listPickerRowMatchesFilter(['3', '9'], '5', 'lt')).toBeTrue();
      expect(listPickerRowMatchesFilter([null, ''], '5', 'gte')).toBeFalse();
      expect(
        listPickerRowMatchesFilter(['Alpha'], 'alp', 'contains'),
      ).toBeTrue();
    });

    it('resolves filter fields from filterFields and the filterBy list', () => {
      expect(listPickerFilterFields(['a'], 'b, c')).toEqual(['a']);
      expect(listPickerFilterFields(undefined, 'b, c')).toEqual(['b', 'c']);
      expect(listPickerFilterFields(undefined, ' , ')).toBeUndefined();
      expect(listPickerFilterFields(undefined, undefined)).toBeUndefined();
    });
  });

  describe('keyboard roving', () => {
    const isDisabled = (index: number) => index === 1 || index === 2;

    it('collects enabled indexes and the first enabled entry', () => {
      expect(listPickerEnabledIndexes(4, isDisabled)).toEqual([0, 3]);
      expect(listPickerFirstEnabled(4, isDisabled)).toBe(0);
      expect(listPickerFirstEnabled(4, () => true)).toBe(-1);
    });

    it('steps with wrap-around and lands on the ends from no selection', () => {
      const enabled = [0, 3];
      expect(stepListPickerActive(-1, 1, enabled)).toBe(0);
      expect(stepListPickerActive(-1, -1, enabled)).toBe(3);
      expect(stepListPickerActive(0, 1, enabled)).toBe(3);
      expect(stepListPickerActive(3, 1, enabled)).toBe(0);
      expect(stepListPickerActive(3, -1, enabled)).toBe(0);
    });

    it('clamps when the contract asks for it', () => {
      const enabled = [0, 1, 2];
      expect(stepListPickerActive(2, 1, enabled, true)).toBe(2);
      expect(stepListPickerActive(0, -1, enabled, true)).toBe(0);
      expect(stepListPickerActive(-1, -1, enabled, true)).toBe(2);
    });

    it('skips disabled options from any starting point (select data contract)', () => {
      expect(listPickerSkipDisabled(0, 1, 4, isDisabled)).toBe(3);
      expect(listPickerSkipDisabled(3, 1, 4, isDisabled)).toBe(0);
      expect(listPickerSkipDisabled(0, -1, 4, isDisabled)).toBe(3);
    });

    it('validates the active option and builds its id', () => {
      expect(listPickerActiveIndex(1, 4, isDisabled)).toBe(-1);
      expect(listPickerActiveIndex(3, 4, isDisabled)).toBe(3);
      expect(listPickerActiveIndex(9, 4, isDisabled)).toBe(-1);
      expect(listPickerActiveId('orc-x-listbox', 3)).toBe(
        'orc-x-listbox-option-3',
      );
      expect(listPickerActiveId('orc-x-listbox', -1)).toBeNull();
    });
  });

  describe('selection state machine', () => {
    const strict = listPickerEquality(undefined, 'extract');

    it('toggles candidates and reports the direction', () => {
      expect(toggleListPickerValue(['a', 'b'], 'a', strict)).toEqual({
        next: ['b'],
        added: false,
      });
      expect(toggleListPickerValue(['a'], 'b', strict)).toEqual({
        next: ['a', 'b'],
        added: true,
      });
    });

    it('blocks adds at the selection limit but always allows removals', () => {
      expect(toggleListPickerValue(['a'], 'b', strict, 1)).toBeNull();
      expect(toggleListPickerValue(['a', 'b'], 'b', strict, 1)).toEqual({
        next: ['a'],
        added: false,
      });
    });
  });
});

/**
 * Pins for the shared detached-picker overlay lifecycle: outside
 * dismissal, registry participation, topmost-aware document Escape with
 * owner-document realm binding and the idempotent dispose. These are the
 * realm-correct binding lessons absorbed from the former in-place helper;
 * the picker families pin the same behaviors through their public
 * components.
 */
describe('attachListPickerOverlay lifecycle', () => {
  @Component({
    template: `<ng-template #content
      ><div class="probe">panel</div></ng-template
    >`,
  })
  class PortalHost {
    readonly content = viewChild.required<TemplateRef<unknown>>('content');
    readonly viewContainerRef = inject(ViewContainerRef);
    readonly overlay = inject(Overlay);
  }

  function setup(options: {
    documentRef?: Document;
    parent?: HTMLElement;
    documentEscape?: () => void;
  }) {
    const realm = options.documentRef ?? document;
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(PortalHost);
    fixture.detectChanges();
    const host = realm.createElement('div');
    const anchor = realm.createElement('button');
    host.appendChild(anchor);
    (options.parent ?? realm.body).appendChild(host);
    const calls = {
      escape: 0,
      documentEscape: 0,
      outside: [] as Event[],
      backdrop: 0,
      parentClose: 0,
    };
    const handle = attachListPickerOverlay({
      anchor,
      content: fixture.componentInstance.content(),
      viewContainerRef: fixture.componentInstance.viewContainerRef,
      overlay: fixture.componentInstance.overlay,
      positionStrategy: (origin) =>
        fixture.componentInstance.overlay
          .position()
          .flexibleConnectedTo(origin)
          .withPositions([
            {
              originX: 'start',
              originY: 'bottom',
              overlayX: 'start',
              overlayY: 'top',
              offsetY: 4,
            },
          ]),
      ...(options.documentRef ? { documentRef: options.documentRef } : {}),
      documentEscape: options.documentEscape
        ? () => {
            calls.documentEscape += 1;
          }
        : undefined,
      onEscape: () => {
        calls.escape += 1;
      },
      onBackdrop: () => {
        calls.backdrop += 1;
      },
      onOutside: (event) => {
        calls.outside.push(event);
      },
      onParentClose: () => {
        calls.parentClose += 1;
      },
      targets: (): HTMLElement[] =>
        [anchor, handle?.overlayElement].filter(
          (element): element is HTMLElement => !!element,
        ),
    })!;
    const cleanup = () => {
      handle.dispose();
      host.remove();
      fixture.destroy();
    };
    return { realm, anchor, handle, calls, cleanup };
  }

  function pressEscape(realm: Document): boolean {
    const event = new realm.defaultView!.KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    });
    realm.dispatchEvent(event);
    return event.defaultPrevented;
  }

  function click(realm: Document, target: HTMLElement): void {
    const MouseEventConstructor = realm.defaultView?.MouseEvent ?? MouseEvent;
    target.dispatchEvent(
      new MouseEventConstructor('pointerdown', {
        bubbles: true,
        cancelable: true,
      }),
    );
    target.dispatchEvent(
      new MouseEventConstructor('click', { bubbles: true, cancelable: true }),
    );
  }

  it('attaches the panel and dismisses for outside pointer interactions', () => {
    const scene = setup({});
    expect(scene.handle.overlayElement).not.toBeNull();
    expect(scene.handle.overlayElement!.querySelector('.probe')).not.toBeNull();

    const stranger = document.createElement('button');
    document.body.appendChild(stranger);
    click(document, stranger);
    expect(scene.calls.outside.length).toBe(2);
    stranger.remove();
    scene.cleanup();
    expect(scene.handle.overlayElement).toBeNull();
  });

  it('reports backdrop clicks and stays open for interactions on the anchor', () => {
    const scene = setup({});
    click(document, scene.anchor);
    expect(scene.calls.outside).toEqual([]);

    const backdrop = document.querySelector('.cdk-overlay-backdrop');
    expect(backdrop).not.toBeNull();
    click(document, backdrop as HTMLElement);
    expect(scene.calls.backdrop).toBe(1);
    scene.cleanup();
  });

  it('closes through the registry when a containing parent layer releases', () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const release = registerOverlay(parent);
    const scene = setup({ parent });

    expect(scene.calls.parentClose).toBe(0);
    release();
    parent.remove();
    expect(scene.calls.parentClose).toBe(1);
    scene.cleanup();
  });

  it('arbitrates document-level Escape through the overlay-layer registry', () => {
    const scene = setup({ documentEscape: () => {} });
    expect(pressEscape(document)).toBeTrue();

    const sibling = document.createElement('div');
    document.body.appendChild(sibling);
    const release = registerOverlay(sibling);
    expect(pressEscape(document)).toBeFalse();
    release();
    sibling.remove();
    expect(pressEscape(document)).toBeTrue();
    expect(scene.calls.documentEscape).toBe(2);
    scene.cleanup();
  });

  it('binds to the anchor owner document, not the rendering one', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    if (!frameDocument) throw new Error('same-origin iframe unavailable');

    const scene = setup({
      documentRef: frameDocument,
      documentEscape: () => {},
    });
    // Outside interaction inside the owner realm dismisses.
    click(frameDocument, frameDocument.body);
    expect(scene.calls.outside.length).toBe(2);
    // Escape inside the owner realm reaches the panel.
    expect(pressEscape(frameDocument)).toBeTrue();
    // The main document never sees a listener for this panel.
    click(document, document.body);
    expect(pressEscape(document)).toBeFalse();
    expect(scene.calls.outside.length).toBe(2);
    expect(scene.calls.documentEscape).toBe(1);

    scene.cleanup();
    frame.remove();
  });

  it('dispose is idempotent and stops every listener', () => {
    const scene = setup({
      documentEscape: () => {
        /* counted in setup */
      },
    });
    scene.cleanup();
    scene.cleanup();

    const stranger = document.createElement('button');
    document.body.appendChild(stranger);
    click(document, stranger);
    expect(pressEscape(document)).toBeFalse();
    expect(scene.calls.outside).toEqual([]);
    stranger.remove();
  });
});
