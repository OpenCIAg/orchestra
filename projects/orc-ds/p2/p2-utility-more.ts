import { AfterViewInit, Directive, ElementRef, HostListener, Renderer2, booleanAttribute, input, output } from '@angular/core';

@Directive({ selector: '[orcAnimateOnScroll]', standalone: true })
export class AnimateOnScrollDirective implements AfterViewInit {
  readonly animationClass = input('orc-animate-visible');
  readonly once = input(true, { transform: booleanAttribute }); readonly threshold = input(0.1);
  readonly visible = output<IntersectionObserverEntry>();
  constructor(private readonly element: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {}
  ngAfterViewInit(): void { if (typeof IntersectionObserver === 'undefined') { this.renderer.addClass(this.element.nativeElement, this.animationClass()); return; } const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { this.renderer.addClass(this.element.nativeElement, this.animationClass()); this.visible.emit(entry); if (this.once()) observer.unobserve(this.element.nativeElement); } }), { threshold: this.threshold() }); observer.observe(this.element.nativeElement); }
}

@Directive({ selector: '[orcFocusTrap]', standalone: true })
export class FocusTrapDirective implements AfterViewInit {
  readonly disabled = input(false, { transform: booleanAttribute }); readonly autoFocus = input(false, { transform: booleanAttribute });
  constructor(private readonly element: ElementRef<HTMLElement>) {}
  ngAfterViewInit(): void { if (!this.disabled() && this.autoFocus()) queueMicrotask(() => this.focusables()[0]?.focus()); }
  private focusables(): HTMLElement[] { return Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(item => !item.hasAttribute('disabled')); }
  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void { if (this.disabled() || event.key !== 'Tab') return; const focusable = this.focusables(); if (!focusable.length) return; const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
}

@Directive({ selector: '[orcUseStyle]', standalone: true })
export class UseStyleDirective {
  readonly styles = input<Record<string, string | number>>({});
  constructor(private readonly element: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {}
  ngOnChanges(): void { for (const [property, value] of Object.entries(this.styles())) this.renderer.setStyle(this.element.nativeElement, property, value); }
  clear(): void { for (const property of Object.keys(this.styles())) this.renderer.removeStyle(this.element.nativeElement, property); }
}
