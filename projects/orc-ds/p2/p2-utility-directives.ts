import { Directive, ElementRef, HostListener, Renderer2, input } from '@angular/core';

@Directive({ selector: '[orcRipple]', standalone: true })
export class RippleDirective {
  readonly disabled = input(false); readonly color = input('currentColor');
  constructor(private readonly host: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {}
  @HostListener('click', ['$event']) onClick(event: MouseEvent): void {
    if (this.disabled()) return;
    const element = this.host.nativeElement; const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height); const ripple = this.renderer.createElement('span') as HTMLElement;
    this.renderer.addClass(element, 'orc-ripple-host'); this.renderer.addClass(ripple, 'orc-ripple'); this.renderer.setStyle(element, 'position', 'relative'); this.renderer.setStyle(element, 'overflow', 'hidden'); this.renderer.setStyle(ripple, 'position', 'absolute'); this.renderer.setStyle(ripple, 'border-radius', '50%'); this.renderer.setStyle(ripple, 'pointer-events', 'none'); this.renderer.setStyle(ripple, 'transform', 'scale(0)'); this.renderer.setStyle(ripple, 'animation', 'orc-ripple-animation .5s linear');
    this.renderer.setStyle(ripple, 'width', `${size}px`); this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${event.clientX - rect.left - size / 2}px`); this.renderer.setStyle(ripple, 'top', `${event.clientY - rect.top - size / 2}px`); this.renderer.setStyle(ripple, 'background', this.color());
    this.renderer.appendChild(element, ripple); setTimeout(() => ripple.parentNode && this.renderer.removeChild(element, ripple), 500);
  }
}

@Directive({ selector: '[orcStyleClass]', standalone: true })
export class StyleClassDirective {
  readonly targetClass = input(''); readonly toggleClass = input(''); readonly enterClass = input(''); readonly leaveClass = input(''); readonly hideOnOutsideClick = input(false);
  private open = false;
  constructor(private readonly host: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {}
  @HostListener('click') onClick(): void { this.toggle(); }
  @HostListener('document:click', ['$event']) onDocumentClick(event: MouseEvent): void { if (this.hideOnOutsideClick() && this.open && !this.host.nativeElement.contains(event.target as Node)) this.toggle(false); }
  toggle(force?: boolean): void { this.open = force ?? !this.open; const element = this.host.nativeElement; const target = this.targetClass() && typeof document !== 'undefined' ? document.querySelector(this.targetClass()) : element; if (!target) return; const className = this.toggleClass() || (this.open ? this.enterClass() : this.leaveClass()); if (className) this.open ? this.renderer.addClass(target, className) : this.renderer.removeClass(target, className); }
}
