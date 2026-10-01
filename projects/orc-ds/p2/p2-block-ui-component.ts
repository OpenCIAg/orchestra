import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  Injector,
  OnDestroy,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { P2_SHARED_STYLES } from './p2-shared';

export type BlockUiTarget =
  | HTMLElement
  | ElementRef<HTMLElement>
  | { getBlockableElement(): HTMLElement }
  | string
  | null;

@Component({
  selector: 'orc-block-ui',
  standalone: true,
  template: `
    <div
      class="orc-block-ui-content"
      [attr.inert]="blockLocalContent() ? '' : null"
    >
      <ng-content />
    </div>
    @if (showOverlay()) {
      <div
        #overlay
        class="p-blockui p-component orc-block-ui"
        [class]="'p-blockui p-component orc-block-ui ' + styleClass()"
        [style]="overlayStyles()"
        [attr.data-pc-name]="'blockui'"
      >
        <span>{{ message() }}</span>
      </div>
    }
  `,
  host: { '[attr.aria-busy]': "blockLocalContent() ? 'true' : null" },
  styles: [
    P2_SHARED_STYLES +
      `:host{position:relative;display:block}.orc-block-ui-content{display:contents}.orc-block-ui{position:absolute;inset:0;z-index:20;display:grid;place-items:center;pointer-events:auto;background:var(--orc-component-surface-overlay);backdrop-filter:blur(1px);color:var(--orc-component-text)}`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockUiComponent implements OnDestroy {
  readonly blocked = model(false);
  /** A local target component, element, or selector whose rendered area should be blocked. With no target, the blocker stays within its projected host. An unresolved target or a target containing this BlockUI instance is rejected and never falls back to the projected host. */
  readonly target = input<BlockUiTarget>(null);
  readonly autoZIndex = input(true, { transform: booleanAttribute });
  readonly baseZIndex = input(0);
  readonly style = input<Record<string, any> | null | undefined>(undefined);
  readonly styleClass = input('');
  readonly message = input<string | undefined>(undefined);
  readonly onBlock = output<void>();
  readonly onUnblock = output<void>();
  private readonly targetScope = signal<'local' | 'external' | 'invalid'>(
    'invalid',
  );
  private readonly overlayRect = signal<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  readonly blockLocalContent = computed(
    () =>
      this.blocked() &&
      (this.target() == null || this.targetScope() === 'local'),
  );
  readonly showOverlay = computed(
    () =>
      this.blocked() &&
      (this.target() == null ||
        this.targetScope() === 'local' ||
        (this.targetScope() === 'external' && this.overlayRect() !== null)),
  );
  readonly overlayStyles = computed(() => {
    const custom = this.style() ?? {};
    const rect = this.overlayRect();
    const zIndex = this.autoZIndex()
      ? Number(this.baseZIndex()) + 1
      : (custom['zIndex'] ?? custom['z-index']);
    return {
      ...custom,
      position: rect ? 'fixed' : 'absolute',
      inset: rect ? 'auto' : '0',
      top: rect ? `${rect.top}px` : '0',
      left: rect ? `${rect.left}px` : '0',
      right: rect ? null : '0',
      bottom: rect ? null : '0',
      width: rect ? `${rect.width}px` : null,
      height: rect ? `${rect.height}px` : null,
      pointerEvents: 'auto',
      zIndex,
    };
  });
  readonly overlay = viewChild<ElementRef<HTMLElement>>('overlay');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private lastEmittedBlocked = false;
  private activeTarget: HTMLElement | null = null;
  private previousTargetState: {
    ariaBusy: string | null;
    addedInert: boolean;
  } | null = null;
  private stopTargetObservation: (() => void) | null = null;
  private destroyed = false;

  constructor() {
    effect(() => {
      const blocked = this.blocked();
      this.target();
      this.emitTransition(blocked);
      afterNextRender(() => this.syncTargetState(), {
        injector: this.injector,
      });
    });
  }

  block(): void {
    if (!this.blocked()) {
      this.lastEmittedBlocked = true;
      this.blocked.set(true);
      this.onBlock.emit();
    }
  }

  unblock(): void {
    if (this.blocked()) {
      this.lastEmittedBlocked = false;
      this.blocked.set(false);
      this.onUnblock.emit();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.releaseTarget();
  }

  private emitTransition(blocked: boolean): void {
    if (blocked === this.lastEmittedBlocked) return;
    this.lastEmittedBlocked = blocked;
    if (blocked) this.onBlock.emit();
    else this.onUnblock.emit();
  }

  private syncTargetState(): void {
    if (this.destroyed) return;
    const explicitTarget = this.target() != null;
    const requested = explicitTarget ? this.resolveTarget() : null;
    if (!explicitTarget) {
      this.releaseTarget();
      this.overlayRect.set(null);
      this.targetScope.set('local');
      return;
    }
    if (
      !requested ||
      requested === this.host.nativeElement ||
      requested.contains(this.host.nativeElement)
    ) {
      this.releaseTarget();
      this.overlayRect.set(null);
      this.targetScope.set('invalid');
      return;
    }
    if (!this.blocked()) {
      this.releaseTarget();
      this.targetScope.set('external');
      this.updateOverlayRect(requested);
      return;
    }
    const target = requested;
    if (target !== this.activeTarget) {
      this.releaseTarget();
      this.activeTarget = target;
      const ariaBusy = target.getAttribute('aria-busy');
      const addedInert = !target.hasAttribute('inert');
      target.setAttribute('aria-busy', 'true');
      if (addedInert) target.setAttribute('inert', '');
      this.previousTargetState = { ariaBusy, addedInert };
      this.observeTarget(target);
    }
    this.targetScope.set('external');
    this.updateOverlayRect(target);
  }

  private resolveTarget(): HTMLElement | null {
    const value = this.target();
    const doc = this.host.nativeElement.ownerDocument;
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        const match = doc.querySelector(value) ?? doc.getElementById(value);
        return this.asHtmlElement(match);
      } catch {
        return null;
      }
    }
    if (value instanceof ElementRef)
      return this.asHtmlElement(value.nativeElement);
    if (
      'getBlockableElement' in value &&
      typeof value.getBlockableElement === 'function'
    ) {
      try {
        return this.asHtmlElement(value.getBlockableElement());
      } catch {
        return null;
      }
    }
    return this.asHtmlElement(value);
  }

  private asHtmlElement(value: unknown): HTMLElement | null {
    if (!value || typeof value !== 'object') return null;
    const candidate = value as HTMLElement;
    return candidate.nodeType === 1 &&
      typeof candidate.getBoundingClientRect === 'function'
      ? candidate
      : null;
  }

  private observeTarget(target: HTMLElement): void {
    const view = target.ownerDocument.defaultView;
    const refresh = (): void => {
      if (this.activeTarget === target && this.blocked())
        this.updateOverlayRect(target);
    };
    view?.addEventListener('resize', refresh, { passive: true });
    view?.addEventListener('scroll', refresh, true);
    const ResizeObserverConstructor = view?.ResizeObserver;
    const resizeObserver = ResizeObserverConstructor
      ? new ResizeObserverConstructor(refresh)
      : null;
    resizeObserver?.observe(target);
    const MutationObserverConstructor = view?.MutationObserver;
    const mutationObserver = MutationObserverConstructor
      ? new MutationObserverConstructor(refresh)
      : null;
    mutationObserver?.observe(target, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    this.stopTargetObservation = () => {
      view?.removeEventListener('resize', refresh);
      view?.removeEventListener('scroll', refresh, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }

  private updateOverlayRect(target: HTMLElement): void {
    const rect = target.getBoundingClientRect();
    this.overlayRect.set({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }

  private releaseTarget(): void {
    this.stopTargetObservation?.();
    this.stopTargetObservation = null;
    const target = this.activeTarget;
    const previous = this.previousTargetState;
    if (target && previous) {
      if (target.getAttribute('aria-busy') === 'true') {
        if (previous.ariaBusy === null) target.removeAttribute('aria-busy');
        else target.setAttribute('aria-busy', previous.ariaBusy);
      }
      if (previous.addedInert && target.hasAttribute('inert'))
        target.removeAttribute('inert');
    }
    this.activeTarget = null;
    this.previousTargetState = null;
  }
}
