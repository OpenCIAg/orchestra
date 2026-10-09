import {
  ApplicationRef,
  Component,
  ElementRef,
  inject,
  InjectionToken,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  OverlayContainer,
  OverlayKeyboardDispatcher,
  OverlayOutsideClickDispatcher,
} from '@angular/cdk/overlay';
import {
  injectAnchoredOverlay,
  OrcAnchoredOverlayConfig,
  OrcOverlayCloseReason,
  orcConnectedPosition,
  orcPlacementFallbacks,
} from './anchored-overlay';
import { ORC_DIALOG_DATA, OrcModalLayer, OrcModalRef } from './modal-layer';
import { OrcToastLayer } from './toast-layer';

const ANCHORED_CONFIG = new InjectionToken<OrcAnchoredOverlayConfig>(
  'ANCHORED_CONFIG',
);

const keydown = (key: string, target: EventTarget = document.body) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  );

/** Real pointer sequence so the CDK outside-click dispatcher sees it. */
function pointerClick(element: Element): void {
  element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

const settle = async () => {
  TestBed.inject(ApplicationRef).tick();
  await new Promise((resolve) => setTimeout(resolve));
  TestBed.inject(ApplicationRef).tick();
};

/** True when the element is what the user sees at its own center point. */
function isOnTop(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const hit = document.elementFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
  );
  return !!hit && (hit === element || element.contains(hit));
}

@Component({
  selector: 'orc-test-anchored-host',
  template: `
    <button #trigger type="button" class="trigger" (click)="toggle()">
      Abrir
    </button>
    <button type="button" class="other">Outro</button>
    <ng-template #panel>
      <div class="panel-content">
        <button type="button" class="inside">Dentro</button>
        <button type="button" class="inside-2">Dentro 2</button>
      </div>
    </ng-template>
  `,
})
class AnchoredHostComponent {
  readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  readonly overlay = injectAnchoredOverlay({
    anchor: () => this.trigger(),
    role: 'dialog',
    ...(inject(ANCHORED_CONFIG, { optional: true }) ?? {}),
  });
  readonly reasons: OrcOverlayCloseReason[] = [];

  constructor() {
    this.overlay.closed.subscribe((reason) => this.reasons.push(reason));
  }

  toggle(): void {
    this.overlay.toggle(this.panel());
  }
}

@Component({
  selector: 'orc-test-modal-content',
  template: `
    <h2 id="modal-heading">Editar projeto</h2>
    <p class="data">{{ data }}</p>
    <button type="button" class="first">Primeiro</button>
    <button
      #menuTrigger
      type="button"
      class="open-menu"
      (click)="menu.toggle(menuTemplate)"
    >
      Menu
    </button>
    <button type="button" class="open-nested" (click)="openNested()">
      Aninhado
    </button>
    <ng-template #menuTemplate>
      <div class="menu-panel" style="width: 160px; height: 60px">
        <button type="button" class="menu-item">Item</button>
      </div>
    </ng-template>
  `,
  styles:
    ':host { display: block; width: 400px; padding: 16px; background: white; }',
})
class ModalContentComponent {
  readonly data = inject(ORC_DIALOG_DATA);
  readonly ref = inject(OrcModalRef);
  private readonly layer = inject(OrcModalLayer);
  readonly menuTrigger =
    viewChild.required<ElementRef<HTMLElement>>('menuTrigger');
  readonly menu = injectAnchoredOverlay({
    anchor: () => this.menuTrigger(),
    role: 'menu',
  });

  openNested(): void {
    this.layer.open(ModalContentComponent, {
      data: 'nested',
      ariaLabel: 'Aninhado',
    });
  }
}

@Component({
  selector: 'orc-test-toast-region',
  template: '<span class="toast-text">Salvo com sucesso</span>',
  styles:
    ':host { display: block; width: 240px; height: 48px; background: white; }',
})
class ToastRegionComponent {}

describe('internal/overlay', () => {
  let container: HTMLElement;

  afterEach(() => {
    document.body.style.minHeight = '';
  });

  describe('placement helpers', () => {
    it('maps placements to CDK connected positions', () => {
      expect(orcConnectedPosition('bottom-start', 4)).toEqual(
        jasmine.objectContaining({
          originX: 'start',
          overlayX: 'start',
          originY: 'bottom',
          overlayY: 'top',
          offsetY: 4,
        }),
      );
      expect(orcConnectedPosition('top-end', 6)).toEqual(
        jasmine.objectContaining({
          originX: 'end',
          originY: 'top',
          overlayY: 'bottom',
          offsetY: -6,
        }),
      );
      expect(orcConnectedPosition('right', 8)).toEqual(
        jasmine.objectContaining({
          originX: 'end',
          overlayX: 'start',
          originY: 'center',
          offsetX: 8,
        }),
      );
    });

    it('flips to the opposite side first, then tries the other alignments', () => {
      expect(orcPlacementFallbacks('bottom-start')).toEqual([
        'bottom-start',
        'top-start',
        'bottom',
        'bottom-end',
        'top',
        'top-end',
      ]);
      expect(orcPlacementFallbacks('left')[1]).toBe('right');
    });
  });

  describe('anchored layer', () => {
    function create(config: OrcAnchoredOverlayConfig = {}) {
      TestBed.configureTestingModule({
        providers: [{ provide: ANCHORED_CONFIG, useValue: config }],
      });
      const fixture = TestBed.createComponent(AnchoredHostComponent);
      fixture.detectChanges();
      container = TestBed.inject(OverlayContainer).getContainerElement();
      const host = fixture.componentInstance;
      return { fixture, host, trigger: host.trigger().nativeElement };
    }

    it('creates nothing and listens to nothing while closed', () => {
      const { host } = create();
      expect(host.overlay.isOpen()).toBeFalse();
      expect(host.overlay.overlayRef).toBeNull();
      expect(container.querySelector('.cdk-overlay-pane')).toBeNull();
      const keyboard = TestBed.inject(OverlayKeyboardDispatcher) as unknown as {
        _attachedOverlays: unknown[];
      };
      expect(keyboard._attachedOverlays.length).toBe(0);
    });

    it('opens next to the anchor with aria-expanded/aria-controls', async () => {
      const { host, trigger } = create();
      trigger.click();
      await settle();
      expect(host.overlay.isOpen()).toBeTrue();
      const content = container.querySelector('.panel-content');
      expect(content).not.toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      const panel = document.getElementById(host.overlay.panelId);
      expect(trigger.getAttribute('aria-controls')).toBe(host.overlay.panelId);
      expect(panel?.getAttribute('role')).toBe('dialog');
      expect(panel?.contains(content)).toBeTrue();
      expect(panel?.classList).toContain('orc-overlay-pane');
      // Placed under the anchor (bottom-start) or flipped above it.
      const anchorRect = trigger.getBoundingClientRect();
      const panelRect = panel!.getBoundingClientRect();
      if (panel!.classList.contains('orc-overlay-pane--bottom-start')) {
        expect(Math.round(panelRect.top)).toBeGreaterThanOrEqual(
          Math.floor(anchorRect.bottom),
        );
      } else {
        expect(panel!.classList).toContain('orc-overlay-pane--top-start');
        expect(Math.floor(panelRect.bottom)).toBeLessThanOrEqual(
          Math.ceil(anchorRect.top),
        );
      }
      expect(Math.round(panelRect.left)).toBe(Math.round(anchorRect.left));
    });

    it('closes on Escape and returns focus to the trigger', async () => {
      const { host, trigger } = create({ autoFocus: 'first-tabbable' });
      trigger.focus();
      trigger.click();
      await settle();
      expect(document.activeElement?.classList).toContain('inside');
      keydown('Escape');
      expect(host.overlay.isOpen()).toBeFalse();
      expect(host.reasons).toEqual(['escape']);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(trigger);
      expect(container.querySelector('.panel-content')).toBeNull();
    });

    it('closes on a click outside but not on the anchor itself', async () => {
      const { host, trigger, fixture } = create();
      trigger.click();
      await settle();
      // Clicking the anchor toggles once (programmatic), never "outside".
      pointerClick(trigger);
      expect(host.reasons).toEqual(['programmatic']);
      trigger.click();
      await settle();
      expect(host.overlay.isOpen()).toBeTrue();
      pointerClick(
        (fixture.nativeElement as HTMLElement).querySelector('.other')!,
      );
      expect(host.overlay.isOpen()).toBeFalse();
      expect(host.reasons).toEqual(['programmatic', 'outside']);
    });

    it('stays open on clicks inside the panel', async () => {
      const { host, trigger } = create();
      trigger.click();
      await settle();
      pointerClick(container.querySelector('.inside')!);
      expect(host.overlay.isOpen()).toBeTrue();
    });

    it('honours closeOnEscape/closeOnOutsideClick = false', async () => {
      const { host, trigger, fixture } = create({
        closeOnEscape: false,
        closeOnOutsideClick: false,
      });
      trigger.click();
      await settle();
      keydown('Escape');
      pointerClick(
        (fixture.nativeElement as HTMLElement).querySelector('.other')!,
      );
      expect(host.overlay.isOpen()).toBeTrue();
    });

    it('traps Tab inside the panel when trapFocus is set', async () => {
      const { trigger } = create({
        trapFocus: true,
        autoFocus: 'first-tabbable',
      });
      trigger.click();
      await settle();
      const anchors = container.querySelectorAll<HTMLElement>(
        '.cdk-focus-trap-anchor',
      );
      expect(anchors.length).toBe(2);
      anchors[1].focus();
      expect(document.activeElement?.classList).toContain('inside');
      anchors[0].focus();
      expect(document.activeElement?.classList).toContain('inside-2');
    });

    it('releases the CDK dispatchers after closing', async () => {
      const { host, trigger } = create();
      trigger.click();
      await settle();
      host.overlay.close();
      const keyboard = TestBed.inject(OverlayKeyboardDispatcher) as unknown as {
        _attachedOverlays: unknown[];
      };
      const outside = TestBed.inject(
        OverlayOutsideClickDispatcher,
      ) as unknown as { _attachedOverlays: unknown[] };
      expect(keyboard._attachedOverlays.length).toBe(0);
      expect(outside._attachedOverlays.length).toBe(0);
    });

    it('is disposed with its owner', async () => {
      const { fixture, trigger, host } = create();
      trigger.click();
      await settle();
      fixture.destroy();
      expect(host.reasons).toEqual(['destroy']);
      expect(container.querySelector('.panel-content')).toBeNull();
    });
  });

  describe('modal layer', () => {
    let opener: HTMLButtonElement;

    beforeEach(() => {
      opener = document.createElement('button');
      opener.textContent = 'Abrir modal';
      document.body.appendChild(opener);
      opener.focus();
      container = TestBed.inject(OverlayContainer).getContainerElement();
    });

    afterEach(() => opener.remove());

    const open = (config = {}) =>
      TestBed.inject(OrcModalLayer).open<string, string, ModalContentComponent>(
        ModalContentComponent,
        { data: 'dados', ariaLabelledBy: 'modal-heading', ...config },
      );

    it('opens an aria-modal dialog with data, ref and initial focus', async () => {
      const ref = open();
      await settle();
      const dialog = container.querySelector('[role="dialog"]')!;
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('modal-heading');
      expect(container.querySelector('.data')?.textContent).toBe('dados');
      expect(ref.componentInstance?.ref).toBe(ref);
      expect(document.activeElement?.classList).toContain('first');
      expect(container.querySelector('.orc-modal-pane')).not.toBeNull();
      expect(container.querySelector('.orc-modal-backdrop')).not.toBeNull();
    });

    it('closes on Escape, resolves the result and restores focus', async () => {
      const ref = open();
      await settle();
      keydown('Escape');
      await settle();
      expect(await ref.result).toBeUndefined();
      expect(TestBed.inject(OrcModalLayer).openModals.length).toBe(0);
      expect(document.activeElement).toBe(opener);
    });

    it('resolves the value passed to close()', async () => {
      const ref = open();
      ref.close('salvo');
      expect(await ref.result).toBe('salvo');
    });

    it('lets Escape and backdrop closing be turned off separately', async () => {
      const ref = open({ closeOnEscape: false });
      await settle();
      keydown('Escape');
      expect(TestBed.inject(OrcModalLayer).openModals).toEqual([ref]);
      (container.querySelector('.orc-modal-backdrop') as HTMLElement).click();
      expect(TestBed.inject(OrcModalLayer).openModals.length).toBe(0);

      open({ role: 'alertdialog' });
      await settle();
      (container.querySelector('.orc-modal-backdrop') as HTMLElement).click();
      expect(TestBed.inject(OrcModalLayer).openModals.length).toBe(1);
    });

    it('honours canClose for every close path', async () => {
      let allow = false;
      const ref = open({ canClose: () => allow });
      await settle();
      keydown('Escape');
      ref.close();
      expect(TestBed.inject(OrcModalLayer).openModals.length).toBe(1);
      allow = true;
      ref.close();
      expect(TestBed.inject(OrcModalLayer).openModals.length).toBe(0);
    });

    it('traps focus inside the modal (FocusTrap)', async () => {
      open();
      await settle();
      const anchors = container.querySelectorAll<HTMLElement>(
        '.cdk-focus-trap-anchor',
      );
      expect(anchors.length).toBe(2);
      anchors[1].focus();
      expect(document.activeElement?.classList).toContain('first');
      anchors[0].focus();
      expect(document.activeElement?.classList).toContain('open-nested');
    });

    it('blocks page scroll while open', async () => {
      document.body.style.minHeight = '4000px';
      const ref = open();
      await settle();
      expect(document.documentElement.classList).toContain(
        'cdk-global-scrollblock',
      );
      ref.close();
      expect(document.documentElement.classList).not.toContain(
        'cdk-global-scrollblock',
      );
    });

    it('stacks nested modals: Escape closes only the top one', async () => {
      open();
      await settle();
      const nestedTrigger =
        container.querySelector<HTMLElement>('.open-nested')!;
      nestedTrigger.focus();
      nestedTrigger.click();
      await settle();
      const layer = TestBed.inject(OrcModalLayer);
      expect(layer.openModals.length).toBe(2);
      const dialogs = container.querySelectorAll('[role="dialog"]');
      expect(isOnTop(dialogs[1].querySelector('.first')!)).toBeTrue();
      keydown('Escape');
      await settle();
      expect(layer.openModals.length).toBe(1);
      expect(
        (layer.openModals[0].componentInstance as ModalContentComponent).data,
      ).toBe('dados');
      expect(document.activeElement).toBe(nestedTrigger);
    });

    it('shows anchored panels opened from a modal above it', async () => {
      const ref = open();
      await settle();
      const trigger = container.querySelector<HTMLElement>('.open-menu')!;
      trigger.focus();
      trigger.click();
      await settle();
      const item = container.querySelector<HTMLElement>('.menu-item')!;
      expect(item).not.toBeNull();
      // Later in the overlay container and on top of the modal + backdrop.
      const modalHost = ref.overlayRef.hostElement;
      const menuHost = ref.componentInstance!.menu.overlayRef!.hostElement;
      expect(
        modalHost.compareDocumentPosition(menuHost) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(isOnTop(item)).toBeTrue();
      // Not hidden from assistive technology by the modal.
      expect(menuHost.closest('[aria-hidden="true"]')).toBeNull();
      // Clicking inside the panel does not close the panel nor the modal.
      pointerClick(item);
      expect(ref.componentInstance!.menu.isOpen()).toBeTrue();
      // Escape closes the panel only, focus goes back to its trigger.
      keydown('Escape');
      await settle();
      expect(ref.componentInstance!.menu.isOpen()).toBeFalse();
      expect(TestBed.inject(OrcModalLayer).openModals.length).toBe(1);
      expect(document.activeElement).toBe(trigger);
    });

    it('docks drawers to an edge', async () => {
      const ref = open({ drawer: 'end' });
      await settle();
      const pane = ref.overlayRef.overlayElement;
      expect(pane.classList).toContain('orc-modal-pane--drawer');
      expect(pane.classList).toContain('orc-modal-pane--drawer-end');
      expect(pane.style.height).toBe('100%');
      const rect = pane.getBoundingClientRect();
      expect(Math.round(rect.right)).toBe(document.documentElement.clientWidth);
    });
  });

  describe('toast layer', () => {
    it('keeps toasts above modals opened later', async () => {
      const layer = TestBed.inject(OrcToastLayer);
      layer.attach(ToastRegionComponent, { position: 'top-end' });
      await settle();
      const toast = document.querySelector<HTMLElement>('.toast-text')!;
      expect(isOnTop(toast)).toBeTrue();

      TestBed.inject(OrcModalLayer).open(ModalContentComponent, {
        data: 'x',
        ariaLabel: 'Modal',
      });
      await settle();
      expect(isOnTop(toast)).toBeTrue();
      expect(layer.hostElement?.closest('[aria-hidden="true"]')).toBeNull();
    });

    it('keeps toasts visible over a modal opened earlier while its panels open', async () => {
      const modal = TestBed.inject(OrcModalLayer).open(ModalContentComponent, {
        data: 'x',
        ariaLabel: 'Modal',
      });
      await settle();
      const layer = TestBed.inject(OrcToastLayer);
      layer.attach(ToastRegionComponent);
      await settle();
      container = TestBed.inject(OverlayContainer).getContainerElement();
      container.querySelector<HTMLElement>('.open-menu')!.click();
      await settle();
      expect(modal.componentInstance!.menu.isOpen()).toBeTrue();
      expect(isOnTop(document.querySelector('.toast-text')!)).toBeTrue();
    });

    it('moves and detaches the region', async () => {
      const layer = TestBed.inject(OrcToastLayer);
      layer.attach(ToastRegionComponent, { position: 'bottom-start' });
      await settle();
      const rect = layer
        .hostElement!.querySelector('.orc-toast-layer')!
        .getBoundingClientRect();
      expect(Math.round(rect.left)).toBe(0);
      expect(Math.round(rect.bottom)).toBe(
        document.documentElement.clientHeight,
      );
      expect(layer.isAttached()).toBeTrue();
      layer.detach();
      expect(layer.isAttached()).toBeFalse();
      expect(document.querySelector('.toast-text')).toBeNull();
    });
  });
});
