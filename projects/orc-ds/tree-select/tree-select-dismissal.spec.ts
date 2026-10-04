import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerOverlay } from '@ciag/orchestra/internal';
import { TreeSelectComponent } from '@ciag/orchestra/p2';
import type { TreeSelectNode } from '@ciag/orchestra/p2';

/**
 * Dismissal-lifecycle pins for the tree-select: the shared in-place overlay
 * lifecycle (outside-interaction dismissal, topmost-aware Escape,
 * overlay-layer registry participation, focus restore) with its documented
 * focusout close preserved.
 */
describe('TreeSelect dismissal lifecycle', () => {
  const NODES: TreeSelectNode[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];

  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    fixture.componentRef.setInput('nodes', NODES);
    fixture.detectChanges();
    return fixture;
  }

  function triggerOf(nativeElement: HTMLElement): HTMLElement {
    return nativeElement.querySelector('.trigger') as HTMLElement;
  }

  function openPanel(fixture: ReturnType<typeof create>): void {
    fixture.componentInstance.toggleOpen();
    fixture.detectChanges();
  }

  function clickOutside(): void {
    document.body.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    document.body.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
  }

  function settle(fixture: ComponentFixture<unknown>): void {
    // The dismissal wiring attaches through an effect after the panel render.
    fixture.detectChanges();
  }

  it('closes the open panel when a pointer interaction lands outside', () => {
    const fixture = create();
    const hidden: number[] = [];
    fixture.componentInstance.onHide.subscribe(() => hidden.push(1));
    openPanel(fixture);
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeTrue();

    clickOutside();
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(hidden).toEqual([1]);
    expect(fixture.nativeElement.querySelector('[role="tree"]')).toBeNull();
  });

  it('keeps a single instance open: opening a second instance closes the first', () => {
    const first = create();
    const second = create();
    openPanel(first);
    settle(first);
    expect(first.componentInstance.open()).toBeTrue();

    triggerOf(second.nativeElement).click();
    settle(second);
    settle(first);
    expect(second.componentInstance.open()).toBeTrue();
    expect(first.componentInstance.open()).toBeFalse();
  });

  it('keeps aria-expanded truthful across the dismissal', () => {
    const fixture = create();
    const trigger = triggerOf(fixture.nativeElement);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    openPanel(fixture);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    clickOutside();
    settle(fixture);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes through the overlay-layer registry when the parent layer closes', () => {
    @Component({
      imports: [TreeSelectComponent],
      template: `
        <div class="overlay-surface">
          <orc-tree-select [nodes]="nodes" />
        </div>
      `,
    })
    class Host {
      readonly nodes = NODES;
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    const picker = host.debugElement.query(
      (node) => node.name === 'orc-tree-select',
    ).componentInstance as TreeSelectComponent;
    const release = registerOverlay(
      host.nativeElement.querySelector('.overlay-surface') as HTMLElement,
    );

    picker.toggleOpen();
    settle(host);
    expect(picker.open()).toBeTrue();

    release();
    settle(host);
    expect(picker.open()).toBeFalse();
  });

  it('defers to a topmost sibling layer on Escape and closes once topmost again', () => {
    const fixture = create();
    openPanel(fixture);
    settle(fixture);

    const sibling = document.createElement('div');
    document.body.appendChild(sibling);
    const release = registerOverlay(sibling);

    const escape = () =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
    escape();
    settle(fixture);
    // A layer above the panel owns Escape; the panel stays open.
    expect(fixture.componentInstance.open()).toBeTrue();

    release();
    sibling.remove();
    escape();
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('restores focus to the trigger when Escape closes the panel', () => {
    const fixture = create();
    openPanel(fixture);
    settle(fixture);

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    tree.focus();

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(document.activeElement).toBe(triggerOf(fixture.nativeElement));
  });

  it('still closes when keyboard focus leaves the host (focusout contract)', async () => {
    const fixture = create();
    openPanel(fixture);
    settle(fixture);

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    tree.focus();
    // Move focus out of the host for real; the host close runs in a
    // microtask after the focusout.
    tree.blur();
    tree.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: null }),
    );
    await Promise.resolve();
    settle(fixture);
    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
