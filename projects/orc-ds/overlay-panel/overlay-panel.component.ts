import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterEveryRender,
  booleanAttribute,
  output,
  computed,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  eventIsInside,
  focusInitialElement,
  isTopOverlay,
  isolateModalBackground,
  listenForOutsideInteraction,
  lockDocumentScroll,
  overlayAttachmentTarget,
  registerOverlay,
  trapTabKey,
} from '@ciag/orchestra/internal';

import {
  positionOverlayPanel,
  OverlayPanelPlacement,
  OverlayPanelAlign,
} from './overlay-panel-position';
export type {
  OverlayPanelPlacement,
  OverlayPanelAlign,
} from './overlay-panel-position';
let nextOverlayPanelId = 0;

@Component({
  selector: 'orc-overlay-panel',
  standalone: true,
  templateUrl: './overlay-panel.component.html',
  styleUrl: './overlay-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayPanelComponent implements OnDestroy {
  readonly componentKind: 'overlaypanel' | 'popover' = 'overlaypanel';
  readonly visible = model(false);
  readonly modal = input(false, { transform: booleanAttribute });
  readonly dismissable = input(true, { transform: booleanAttribute });
  readonly closable = input(false, { transform: booleanAttribute });
  readonly showCloseIcon = input(false, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly closeLabel = input<string | undefined>(undefined);
  readonly ariaCloseLabel = input<string | undefined>(undefined);
  readonly style = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly styleClass = input('');
  readonly appendTo = input<unknown>(undefined);
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  readonly focusOnShow = input(true, { transform: booleanAttribute });
  readonly showTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
  readonly hideTransitionOptions = input('100ms linear');
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly onClick = output<MouseEvent>();
  readonly computedZIndex = computed(() =>
    this.autoZIndex() ? this.baseZIndex() + 1 : this.baseZIndex(),
  );

  readonly open = model(false);
  readonly placement = input<OverlayPanelPlacement>('bottom');
  readonly align = input<OverlayPanelAlign>('start');
  readonly label = input<string | undefined>(undefined);
  readonly header = input('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private get ownerDocument(): Document {
    return this.host.nativeElement.ownerDocument ?? this.document;
  }
  private readonly instanceId = ++nextOverlayPanelId;
  readonly panelId = computed(
    () => this.id() || `orc-${this.componentKind}-${this.instanceId}`,
  );
  readonly defaultLabel = computed(() =>
    this.componentKind === 'popover' ? 'Popover' : 'Overlay panel',
  );
  readonly defaultCloseLabel = computed(() =>
    this.componentKind === 'popover' ? 'Close popover' : 'Close panel',
  );
  readonly panelClassNames = computed(
    () =>
      `orc-popover orc-overlay-surface p-component p-${this.componentKind} orc-p2-${this.componentKind === 'popover' ? 'popover' : 'overlay-panel'} orc-popover--${this.placement()} orc-popover--align-${this.align()} ${this.styleClass()}`,
  );
  readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private hasTrigger = false;
  private previousOpen = false;
  private previousVisible = false;
  private active = false;
  private previousFocus: HTMLElement | null = null;
  private anchor: HTMLElement | null = null;
  private cleanup: (() => void)[] = [];
  private releaseScroll?: () => void;
  private releaseIsolation?: () => void;
  private triggerControl: HTMLElement | null = null;
  private originalTriggerAttributes = new Map<string, string | null>();
  private focused = false;
  private restoreOnHide = true;

  constructor() {
    effect(() => {
      const open = this.open();
      const visible = this.visible();
      const next =
        open !== this.previousOpen
          ? open
          : visible !== this.previousVisible
            ? visible
            : open;
      this.previousOpen = this.previousVisible = next;
      if (open !== next) this.open.set(next);
      if (visible !== next) this.visible.set(next);
    });
    afterEveryRender(() => this.syncView());
  }

  toggle(event?: Event, target?: HTMLElement): void {
    if (this.open()) this.close();
    else this.show(event, target);
  }
  show(event?: Event, target?: HTMLElement): void {
    const currentTarget = event?.currentTarget as HTMLElement | null;
    const ownerDocument = currentTarget?.ownerDocument;
    const HTMLElementConstructor = ownerDocument?.defaultView?.HTMLElement;
    this.anchor =
      target ??
      (HTMLElementConstructor && currentTarget instanceof HTMLElementConstructor
        ? currentTarget
        : null) ??
      this.triggerControl;
    if (!this.open()) {
      this.open.set(true);
      this.visible.set(true);
    }
  }
  close(restoreFocus = true): void {
    if (!this.open()) return;
    this.restoreOnHide = restoreFocus;
    this.open.set(false);
    this.visible.set(false);
    if (restoreFocus && this.previousFocus?.isConnected)
      this.previousFocus.focus({ preventScroll: true });
  }
  hide(): void {
    this.close(true);
  }

  onTriggerClick(event: MouseEvent): void {
    if (
      (event.target as HTMLElement).closest(':disabled, [aria-disabled="true"]')
    )
      return;
    this.toggle(event, this.triggerControl ?? this.trigger()?.nativeElement);
  }
  onTriggerKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest(':disabled, [aria-disabled="true"]')) return;
    const nativeActivation = target.matches('button, input, a[href]');
    if (
      event.key === 'ArrowDown' ||
      (!nativeActivation && (event.key === 'Enter' || event.key === ' '))
    ) {
      event.preventDefault();
      this.show(event, this.triggerControl ?? this.trigger()?.nativeElement);
    }
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    const panel = this.panel()?.nativeElement;
    if (
      !this.open() ||
      !panel ||
      !isTopOverlay(panel) ||
      event.defaultPrevented
    )
      return;
    if (event.key === 'Escape' && this.closeOnEscape()) {
      event.preventDefault();
      this.close(true);
    } else if (this.modal()) trapTabKey(event, panel);
  }
  onEscape(): void {
    if (this.closeOnEscape()) this.close(true);
  }
  onDocumentClick(event: MouseEvent): void {
    const panel = this.panel()?.nativeElement;
    if (!panel || isTopOverlay(panel)) this.onOutside(event);
  }
  onOutside(event: MouseEvent): void {
    if (
      this.open() &&
      this.dismissable() &&
      !eventIsInside(event, [
        this.host.nativeElement,
        this.panel()?.nativeElement,
        this.anchor,
      ])
    )
      this.close(this.modal());
  }

  private syncView(): void {
    const panel = this.panel()?.nativeElement;
    const trigger = this.trigger()?.nativeElement;
    if (!panel || !trigger) return;
    this.hasTrigger =
      !!trigger.textContent?.trim() || !!trigger.firstElementChild;
    trigger.hidden = !this.hasTrigger;
    const control = trigger.querySelector<HTMLElement>(
      'button, a[href], input, [role="button"], [tabindex]',
    );
    if (control) {
      for (const name of [
        'role',
        'tabindex',
        'aria-expanded',
        'aria-controls',
        'aria-haspopup',
      ])
        trigger.removeAttribute(name);
    } else {
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', this.hasTrigger ? '0' : '-1');
      trigger.setAttribute('aria-expanded', String(this.open()));
      trigger.setAttribute('aria-haspopup', 'dialog');
      if (this.open()) trigger.setAttribute('aria-controls', this.panelId());
      else trigger.removeAttribute('aria-controls');
    }
    if (control !== this.triggerControl) {
      this.restoreTriggerAttributes();
      this.triggerControl = control;
      if (control)
        for (const name of ['aria-expanded', 'aria-controls', 'aria-haspopup'])
          this.originalTriggerAttributes.set(name, control.getAttribute(name));
    }
    if (control) {
      control.setAttribute('aria-expanded', String(this.open()));
      control.setAttribute('aria-haspopup', 'dialog');
      if (this.open()) control.setAttribute('aria-controls', this.panelId());
      else if (this.originalTriggerAttributes.get('aria-controls'))
        control.setAttribute(
          'aria-controls',
          this.originalTriggerAttributes.get('aria-controls')!,
        );
      else control.removeAttribute('aria-controls');
    }
    // A global render callback may run while a different root is rendering.
    // Wait until this view has applied the requested visibility before focusing.
    if (panel.hidden === this.open()) return;
    if (this.open()) {
      if (!this.active) {
        this.active = true;
        this.restoreOnHide = true;
        this.previousFocus = this.ownerDocument
          .activeElement as HTMLElement | null;
        this.anchor ??=
          control ?? (this.hasTrigger ? trigger : this.host.nativeElement);
        this.cleanup.push(
          registerOverlay(panel, {
            anchor: this.anchor,
            onParentClose: () => {
              this.close(false);
              this.releaseIsolation?.();
              this.releaseIsolation = undefined;
            },
          }),
        );
        const keydown = (event: KeyboardEvent) => this.onDocumentKeydown(event);
        this.ownerDocument.addEventListener('keydown', keydown);
        this.cleanup.push(() =>
          this.ownerDocument.removeEventListener('keydown', keydown),
        );
        this.cleanup.push(
          listenForOutsideInteraction(
            this.ownerDocument,
            () => [this.host.nativeElement, panel, this.anchor],
            (event) => {
              if (isTopOverlay(panel)) this.onOutside(event);
            },
          ),
        );
        const reposition = () => this.positionPanel();
        this.ownerDocument.addEventListener('scroll', reposition, true);
        this.ownerDocument.defaultView?.addEventListener('resize', reposition);
        this.cleanup.push(() => {
          this.ownerDocument.removeEventListener('scroll', reposition, true);
          this.ownerDocument.defaultView?.removeEventListener(
            'resize',
            reposition,
          );
        });
        const ResizeObserverConstructor =
          this.ownerDocument.defaultView?.ResizeObserver;
        if (ResizeObserverConstructor) {
          const observer = new ResizeObserverConstructor(reposition);
          observer.observe(panel);
          if (this.anchor) observer.observe(this.anchor);
          this.cleanup.push(() => observer.disconnect());
        }
        this.onShow.emit();
      }
      this.attachPanel(panel);
      this.positionPanel();
      if (this.modal() && !this.releaseIsolation)
        this.releaseIsolation = isolateModalBackground(panel);
      if (!this.modal() && this.releaseIsolation) {
        this.releaseIsolation();
        this.releaseIsolation = undefined;
      }
      if (this.modal() && !this.releaseScroll)
        this.releaseScroll = lockDocumentScroll(this.ownerDocument);
      if (!this.modal() && this.releaseScroll) {
        this.releaseScroll();
        this.releaseScroll = undefined;
      }
      if (!this.focused) {
        this.focused = true;
        if (this.focusOnShow()) {
          focusInitialElement(panel);
        }
      }
    } else if (this.active) {
      this.releaseResources();
      if (this.restoreOnHide && this.previousFocus?.isConnected)
        this.previousFocus.focus({ preventScroll: true });
      this.host.nativeElement.appendChild(panel);
      this.onHide.emit();
    }
  }

  private attachPanel(panel: HTMLElement): void {
    const parent = overlayAttachmentTarget(
      this.anchor ?? this.host.nativeElement,
      this.appendTo(),
      this.host.nativeElement,
    );
    if (
      parent !== panel &&
      !panel.contains(parent) &&
      panel.parentElement !== parent
    )
      parent.appendChild(panel);
  }

  private positionPanel(): void {
    const panel = this.panel()?.nativeElement;
    const anchor = this.anchor ?? this.host.nativeElement;
    const window = this.ownerDocument.defaultView;
    if (!this.open() || !panel?.isConnected || !window) return;
    const origin = anchor.getBoundingClientRect();
    const rect = panel.getBoundingClientRect();
    let { left, top, placement } = positionOverlayPanel(
      origin,
      rect,
      { width: window.innerWidth, height: window.innerHeight },
      this.placement(),
      this.align(),
      window.getComputedStyle(anchor).direction === 'rtl',
    );
    panel.dataset['placement'] = placement;
    // Fixed positioning is relative to the viewport unless a transformed parent
    // establishes a containing block. Local placement uses the actual offset parent.
    panel.style.position =
      panel.parentElement === this.ownerDocument.body ? 'fixed' : 'absolute';
    const offset =
      panel.style.position === 'absolute'
        ? (panel.offsetParent as HTMLElement | null)
        : null;
    if (
      offset === this.ownerDocument.body &&
      window.getComputedStyle(offset).position === 'static'
    ) {
      left += window.scrollX;
      top += window.scrollY;
    } else if (offset) {
      const bounds = offset.getBoundingClientRect();
      left -= bounds.left + offset.clientLeft - offset.scrollLeft;
      top -= bounds.top + offset.clientTop - offset.scrollTop;
    }
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  private restoreTriggerAttributes(): void {
    if (this.triggerControl)
      for (const [name, value] of this.originalTriggerAttributes) {
        if (value === null) this.triggerControl.removeAttribute(name);
        else this.triggerControl.setAttribute(name, value);
      }
    this.originalTriggerAttributes.clear();
    this.triggerControl = null;
  }
  private releaseResources(): void {
    this.releaseIsolation?.();
    this.releaseIsolation = undefined;
    this.cleanup.splice(0).forEach((cleanup) => cleanup());
    this.releaseScroll?.();
    this.releaseScroll = undefined;
    this.active = false;
    this.focused = false;
    this.anchor = null;
  }
  ngOnDestroy(): void {
    const shouldRestoreFocus = this.active && this.restoreOnHide;
    const previousFocus = this.previousFocus;
    this.releaseResources();
    this.restoreTriggerAttributes();
    const panel = this.panel()?.nativeElement;
    panel?.remove();
    if (shouldRestoreFocus && previousFocus?.isConnected)
      previousFocus.focus({ preventScroll: true });
  }
}

/** Co-located with the base so JIT and split bundles initialize inheritance atomically. */
@Component({
  selector: 'orc-popover',
  standalone: true,
  templateUrl: './overlay-panel.component.html',
  styleUrl: './overlay-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent extends OverlayPanelComponent {
  override readonly componentKind = 'popover' as const;
}
