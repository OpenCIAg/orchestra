import {
  ComponentRef,
  DestroyRef,
  ElementRef,
  EmbeddedViewRef,
  inject,
  Injector,
  Signal,
  signal,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { _IdGenerator, FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import {
  ConnectedPosition,
  createCloseScrollStrategy,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  OverlayRef,
} from '@angular/cdk/overlay';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { ComponentPortal, Portal, TemplatePortal } from '@angular/cdk/portal';
import { Observable, Subject, Subscription } from 'rxjs';

/** Side and alignment of an anchored panel relative to its anchor. */
export type OrcOverlayPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'left-start'
  | 'left'
  | 'left-end'
  | 'right-start'
  | 'right'
  | 'right-end';

/** Why an anchored panel closed. */
export type OrcOverlayCloseReason =
  'escape' | 'outside' | 'programmatic' | 'detached' | 'destroy';

/** Something an anchored panel can be positioned against. */
export type OrcOverlayAnchor = HTMLElement | ElementRef<HTMLElement>;

/** Content accepted by `OrcAnchoredOverlay.open`. */
export type OrcOverlayContent<C = unknown> =
  TemplateRef<C> | Type<C> | Portal<unknown>;

/** Options of an anchored panel (popover, menu, select, datepicker, tooltip). */
export interface OrcAnchoredOverlayConfig {
  /**
   * Element the panel is positioned against and that receives
   * `aria-expanded`/`aria-controls`. A function is resolved at every `open()`
   * (handy with `viewChild`). Defaults to the host element of the caller.
   */
  anchor?: OrcOverlayAnchor | (() => OrcOverlayAnchor | null | undefined);
  /** Preferred placement. Default `'bottom-start'`. */
  placement?: OrcOverlayPlacement;
  /** Ordered fallbacks used when the preferred placement does not fit. Default: flip to the opposite side, then the other alignments. */
  fallbackPlacements?: readonly OrcOverlayPlacement[];
  /** Gap in px between anchor and panel. Default 4. */
  offset?: number;
  /** Minimum distance in px from the viewport edges. Default 8. */
  viewportMargin?: number;
  /** Panel is at least as wide as the anchor (select, autocomplete). Default false. */
  matchAnchorWidth?: boolean;
  /** Close on Escape (only the topmost overlay receives it). Default true. */
  closeOnEscape?: boolean;
  /** Close on pointer interaction outside the panel and the anchor. Default true. */
  closeOnOutsideClick?: boolean;
  /** Return focus to the previously focused element (or the anchor) when focus was inside the panel on close. Default true. */
  restoreFocus?: boolean;
  /** Move focus into the panel on open. `'first-tabbable'`, `'panel'` (the pane itself) or false. Default false: list-type panels keep focus on the trigger and use aria-activedescendant. */
  autoFocus?: false | 'first-tabbable' | 'panel';
  /** Trap Tab inside the panel while open (popover with form content). Default false. */
  trapFocus?: boolean;
  /**
   * ARIA role applied to the overlay pane, which then also receives
   * `panelId`. When null (default), the caller must render its own root
   * element with `[id]="overlay.panelId"` so `aria-controls` resolves.
   */
  role?: string | null;
  /** Manage `aria-expanded` and `aria-controls` on the anchor. Default true. */
  manageAria?: boolean;
  /** Extra classes on the overlay pane. `orc-overlay-pane` is always added. */
  panelClass?: string | readonly string[];
  /** What happens when an ancestor scrolls. Default `'reposition'`. */
  scroll?: 'reposition' | 'close';
}

const OPPOSITE: Record<string, string> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** Splits `'bottom-start'` into `['bottom', 'start']`. */
function splitPlacement(
  placement: OrcOverlayPlacement,
): [string, 'start' | 'center' | 'end'] {
  const [side, align] = placement.split('-');
  return [side, (align as 'start' | 'end' | undefined) ?? 'center'];
}

/** Translates an Orchestra placement into a CDK connected position. */
export function orcConnectedPosition(
  placement: OrcOverlayPlacement,
  offset = 4,
): ConnectedPosition {
  const [side, align] = splitPlacement(placement);
  const panelClass = `orc-overlay-pane--${placement}`;
  if (side === 'top' || side === 'bottom') {
    const below = side === 'bottom';
    return {
      originX: align,
      overlayX: align,
      originY: below ? 'bottom' : 'top',
      overlayY: below ? 'top' : 'bottom',
      offsetY: below ? offset : -offset,
      panelClass,
    };
  }
  const vertical =
    align === 'start' ? 'top' : align === 'end' ? 'bottom' : 'center';
  const after = side === 'right';
  return {
    originX: after ? 'end' : 'start',
    overlayX: after ? 'start' : 'end',
    originY: vertical,
    overlayY: vertical,
    offsetX: after ? offset : -offset,
    panelClass,
  };
}

/** Default fallback order: preferred, flipped, then the other alignments on both sides. */
export function orcPlacementFallbacks(
  placement: OrcOverlayPlacement,
): OrcOverlayPlacement[] {
  const [side, align] = splitPlacement(placement);
  const flipped = OPPOSITE[side];
  const aligns = ['start', 'center', 'end'].filter((item) => item !== align);
  const name = (s: string, a: string) =>
    (a === 'center' ? s : `${s}-${a}`) as OrcOverlayPlacement;
  return [
    placement,
    name(flipped, align),
    ...aligns.map((a) => name(side, a)),
    ...aligns.map((a) => name(flipped, a)),
  ];
}

function resolveElement(
  anchor: OrcOverlayAnchor | null | undefined,
): HTMLElement | null {
  if (!anchor) return null;
  return anchor instanceof ElementRef ? anchor.nativeElement : anchor;
}

/** True when the element lives inside an open native `<dialog>` shown with `showModal()`. */
function insideNativeModal(element: HTMLElement): boolean {
  const dialog = element.closest('dialog');
  if (!dialog?.open) return false;
  try {
    return dialog.matches(':modal');
  } catch {
    return false;
  }
}

/**
 * One anchored panel bound to one anchor: popover, menu, select/autocomplete
 * panel, datepicker, tooltip. Create it with `injectAnchoredOverlay()`.
 *
 * Built on `@angular/cdk/overlay`: `FlexibleConnectedPositionStrategy` with
 * flip, `reposition` scroll strategy, `OverlayKeyboardDispatcher` (Escape
 * reaches only the topmost overlay) and `OverlayOutsideClickDispatcher`.
 * Nothing is created and no document listener exists while closed; every
 * open creates a fresh `OverlayRef` that is disposed on close.
 *
 * Stacking: every Orchestra layer uses the CDK default (`usePopover: true`,
 * browser top layer), so a panel opened from inside a modal is shown after
 * (above) that modal. When the anchor sits inside a legacy native
 * `<dialog>` opened with `showModal()`, the panel is inserted inline next to
 * the anchor so it is neither inert nor hidden behind the dialog.
 */
export class OrcAnchoredOverlay {
  private readonly openState = signal(false);
  private readonly closedSubject = new Subject<OrcOverlayCloseReason>();
  private readonly openedSubject = new Subject<void>();
  private ref: OverlayRef | null = null;
  private anchorElement: HTMLElement | null = null;
  private previouslyFocused: HTMLElement | null = null;
  private focusTrap: FocusTrap | null = null;
  private subscriptions = new Subscription();
  private disposed = false;

  /** Whether the panel is attached. */
  readonly isOpen: Signal<boolean> = this.openState.asReadonly();
  /** Stable id for the panel; referenced by `aria-controls` on the anchor. */
  readonly panelId: string;
  /** Emits after every close with its reason. */
  readonly closed: Observable<OrcOverlayCloseReason> =
    this.closedSubject.asObservable();
  /** Emits after the content is attached and positioned. */
  readonly opened: Observable<void> = this.openedSubject.asObservable();

  constructor(
    private readonly injector: Injector,
    private readonly config: OrcAnchoredOverlayConfig = {},
    private readonly defaultAnchor: HTMLElement | null = null,
    private readonly viewContainerRef: ViewContainerRef | null = null,
  ) {
    this.panelId = injector.get(_IdGenerator).getId('orc-overlay-panel-');
  }

  /** The live CDK overlay while open (advanced use and tests). */
  get overlayRef(): OverlayRef | null {
    return this.ref;
  }

  /** The anchor resolved at the last `open()`. */
  get anchor(): HTMLElement | null {
    return this.anchorElement;
  }

  /**
   * Attaches `content` next to the anchor. Returns the created view or
   * component ref; if already open, closes the previous content first.
   * A `TemplateRef` needs a `ViewContainerRef`, taken from the injection
   * context of `injectAnchoredOverlay()` or passed explicitly.
   */
  open<C>(
    content: OrcOverlayContent<C>,
    options: {
      context?: C;
      viewContainerRef?: ViewContainerRef;
      injector?: Injector;
    } = {},
  ): ComponentRef<C> | EmbeddedViewRef<C> {
    if (this.disposed) throw new Error('OrcAnchoredOverlay was disposed.');
    if (this.ref) this.close('programmatic');

    const anchorSource = this.config.anchor;
    const anchor =
      resolveElement(
        typeof anchorSource === 'function' ? anchorSource() : anchorSource,
      ) ?? this.defaultAnchor;
    if (!anchor) throw new Error('OrcAnchoredOverlay: no anchor element.');
    this.anchorElement = anchor;
    this.previouslyFocused = _getFocusedElementPierceShadowDom();

    const placement = this.config.placement ?? 'bottom-start';
    const offset = this.config.offset ?? 4;
    const placements =
      this.config.fallbackPlacements ?? orcPlacementFallbacks(placement);
    const positionStrategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      anchor,
    )
      .withPositions(placements.map((p) => orcConnectedPosition(p, offset)))
      .withFlexibleDimensions(false)
      .withPush(true)
      .withViewportMargin(this.config.viewportMargin ?? 8)
      .withPopoverLocation(insideNativeModal(anchor) ? 'inline' : 'global');

    const extra = this.config.panelClass ?? [];
    const ref = createOverlayRef(this.injector, {
      positionStrategy,
      scrollStrategy:
        this.config.scroll === 'close'
          ? createCloseScrollStrategy(this.injector)
          : createRepositionScrollStrategy(this.injector),
      panelClass: [
        'orc-overlay-pane',
        ...(typeof extra === 'string' ? [extra] : extra),
      ],
      minWidth: this.config.matchAnchorWidth
        ? anchor.getBoundingClientRect().width
        : undefined,
      hasBackdrop: false,
    });
    this.ref = ref;

    const pane = ref.overlayElement;
    if (this.config.role) {
      pane.id = this.panelId;
      pane.setAttribute('role', this.config.role);
    }

    const attached = ref.attach(this.toPortal(content, options)) as
      ComponentRef<C> | EmbeddedViewRef<C>;
    this.openState.set(true);
    this.setAnchorAria(true);
    this.listen(ref);
    this.applyFocus(pane);
    ref.updatePosition();
    this.openedSubject.next();
    return attached;
  }

  /** Closes the panel; no-op when closed. */
  close(reason: OrcOverlayCloseReason = 'programmatic'): void {
    const ref = this.ref;
    if (!ref) return;
    const pane = ref.overlayElement;
    const active = _getFocusedElementPierceShadowDom();
    const focusWasInside =
      !active ||
      active === pane.ownerDocument.body ||
      pane.contains(active) ||
      ref.hostElement.contains(active);

    this.ref = null;
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.focusTrap?.destroy();
    this.focusTrap = null;
    ref.dispose();
    this.openState.set(false);
    this.setAnchorAria(false);

    if (
      this.config.restoreFocus !== false &&
      reason !== 'destroy' &&
      (focusWasInside || reason === 'escape')
    ) {
      const target =
        this.previouslyFocused?.isConnected &&
        this.previouslyFocused !== pane.ownerDocument.body
          ? this.previouslyFocused
          : this.anchorElement;
      target?.focus();
    }
    this.previouslyFocused = null;
    this.closedSubject.next(reason);
  }

  /** Opens with `content` when closed, closes otherwise. */
  toggle<C>(
    content: OrcOverlayContent<C>,
    options?: { context?: C; viewContainerRef?: ViewContainerRef },
  ): void {
    if (this.ref) this.close('programmatic');
    else this.open(content, options);
  }

  /** Recomputes the position (after the content or the anchor changed size). */
  updatePosition(): void {
    this.ref?.updatePosition();
  }

  /** Closes and releases everything. Called automatically on destroy of the creating context. */
  dispose(): void {
    if (this.disposed) return;
    this.close('destroy');
    this.disposed = true;
    if (this.anchorElement && this.config.manageAria !== false) {
      this.anchorElement.removeAttribute('aria-controls');
    }
    this.closedSubject.complete();
    this.openedSubject.complete();
  }

  private toPortal<C>(
    content: OrcOverlayContent<C>,
    options: {
      context?: C;
      viewContainerRef?: ViewContainerRef;
      injector?: Injector;
    },
  ): Portal<unknown> {
    if (content instanceof Portal) return content;
    if (content instanceof TemplateRef) {
      const vcr = options.viewContainerRef ?? this.viewContainerRef;
      if (!vcr) {
        throw new Error(
          'OrcAnchoredOverlay: opening a TemplateRef requires a ViewContainerRef.',
        );
      }
      return new TemplatePortal(
        content,
        vcr,
        options.context,
        options.injector,
      );
    }
    return new ComponentPortal(
      content,
      options.viewContainerRef ?? this.viewContainerRef,
      options.injector ?? this.injector,
    );
  }

  private listen(ref: OverlayRef): void {
    // Always listen to keydown so that Escape stops at the topmost overlay
    // (the CDK dispatcher only delivers to overlays with subscribers).
    this.subscriptions.add(
      ref.keydownEvents().subscribe((event) => {
        if (
          event.key === 'Escape' &&
          !hasModifierKey(event) &&
          this.config.closeOnEscape !== false
        ) {
          event.preventDefault();
          this.close('escape');
        }
      }),
    );
    if (this.config.closeOnOutsideClick !== false) {
      this.subscriptions.add(
        ref.outsidePointerEvents().subscribe((event) => {
          const target = (event.composedPath?.()[0] ??
            event.target) as Node | null;
          if (target && this.anchorElement?.contains(target)) return;
          this.close('outside');
        }),
      );
    }
    this.subscriptions.add(
      ref.detachments().subscribe(() => {
        if (this.ref === ref) this.close('detached');
      }),
    );
  }

  private applyFocus(pane: HTMLElement): void {
    const { autoFocus, trapFocus } = this.config;
    if (!autoFocus && !trapFocus) return;
    if (trapFocus || autoFocus === 'first-tabbable') {
      this.focusTrap = this.injector
        .get(FocusTrapFactory)
        .create(pane, !trapFocus);
    }
    if (autoFocus === 'panel') {
      if (!pane.hasAttribute('tabindex')) pane.tabIndex = -1;
      pane.focus();
    } else if (autoFocus === 'first-tabbable') {
      this.focusTrap?.focusInitialElementWhenReady();
    }
  }

  private setAnchorAria(expanded: boolean): void {
    const anchor = this.anchorElement;
    if (!anchor || this.config.manageAria === false) return;
    anchor.setAttribute('aria-expanded', String(expanded));
    anchor.setAttribute('aria-controls', this.panelId);
  }
}

/**
 * Creates an `OrcAnchoredOverlay` owned by the calling component/directive.
 * Must run in an injection context; the overlay is disposed with it.
 *
 * ```ts
 * private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
 * private readonly panel = injectAnchoredOverlay({
 *   anchor: () => this.trigger(),
 *   placement: 'bottom-start',
 *   matchAnchorWidth: true,
 * });
 * constructor() {
 *   this.panel.closed.subscribe(() => this.open.set(false));
 * }
 * show() { this.panel.open(this.panelTemplate()); }
 * ```
 */
export function injectAnchoredOverlay(
  config: OrcAnchoredOverlayConfig = {},
): OrcAnchoredOverlay {
  const injector = inject(Injector);
  const host = inject(ElementRef, { optional: true })?.nativeElement;
  const overlay = new OrcAnchoredOverlay(
    injector,
    config,
    host?.nodeType === 1 ? (host as HTMLElement) : null,
    inject(ViewContainerRef, { optional: true }),
  );
  inject(DestroyRef).onDestroy(() => overlay.dispose());
  return overlay;
}
