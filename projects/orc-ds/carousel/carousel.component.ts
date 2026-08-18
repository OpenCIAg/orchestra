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
  readonly value = input<CarouselItem[] | undefined>(undefined, { alias: 'value' });
  readonly activeIndex = model(0);
  readonly page = model(0, { alias: 'page' });
  readonly numVisible = input(1, { transform: numberAttribute });
  readonly numScroll = input(1, { transform: numberAttribute });
  readonly responsiveOptions = input<unknown[] | undefined>(undefined);
  readonly orientation = input<CarouselOrientation>('horizontal');
  readonly loop = input(true, { transform: booleanAttribute });
  readonly circular = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  readonly autoplay = input(false, { transform: booleanAttribute });
  readonly autoplayInterval = input<number | undefined>(undefined, { transform: numberAttribute });
  readonly pauseOnHover = input(true, { transform: booleanAttribute });
  readonly interval = input(5000, { transform: numberAttribute });
  readonly showArrows = input(true, { transform: booleanAttribute });
  readonly showNavigators = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  readonly showIndicators = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('Carousel');

  readonly slideChange = output<{ index: number; item: CarouselItem }>();
  readonly onPage = output<{ first: number; last: number; page: number; pageCount: number }>(); readonly onPlay = output<void>(); readonly onPause = output<void>();
  readonly hovered = signal(false);
  readonly effectiveItems = computed(() => this.value() ?? this.items());
  readonly effectiveCircular = computed(() => this.circular() ?? this.loop());
  readonly effectiveInterval = computed(() => this.autoplayInterval() ?? this.interval());
  readonly effectiveShowNavigators = computed(() => this.showNavigators() ?? this.showArrows());
  readonly activeItem = computed(() => this.effectiveItems()[this.safeIndex()] ?? null);
  readonly safeIndex = computed(() => {
    const count = this.effectiveItems().length;
    if (!count) return 0;
    return Math.min(Math.max(this.page(), this.activeIndex(), 0), count - 1);
  });
  readonly canGoPrevious = computed(() => this.effectiveCircular() || this.findIndex(-1) !== null);
  readonly canGoNext = computed(() => this.effectiveCircular() || this.findIndex(1) !== null);
  readonly itemId = (index: number): string => `${this.carouselId}-item-${index}`;

  constructor() {
    effect(() => {
      this.effectiveItems();
      this.autoplay();
      this.interval();
      this.stopAutoplay();
      if (this.autoplay() && this.effectiveItems().length > 1) {
        this.autoplayTimer = setInterval(() => { if (!(this.pauseOnHover() && this.hovered())) this.next(); }, Math.max(1000, this.effectiveInterval()));
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
    const item = this.effectiveItems()[index];
    if (!item || item.disabled) return;
    this.activeIndex.set(index);
    this.page.set(index);
    this.slideChange.emit({ index, item });
    const pageCount = Math.max(1, Math.ceil(this.effectiveItems().length / Math.max(1, this.numVisible())));
    this.onPage.emit({ first: index, last: Math.min(this.effectiveItems().length - 1, index + this.numVisible() - 1), page: Math.floor(index / Math.max(1, this.numScroll())), pageCount });
  }

  onMouseEnter(): void { this.hovered.set(true); this.onPause.emit(); }
  onMouseLeave(): void { this.hovered.set(false); if (this.autoplay()) this.onPlay.emit(); }

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
    const items = this.effectiveItems();
    if (!items.length) return null;
    const start = this.safeIndex();
    for (let offset = 1; offset <= items.length; offset += 1) {
      let candidate = start + direction * offset;
      if (this.effectiveCircular()) {
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
