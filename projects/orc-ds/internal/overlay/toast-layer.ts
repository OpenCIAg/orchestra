import {
  ComponentRef,
  EmbeddedViewRef,
  inject,
  Injectable,
  Injector,
  OnDestroy,
  Signal,
  signal,
  TemplateRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import {
  createGlobalPositionStrategy,
  createNoopScrollStrategy,
  GlobalPositionStrategy,
  OverlayContainer,
  createOverlayRef,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';

/** Viewport corner/edge where the toast region sits. */
export type OrcToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

/**
 * The single region for toasts, always stacked above modals and anchored
 * panels.
 *
 * It is a global CDK overlay created on the first `attach()`. While attached
 * it watches the overlay container (a `MutationObserver`, not a document
 * listener) and re-raises itself whenever another overlay opens, so a toast
 * shown before a modal opens stays visible and clickable above it. Modals
 * hide the page from assistive technology with `aria-hidden` on the siblings
 * of the overlay container; the toast region lives inside the container and
 * stays announced.
 *
 * The toast family attaches one container component (live region, list of
 * toasts) and keeps it attached:
 *
 * ```ts
 * const layer = inject(OrcToastLayer);
 * const host = layer.attach(ToastRegionComponent, { position: 'top-end' });
 * host.setInput('toasts', this.toasts());
 * ```
 */
@Injectable({ providedIn: 'root' })
export class OrcToastLayer implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly overlayContainer = inject(OverlayContainer);
  private readonly attachedState = signal(false);
  private ref: OverlayRef | null = null;
  private observer: MutationObserver | null = null;
  private position: OrcToastPosition = 'top-end';

  /** Whether content is attached. */
  readonly isAttached: Signal<boolean> = this.attachedState.asReadonly();

  /** Host element of the region while attached (tests and advanced use). */
  get hostElement(): HTMLElement | null {
    return this.ref?.hostElement ?? null;
  }

  /** Attaches a component as the region content, replacing any previous content. */
  attach<T>(
    component: Type<T>,
    options: { position?: OrcToastPosition; injector?: Injector } = {},
  ): ComponentRef<T> {
    const ref = this.prepare(options.position);
    return ref.attach(
      new ComponentPortal(component, null, options.injector ?? this.injector),
    ) as ComponentRef<T>;
  }

  /** Attaches a template as the region content, replacing any previous content. */
  attachTemplate<C>(
    template: TemplateRef<C>,
    viewContainerRef: ViewContainerRef,
    options: { context?: C; position?: OrcToastPosition } = {},
  ): EmbeddedViewRef<C> {
    const ref = this.prepare(options.position);
    return ref.attach(
      new TemplatePortal(template, viewContainerRef, options.context),
    ) as EmbeddedViewRef<C>;
  }

  /** Moves the region to another corner/edge. */
  setPosition(position: OrcToastPosition): void {
    this.position = position;
    if (this.ref) {
      this.ref.updatePositionStrategy(this.positionStrategy(position));
    }
  }

  /** Removes the region and stops watching the overlay container. */
  detach(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.ref?.dispose();
    this.ref = null;
    this.attachedState.set(false);
  }

  /** Re-stacks the region above every other overlay. Called automatically. */
  raise(): void {
    const host = this.ref?.hostElement;
    if (!host?.isConnected) return;
    if (host.hasAttribute('popover')) {
      try {
        host.hidePopover();
        host.showPopover();
      } catch {
        /* not shown yet */
      }
    } else if (host.nextSibling) {
      host.parentElement?.appendChild(host);
    }
  }

  ngOnDestroy(): void {
    this.detach();
  }

  private prepare(position?: OrcToastPosition): OverlayRef {
    if (position) this.position = position;
    if (this.ref) {
      if (this.ref.hasAttached()) this.ref.detach();
      this.ref.updatePositionStrategy(this.positionStrategy(this.position));
      return this.ref;
    }
    this.ref = createOverlayRef(this.injector, {
      positionStrategy: this.positionStrategy(this.position),
      scrollStrategy: createNoopScrollStrategy(),
      panelClass: 'orc-toast-layer',
      hasBackdrop: false,
      disposeOnNavigation: false,
    });
    this.attachedState.set(true);
    this.watch();
    return this.ref;
  }

  private watch(): void {
    if (typeof MutationObserver === 'undefined' || this.observer) return;
    const container = this.overlayContainer.getContainerElement();
    this.observer = new MutationObserver((records) => {
      const host = this.ref?.hostElement;
      const another = records.some((record) =>
        Array.from(record.addedNodes).some((node) => node !== host),
      );
      if (another) this.raise();
    });
    this.observer.observe(container, { childList: true });
  }

  private positionStrategy(position: OrcToastPosition): GlobalPositionStrategy {
    const strategy = createGlobalPositionStrategy(this.injector);
    const [vertical, horizontal] = position.split('-');
    if (vertical === 'top') strategy.top('0');
    else strategy.bottom('0');
    if (horizontal === 'start') strategy.start('0');
    else if (horizontal === 'end') strategy.end('0');
    else strategy.centerHorizontally();
    return strategy;
  }
}
