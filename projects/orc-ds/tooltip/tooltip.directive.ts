import {
  Directive,
  ElementRef,
  inject,
  input,
  computed,
  HostListener,
  OnDestroy,
  ComponentRef,
  ViewContainerRef,
  Renderer2,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { TooltipPosition, TooltipTheme } from './tooltip.types';

let nextUniqueId = 0;

@Directive({
  selector: '[orcTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);

  // ── Inputs (Signals API) ──────────────────────────────────
  readonly appTooltip = input<string | null | undefined>('', { alias: 'appTooltip' });
  readonly uiTooltip = input<string | null | undefined>('', { alias: 'uiTooltip' });
  readonly orcTooltip = input<string | null | undefined>('', { alias: 'orcTooltip' });

  readonly tooltipPosition = input<TooltipPosition>('top');
  readonly tooltipTheme = input<TooltipTheme>('dark');
  readonly tooltipShowDelay = input<number>(150);
  readonly tooltipHideDelay = input<number>(100);
  readonly showDelay = input<number | undefined>(undefined, { transform: numberAttribute });
  readonly hideDelay = input<number | undefined>(undefined, { transform: numberAttribute });
  readonly tooltipEvent = input<'hover' | 'focus' | 'both'>('both');
  readonly positionStyle = input<string | undefined>(undefined);
  readonly tooltipStyleClass = input<string | undefined>(undefined);
  readonly tooltipZIndex = input<string | undefined>(undefined);
  readonly escape = input(true, { transform: booleanAttribute });
  readonly life = input<number | undefined>(undefined, { transform: numberAttribute });
  readonly fitContent = input(true, { transform: booleanAttribute });
  readonly content = input<string | undefined>(undefined);
  readonly tooltipOptions = input<Record<string, unknown> | undefined>(undefined);
  readonly position = input<TooltipPosition | undefined>(undefined);
  readonly autoHide = input(true, { transform: booleanAttribute });
  readonly hideOnEscape = input(true, { transform: booleanAttribute });
  readonly tooltipDisabled = input<boolean>(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly appendTo = input<'body' | 'self'>('body');

  // Texto efetivo do tooltip
  readonly tooltipText = computed(() => {
    return this.content() || this.appTooltip() || this.uiTooltip() || this.orcTooltip() || '';
  });
  readonly effectiveShowDelay = computed(() => this.showDelay() ?? this.tooltipShowDelay());
  readonly effectiveHideDelay = computed(() => this.hideDelay() ?? this.tooltipHideDelay());
  readonly effectivePosition = computed(() => this.position() ?? this.tooltipPosition());

  private componentRef: ComponentRef<TooltipComponent> | null = null;
  private showTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly tooltipId = `orc-tooltip-${++nextUniqueId}`;
  private previousDescribedBy: string | null = null;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.tooltipEvent() === 'focus') return;
    this.scheduleShow();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.tooltipEvent() === 'focus' || !this.autoHide()) return;
    this.scheduleHide();
  }

  @HostListener('focusin')
  onFocusIn(): void {
    if (this.tooltipEvent() === 'hover') return;
    this.scheduleShow();
  }

  @HostListener('focusout')
  onFocusOut(): void {
    if (this.tooltipEvent() === 'hover') return;
    this.scheduleHide();
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (!this.escape() || !this.hideOnEscape()) return;
    this.hideImmediately();
  }

  private scheduleShow(): void {
    if (this.tooltipDisabled() || !this.tooltipText()) return;

    this.clearHideTimeout();
    if (this.componentRef) return;

    const delay = this.effectiveShowDelay();
    if (delay <= 0) {
      this.show();
    } else {
      this.showTimeoutId = setTimeout(() => this.show(), delay);
    }
  }

  private scheduleHide(): void {
    this.clearShowTimeout();
    if (!this.componentRef) return;

    const delay = this.effectiveHideDelay();
    if (delay <= 0) {
      this.hide();
    } else {
      this.hideTimeoutId = setTimeout(() => this.hide(), delay);
    }
  }

  private show(): void {
    if (this.componentRef || this.tooltipDisabled() || !this.tooltipText()) return;

    // Instancia o componente do tooltip
    this.componentRef = this.viewContainerRef.createComponent(TooltipComponent);
    const instance = this.componentRef.instance;

    instance.text.set(this.tooltipText());
    instance.theme.set(this.tooltipTheme());
    instance.position.set(this.effectivePosition());
    instance.id.set(this.tooltipId);
    instance.styleClass.set([this.styleClass(), this.tooltipStyleClass() || ''].filter(Boolean).join(' '));

    const domElement = this.componentRef.location.nativeElement as HTMLElement;
    this.renderer.appendChild(this.appendTo() === 'self' ? this.elementRef.nativeElement : document.body, domElement);

    // The tooltip starts with empty signal values. Render the new inputs before
    // measuring it, otherwise positioning uses the empty shell's dimensions
    // and becomes offset when the text is rendered on the next change-detection
    // pass.
    this.componentRef.changeDetectorRef.detectChanges();

    // WCAG A11y
    this.previousDescribedBy = this.elementRef.nativeElement.getAttribute('aria-describedby');
    this.renderer.setAttribute(
      this.elementRef.nativeElement,
      'aria-describedby',
      [this.previousDescribedBy, this.tooltipId].filter(Boolean).join(' ')
    );

    // Posicionamento inteligente com verificação de colisão
    this.updatePosition();
    if (this.tooltipZIndex()) this.renderer.setStyle(domElement, 'z-index', this.tooltipZIndex());
    if (this.positionStyle()) this.renderer.setStyle(domElement, 'position', this.positionStyle());

    // Fade-in animado no próximo frame
    requestAnimationFrame(() => {
      if (this.componentRef) {
        this.componentRef.instance.visible.set(true);
        const lifetime = this.life();
        if (lifetime && lifetime > 0) this.hideTimeoutId = setTimeout(() => this.hideImmediately(), lifetime);
      }
    });
  }

  private hide(): void {
    if (!this.componentRef) return;

    this.componentRef.instance.visible.set(false);
    const ref = this.componentRef;
    this.componentRef = null;

    // Remove aria-describedby
    this.restoreDescribedBy();

    // Remove do DOM após a transição de fade-out
    setTimeout(() => {
      ref.destroy();
    }, 150);
  }

  private hideImmediately(): void {
    this.clearShowTimeout();
    this.clearHideTimeout();
    if (this.componentRef) {
      this.restoreDescribedBy();
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  private restoreDescribedBy(): void {
    if (this.previousDescribedBy) {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-describedby', this.previousDescribedBy);
    } else {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-describedby');
    }
    this.previousDescribedBy = null;
  }

  private updatePosition(): void {
    if (!this.componentRef) return;

    const triggerEl = this.elementRef.nativeElement;
    const tooltipHost = this.componentRef.location.nativeElement as HTMLElement;
    const tooltipEl = tooltipHost.firstElementChild as HTMLElement;

    if (!tooltipEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    const margin = 8;
    let pos = this.effectivePosition();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Verificação de espaço e inversão automática (Auto-Flip)
    if (pos === 'top' && triggerRect.top - tooltipRect.height - margin < 0) {
      pos = 'bottom';
    } else if (
      pos === 'bottom' &&
      triggerRect.bottom + tooltipRect.height + margin > viewportHeight
    ) {
      pos = 'top';
    } else if (
      pos === 'left' &&
      triggerRect.left - tooltipRect.width - margin < 0
    ) {
      pos = 'right';
    } else if (
      pos === 'right' &&
      triggerRect.right + tooltipRect.width + margin > viewportWidth
    ) {
      pos = 'left';
    }

    this.componentRef.instance.actualPosition.set(pos);

    let top = 0;
    let left = 0;

    switch (pos) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - margin;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + margin;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - margin;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + margin;
        break;
    }

    // Garante que não ultrapassa as bordas laterais da viewport
    left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8));

    this.renderer.setStyle(tooltipHost, 'top', `${top}px`);
    this.renderer.setStyle(tooltipHost, 'left', `${left}px`);
  }

  private clearShowTimeout(): void {
    if (this.showTimeoutId) {
      clearTimeout(this.showTimeoutId);
      this.showTimeoutId = null;
    }
  }

  private clearHideTimeout(): void {
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }
  }

  ngOnDestroy(): void {
    this.hideImmediately();
  }
}
