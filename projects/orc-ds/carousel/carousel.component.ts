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
  private previousActiveIndex = 0;
  private previousPage = 0;
  private previousNumScroll = 1;
  private previousNumVisible = 1;
  private previousItemsLength = 0;

  readonly items = input<CarouselItem[]>([]);
  readonly value = input<CarouselItem[] | undefined>(undefined, {
    alias: 'value',
  });
  readonly activeIndex = model(0);
  readonly page = model(0, { alias: 'page' });
  readonly numVisible = input(1, { transform: numberAttribute });
  readonly numScroll = input(1, { transform: numberAttribute });
  readonly responsiveOptions = input<unknown[] | undefined>(undefined);
  readonly orientation = input<CarouselOrientation>('horizontal');
  readonly loop = input(true, { transform: booleanAttribute });
  readonly circular = input<boolean | undefined, unknown>(undefined, {
    transform: booleanAttribute,
  });
  readonly autoplay = input(false, { transform: booleanAttribute });
  readonly autoplayInterval = input<number | undefined, unknown>(undefined, {
    transform: numberAttribute,
  });
  readonly pauseOnHover = input(true, { transform: booleanAttribute });
  readonly interval = input(5000, { transform: numberAttribute });
  readonly showArrows = input(true, { transform: booleanAttribute });
  readonly showNavigators = input<boolean | undefined, unknown>(undefined, {
    transform: booleanAttribute,
  });
  readonly showIndicators = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly previousLabel = input<string | undefined>(undefined);
  readonly nextLabel = input<string | undefined>(undefined);
  readonly indicatorsLabel = input<string | undefined>(undefined);

  readonly slideChange = output<{ index: number; item: CarouselItem }>();
  readonly onPage = output<{
    first: number;
    last: number;
    page: number;
    pageCount: number;
  }>();
  readonly onPlay = output<void>();
  readonly onPause = output<void>();
  readonly hovered = signal(false);
  readonly effectiveItems = computed(() => this.value() ?? this.items());
  readonly effectiveCircular = computed(() => this.circular() ?? this.loop());
  readonly effectiveInterval = computed(
    () => this.autoplayInterval() ?? this.interval(),
  );
  readonly effectiveShowNavigators = computed(
    () => this.showNavigators() ?? this.showArrows(),
  );
  readonly effectiveNumVisible = computed(() =>
    Math.max(1, Math.trunc(this.numVisible()) || 1),
  );
  readonly effectiveNumScroll = computed(() =>
    Math.max(1, Math.trunc(this.numScroll()) || 1),
  );
  private readonly effectivePageCount = computed(() => {
    const itemCount = this.effectiveItems().length;
    if (!itemCount) return 0;
    return Math.max(
      1,
      Math.ceil(
        (itemCount - this.effectiveNumVisible()) / this.effectiveNumScroll(),
      ) + 1,
    );
  });
  readonly activeItem = computed(
    () => this.effectiveItems()[this.safeIndex()] ?? null,
  );
  readonly safeIndex = computed(() => {
    const count = this.effectiveItems().length;
    if (!count) return 0;
    return Math.min(Math.max(this.activeIndex(), 0), count - 1);
  });
  readonly canGoPrevious = computed(
    () => this.effectiveCircular() || this.findIndex(-1) !== null,
  );
  readonly canGoNext = computed(
    () => this.effectiveCircular() || this.findIndex(1) !== null,
  );
  readonly panelId = `${this.carouselId}-panel`;
  readonly indicatorId = (index: number): string =>
    `${this.carouselId}-indicator-${index}`;

  constructor() {
    effect(() => {
      const activeIndex = this.activeIndex();
      const page = this.page();
      const numScroll = this.effectiveNumScroll();
      const numVisible = this.effectiveNumVisible();
      const itemsLength = this.effectiveItems().length;
      const activeIndexChanged = activeIndex !== this.previousActiveIndex;
      const pageChanged = page !== this.previousPage;
      const numScrollChanged = numScroll !== this.previousNumScroll;
      const numVisibleChanged = numVisible !== this.previousNumVisible;
      const itemsLengthChanged = itemsLength !== this.previousItemsLength;

      this.previousActiveIndex = activeIndex;
      this.previousPage = page;
      this.previousNumScroll = numScroll;
      this.previousNumVisible = numVisible;
      this.previousItemsLength = itemsLength;

      // activeIndex identifies an exact item; page identifies the first item
      // in a page. If both are written together, the exact item is canonical.
      if (activeIndexChanged) {
        this.page.set(this.pageForIndex(this.safeIndex(), numScroll));
      } else if (pageChanged) {
        const normalizedPage = this.clampPage(page);
        if (normalizedPage !== page) this.page.set(normalizedPage);
        const lastIndex = Math.max(0, itemsLength - 1);
        this.activeIndex.set(Math.min(normalizedPage * numScroll, lastIndex));
      } else if (numScrollChanged || numVisibleChanged || itemsLengthChanged) {
        this.page.set(this.pageForIndex(this.safeIndex(), numScroll));
      }
    });

    effect(() => {
      this.effectiveItems();
      this.autoplay();
      this.interval();
      this.autoplayInterval();
      this.pauseOnHover();
      this.stopAutoplay();
      if (this.autoplay() && this.effectiveItems().length > 1) {
        this.autoplayTimer = setInterval(
          () => {
            if (!(this.pauseOnHover() && this.hovered())) this.next();
          },
          Math.max(1000, this.effectiveInterval()),
        );
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
    const page = this.pageForIndex(index, this.effectiveNumScroll());
    this.page.set(page);
    this.slideChange.emit({ index, item });
    const pageCount = Math.max(1, this.effectivePageCount());
    this.onPage.emit({
      first: index,
      last: Math.min(
        this.effectiveItems().length - 1,
        index + this.effectiveNumVisible() - 1,
      ),
      page,
      pageCount,
    });
  }

  onMouseEnter(): void {
    this.hovered.set(true);
    this.onPause.emit();
  }
  onMouseLeave(): void {
    this.hovered.set(false);
    if (this.autoplay()) this.onPlay.emit();
  }

  trackItem(index: number, item: CarouselItem): string | number {
    return item.id ?? index;
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const root = event.currentTarget as HTMLElement | null;
    const target = event.target as Element | null;
    const indicator = target?.closest?.(
      '[role="tab"]',
    ) as HTMLButtonElement | null;
    if (root && indicator && root.contains(indicator)) {
      this.onIndicatorKeydown(event, root, indicator);
      return;
    }

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

  private onIndicatorKeydown(
    event: KeyboardEvent,
    root: HTMLElement,
    current: HTMLButtonElement,
  ): void {
    const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const currentIndex = tabs.indexOf(current);
    const enabled = tabs
      .map((tab, index) => ({ tab, index }))
      .filter(({ tab }) => !tab.disabled);
    const currentEnabledIndex = enabled.findIndex(
      ({ index }) => index === currentIndex,
    );
    if (!enabled.length || currentEnabledIndex === -1) return;

    let nextEnabledIndex: number | null = null;
    if (event.key === 'Home') {
      nextEnabledIndex = 0;
    } else if (event.key === 'End') {
      nextEnabledIndex = enabled.length - 1;
    } else if (event.key === 'ArrowLeft') {
      nextEnabledIndex =
        (currentEnabledIndex - 1 + enabled.length) % enabled.length;
    } else if (event.key === 'ArrowRight') {
      nextEnabledIndex = (currentEnabledIndex + 1) % enabled.length;
    }

    if (nextEnabledIndex === null) return;
    event.preventDefault();
    const next = enabled[nextEnabledIndex];
    next.tab.focus();
    this.goTo(next.index);
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

  private pageForIndex(index: number, numScroll: number): number {
    return this.clampPage(Math.floor(index / numScroll));
  }

  private clampPage(page: number): number {
    const maxPage = Math.max(0, this.effectivePageCount() - 1);
    if (!Number.isFinite(page)) return 0;
    return Math.min(Math.max(Math.trunc(page), 0), maxPage);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer !== null) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}
