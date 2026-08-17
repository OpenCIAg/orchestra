import { ChangeDetectionStrategy, Component, ElementRef, HostListener, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

@Component({
  selector: 'orc-scroll-area',
  standalone: true,
  templateUrl: './scroll-area.component.html',
  styleUrl: './scroll-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollAreaComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly orientation = input<ScrollAreaOrientation>('vertical');
  readonly maxHeight = input<string | number>('240px');
  readonly maxWidth = input<string | number>('');
  readonly alwaysShowScrollbar = input(false, { transform: booleanAttribute });
  readonly label = input('Scrollable content');
  readonly scrolled = output<{ top: number; left: number }>();
  readonly canScrollBack = signal(false);
  readonly canScrollForward = signal(false);
  readonly viewportStyle = computed(() => ({ 'max-height': this.maxHeight() || null, 'max-width': this.maxWidth() || null }));

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const vertical = target.scrollTop > 0;
    const horizontal = target.scrollLeft > 0;
    const verticalForward = target.scrollTop + target.clientHeight < target.scrollHeight - 1;
    const horizontalForward = target.scrollLeft + target.clientWidth < target.scrollWidth - 1;
    this.canScrollBack.set(this.orientation() === 'horizontal' ? horizontal : vertical);
    this.canScrollForward.set(this.orientation() === 'horizontal' ? horizontalForward : verticalForward);
    this.scrolled.emit({ top: target.scrollTop, left: target.scrollLeft });
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const viewport = (this.host.nativeElement as HTMLElement).querySelector('.orc-scroll-area__viewport');
    if (!viewport) return;
    if (event.key === 'PageDown') { event.preventDefault(); viewport.scrollBy({ top: viewport.clientHeight, behavior: 'smooth' }); }
    if (event.key === 'PageUp') { event.preventDefault(); viewport.scrollBy({ top: -viewport.clientHeight, behavior: 'smooth' }); }
  }
}
