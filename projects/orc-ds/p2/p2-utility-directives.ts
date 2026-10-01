import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  HostListener,
  OnChanges,
  OnDestroy,
  Renderer2,
  RendererStyleFlags2,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

@Directive({ selector: '[orcRipple]', standalone: true })
export class RippleDirective implements OnDestroy {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly color = input('currentColor');
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private readonly ripples = new Set<HTMLElement>();
  private hostStyleSnapshot: {
    position: string;
    positionPriority: string;
    overflow: string;
    overflowPriority: string;
  } | null = null;
  private addedHostClass = false;
  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}
  @HostListener('click', ['$event']) onClick(event: MouseEvent): void {
    if (this.disabled()) return;
    const element = this.host.nativeElement;
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = this.renderer.createElement('span') as HTMLElement;
    if (size <= 0) return;
    this.prepareHost(element);
    this.renderer.addClass(ripple, 'orc-ripple');
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'border-radius', '50%');
    this.renderer.setStyle(ripple, 'pointer-events', 'none');
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    const hasPointerPosition =
      event.detail > 0 &&
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    const x = hasPointerPosition ? event.clientX - rect.left : rect.width / 2;
    const y = hasPointerPosition ? event.clientY - rect.top : rect.height / 2;
    this.renderer.setStyle(ripple, 'left', `${x - size / 2}px`);
    this.renderer.setStyle(ripple, 'top', `${y - size / 2}px`);
    this.renderer.setStyle(ripple, 'background', this.color());
    this.renderer.appendChild(element, ripple);
    this.ripples.add(ripple);
    const reduceMotion =
      element.ownerDocument.defaultView?.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      ).matches ?? false;
    const animate = (
      ripple as HTMLElement & {
        animate?: (
          frames: Keyframe[],
          options: KeyframeAnimationOptions,
        ) => Animation;
      }
    ).animate;
    if (!reduceMotion && typeof animate === 'function') {
      animate.call(
        ripple,
        [
          { transform: 'scale(0)', opacity: 0.18 },
          { transform: 'scale(1)', opacity: 0 },
        ],
        { duration: 500, easing: 'linear' },
      );
    } else {
      this.renderer.setStyle(ripple, 'transform', 'scale(1)');
      this.renderer.setStyle(ripple, 'opacity', '0.12');
    }
    const timer = setTimeout(
      () => {
        this.timers.delete(timer);
        this.removeRipple(ripple);
      },
      reduceMotion ? 150 : 500,
    );
    this.timers.add(timer);
  }
  ngOnDestroy(): void {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const ripple of this.ripples) this.removeRipple(ripple);
    this.restoreHost();
  }

  private prepareHost(element: HTMLElement): void {
    if (!this.hostStyleSnapshot) {
      this.hostStyleSnapshot = {
        position: element.style.getPropertyValue('position'),
        positionPriority: element.style.getPropertyPriority('position'),
        overflow: element.style.getPropertyValue('overflow'),
        overflowPriority: element.style.getPropertyPriority('overflow'),
      };
      this.addedHostClass = !element.classList.contains('orc-ripple-host');
      this.renderer.addClass(element, 'orc-ripple-host');
      if (
        element.ownerDocument.defaultView?.getComputedStyle(element)
          .position === 'static'
      )
        this.setTemporaryStyle(
          element,
          'position',
          'relative',
          this.hostStyleSnapshot.positionPriority,
        );
      this.setTemporaryStyle(
        element,
        'overflow',
        'hidden',
        this.hostStyleSnapshot.overflowPriority,
      );
    }
  }

  private removeRipple(ripple: HTMLElement): void {
    if (ripple.parentNode) this.renderer.removeChild(ripple.parentNode, ripple);
    this.ripples.delete(ripple);
    if (!this.ripples.size) this.restoreHost();
  }

  private restoreHost(): void {
    const element = this.host.nativeElement;
    if (this.hostStyleSnapshot) {
      this.restoreStyle(
        element,
        'position',
        this.hostStyleSnapshot.position,
        this.hostStyleSnapshot.positionPriority,
      );
      this.restoreStyle(
        element,
        'overflow',
        this.hostStyleSnapshot.overflow,
        this.hostStyleSnapshot.overflowPriority,
      );
      this.hostStyleSnapshot = null;
    }
    if (this.addedHostClass)
      this.renderer.removeClass(element, 'orc-ripple-host');
    this.addedHostClass = false;
  }

  private restoreStyle(
    element: HTMLElement,
    property: string,
    value: string,
    priority: string,
  ): void {
    if (value && priority)
      this.renderer.setStyle(
        element,
        property,
        value,
        RendererStyleFlags2.Important,
      );
    else if (value) this.renderer.setStyle(element, property, value);
    else this.renderer.removeStyle(element, property);
  }

  private setTemporaryStyle(
    element: HTMLElement,
    property: string,
    value: string,
    priority: string,
  ): void {
    if (priority)
      this.renderer.setStyle(
        element,
        property,
        value,
        RendererStyleFlags2.Important,
      );
    else this.renderer.setStyle(element, property, value);
  }
}

@Directive({ selector: '[orcStyleClass]', standalone: true })
export class StyleClassDirective implements OnChanges, OnDestroy {
  readonly targetClass = input('');
  readonly toggleClass = input('');
  readonly enterClass = input('');
  readonly leaveClass = input('');
  readonly hideOnOutsideClick = input(false, { transform: booleanAttribute });
  private open = false;
  private readonly document = inject(DOCUMENT);
  private outsideClickCleanup: (() => void) | null = null;
  private appliedTarget: Element | null = null;
  private readonly appliedClasses = new Set<string>();
  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}
  ngOnChanges(): void {
    this.applyState();
    this.syncOutsideListener();
  }
  @HostListener('click') onClick(): void {
    this.toggle();
  }
  toggle(force?: boolean): void {
    this.open = force ?? !this.open;
    this.applyState();
    this.syncOutsideListener();
  }
  ngOnDestroy(): void {
    this.outsideClickCleanup?.();
    this.outsideClickCleanup = null;
    this.reconcileClasses(null, new Set());
  }

  private applyState(): void {
    const target = this.resolveTarget();
    const desired = new Set<string>();
    if (this.open) {
      if (this.toggleClass()) desired.add(this.toggleClass());
      else if (this.enterClass()) desired.add(this.enterClass());
    } else if (!this.toggleClass() && this.leaveClass())
      desired.add(this.leaveClass());
    this.reconcileClasses(target, desired);
  }

  private resolveTarget(): Element | null {
    const selector = this.targetClass();
    if (!selector) return this.host.nativeElement;
    try {
      return this.document.querySelector(selector);
    } catch {
      return null;
    }
  }

  private reconcileClasses(target: Element | null, desired: Set<string>): void {
    if (target !== this.appliedTarget) {
      if (this.appliedTarget)
        for (const className of this.appliedClasses)
          this.renderer.removeClass(this.appliedTarget, className);
      this.appliedClasses.clear();
      this.appliedTarget = target;
    }
    if (!target) return;
    for (const className of [...this.appliedClasses]) {
      if (!desired.has(className)) {
        this.renderer.removeClass(target, className);
        this.appliedClasses.delete(className);
      }
    }
    for (const className of desired) {
      if (!target.classList.contains(className)) {
        this.renderer.addClass(target, className);
        this.appliedClasses.add(className);
      }
    }
  }

  private syncOutsideListener(): void {
    const shouldListen = this.open && this.hideOnOutsideClick();
    if (!shouldListen) {
      this.outsideClickCleanup?.();
      this.outsideClickCleanup = null;
      return;
    }
    if (this.outsideClickCleanup) return;
    this.outsideClickCleanup = this.renderer.listen(
      this.document,
      'click',
      (event: MouseEvent) => {
        const target = event.target as Node | null;
        const panel = this.resolveTarget();
        if (
          (target && this.host.nativeElement.contains(target)) ||
          (target && !!panel?.contains(target))
        )
          return;
        this.toggle(false);
      },
    );
  }
}
