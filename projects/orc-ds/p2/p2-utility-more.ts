import { AfterViewInit, Directive, ElementRef, HostListener, Renderer2, input } from '@angular/core';

@Directive({ selector: '[orcAnimateOnScroll]', standalone: true })
export class AnimateOnScrollDirective implements AfterViewInit {
  readonly animationClass = input('orc-animate-visible');
  constructor(private readonly element: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {}
  ngAfterViewInit(): void { if (typeof IntersectionObserver === 'undefined') { this.renderer.addClass(this.element.nativeElement, this.animationClass()); return; } const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { this.renderer.addClass(this.element.nativeElement, this.animationClass()); observer.unobserve(this.element.nativeElement); } })); observer.observe(this.element.nativeElement); }
}

@Directive({ selector: '[orcFocusTrap]', standalone: true })
export class FocusTrapDirective {
  readonly disabled = input(false);
  constructor(private readonly element: ElementRef<HTMLElement>) {}
  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void { if (this.disabled() || event.key !== 'Tab') return; const focusable = Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(item => !item.hasAttribute('disabled')); if (!focusable.length) return; const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
}

@Directive({ selector: '[orcUseStyle]', standalone: true })
export class UseStyleDirective {
  readonly styles = input<Record<string, string | number>>({});
  constructor(private readonly element: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {}
  ngOnChanges(): void { for (const [property, value] of Object.entries(this.styles())) this.renderer.setStyle(this.element.nativeElement, property, value); }
}
