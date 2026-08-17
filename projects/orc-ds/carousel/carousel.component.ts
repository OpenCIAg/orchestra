import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselItem, CarouselOrientation } from './carousel.types';

let nextCarouselId = 0;

@Component({
  selector: 'orc-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements OnDestroy {
  private readonly carouselId = `orc-carousel-${++nextCarouselId}`;
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;

  readonly items = input<CarouselItem[]>([]);
  readonly activeIndex = model(0);
  readonly orientation = input<CarouselOrientation>('horizontal');
  readonly loop = input(true, { transform: booleanAttribute });
  readonly autoplay = input(false, { transform: booleanAttribute });
  readonly interval = input(5000, { transform: numberAttribute });
  readonly showArrows = input(true, { transform: booleanAttribute });
  readonly showIndicators = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('Carousel');

  readonly slideChange = output<{ index: number; item: CarouselItem }>();
  readonly activeItem = computed(() => this.items()[this.safeIndex()] ?? null);
  readonly safeIndex = computed(() => {
    const count = this.items().length;
    if (!count) return 0;
    return Math.min(Math.max(this.activeIndex(), 0), count - 1);
  });
  readonly canGoPrevious = computed(() => this.loop() || this.findIndex(-1) !== null);
  readonly canGoNext = computed(() => this.loop() || this.findIndex(1) !== null);
  readonly itemId = (index: number): string => `${this.carouselId}-item-${index}`;

  constructor() {
    effect(() => {
      this.items();
      this.autoplay();
      this.interval();
      this.stopAutoplay();
      if (this.autoplay() && this.items().length > 1) {
        this.autoplayTimer = setInterval(() => this.next(), Math.max(1000, this.interval()));
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  previous(): void {
    const index = this.findIndex(-1);
    if (index !== null) this.goTo(index);
  }

  next(): void {
    const index = this.findIndex(1);
    if (index !== null) this.goTo(index);
  }

  goTo(index: number): void {
    const item = this.items()[index];
    if (!item || item.disabled) return;
    this.activeIndex.set(index);
    this.slideChange.emit({ index, item });
  }

  trackItem(index: number, item: CarouselItem): string | number {
    return item.id ?? index;
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.orientation() === 'vertical') {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.previous();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.next();
      }
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  private findIndex(direction: -1 | 1): number | null {
    const items = this.items();
    if (!items.length) return null;
    const start = this.safeIndex();
    for (let offset = 1; offset <= items.length; offset += 1) {
      let candidate = start + direction * offset;
      if (this.loop()) {
        candidate = (candidate + items.length) % items.length;
      } else if (candidate < 0 || candidate >= items.length) {
        continue;
      }
      if (!items[candidate]?.disabled) return candidate;
    }
    return null;
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer !== null) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}
