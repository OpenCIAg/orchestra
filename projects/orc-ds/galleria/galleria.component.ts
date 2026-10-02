import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { P2_SHARED_VARS } from '@ciag/orchestra/internal';

export interface GalleryImage {
  src: string;
  alt?: string;
  thumbnail?: string;
  title?: string;
}
@Component({
  selector: 'orc-galleria, orc-gallery',
  standalone: true,
  templateUrl: './galleria.component.html',
  styles: [P2_SHARED_VARS],
  styleUrl: './galleria.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleriaComponent implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly fullscreenClose =
    viewChild<ElementRef<HTMLButtonElement>>('fullscreenClose');
  private fullscreenWasVisible = false;
  private previousFocus: HTMLElement | null = null;
  private pointerOpener: HTMLElement | null = null;
  private pointerOpenerTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly capturePointerOpener = (event: MouseEvent): void => {
    if (event.detail === 0 || (this.fullScreen() && this.visible())) return;

    const target = event.target as Element | null;
    if (!target || typeof target.closest !== 'function') return;

    const candidate = target.closest<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
    );
    if (!candidate) return;

    this.pointerOpener = candidate;
    if (this.pointerOpenerTimer !== null) clearTimeout(this.pointerOpenerTimer);
    this.pointerOpenerTimer = setTimeout(() => {
      this.pointerOpenerTimer = null;
      this.pointerOpener = null;
    }, 250);
  };
  readonly images = input<GalleryImage[]>([]);
  readonly label = input<string | undefined>(undefined);
  readonly roleDescription = input<string | undefined>(undefined);
  readonly closeLabel = input<string | undefined>(undefined);
  readonly previousLabel = input<string | undefined>(undefined);
  readonly nextLabel = input<string | undefined>(undefined);
  readonly thumbnailLabel = input<string | undefined>(undefined);
  readonly activeIndex = model(0);
  readonly fullScreen = model(false);
  readonly visible = model(true);
  readonly showItemNavigators = input(true, { transform: booleanAttribute });
  readonly showThumbnailNavigators = input(true, {
    transform: booleanAttribute,
  });
  readonly showItemNavigatorsOnHover = input(false, {
    transform: booleanAttribute,
  });
  readonly changeItemOnIndicatorHover = input(false, {
    transform: booleanAttribute,
  });
  readonly shouldStopAutoplayByClick = input(false, {
    transform: booleanAttribute,
  });
  readonly circular = input(false, { transform: booleanAttribute });
  readonly autoPlay = input(false, { transform: booleanAttribute });
  readonly transitionInterval = input(0);
  readonly showThumbnails = input(true, { transform: booleanAttribute });
  readonly thumbnailsPosition = input<'bottom' | 'top' | 'left' | 'right'>(
    'bottom',
  );
  readonly showIndicators = input(true, { transform: booleanAttribute });
  readonly showIndicatorsOnItem = input(false, { transform: booleanAttribute });
  readonly indicatorsPosition = input<'bottom' | 'top' | 'left' | 'right'>(
    'bottom',
  );
  readonly baseZIndex = input(0);
  readonly maskClass = input('');
  readonly containerClass = input('');
  readonly containerStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly imageChange = output<{ index: number; image: GalleryImage }>();
  private slideshowTimer: ReturnType<typeof setInterval> | null = null;
  /** @deprecated Compatibility input; thumbnail virtualization is not implemented. */
  readonly numVisible = input(3);
  /** @deprecated Compatibility input; responsive thumbnail breakpoints are not implemented. */
  readonly responsiveOptions = input<unknown[] | undefined>(undefined);
  /** @deprecated Compatibility input; transitions are CSS-only and this value is not consumed. */
  readonly showTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
  /** @deprecated Compatibility input; transitions are CSS-only and this value is not consumed. */
  readonly hideTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
  readonly clampedActiveIndex = computed(() => {
    const count = this.images().length;
    const index = Number.isFinite(this.activeIndex())
      ? Math.trunc(this.activeIndex())
      : 0;
    return count ? Math.max(0, Math.min(index, count - 1)) : 0;
  });
  readonly activeImage = computed(
    () => this.images()[this.clampedActiveIndex()],
  );
  readonly canPrevious = computed(
    () =>
      this.images().length > 1 &&
      (this.circular() || this.clampedActiveIndex() > 0),
  );
  readonly canNext = computed(
    () =>
      this.images().length > 1 &&
      (this.circular() || this.clampedActiveIndex() < this.images().length - 1),
  );
  readonly hovered = signal(false);
  readonly showNavigators = computed(
    () =>
      this.showItemNavigators() &&
      (!this.showItemNavigatorsOnHover() || this.hovered()),
  );
  constructor() {
    globalThis.document?.addEventListener(
      'click',
      this.capturePointerOpener,
      true,
    );
    effect(() => {
      const fullscreenVisible = this.fullScreen() && this.visible();
      if (fullscreenVisible && !this.fullscreenWasVisible) {
        const active = globalThis.document?.activeElement;
        const pointerOpener = this.pointerOpener;
        this.previousFocus = pointerOpener?.isConnected
          ? pointerOpener
          : typeof HTMLElement !== 'undefined' && active instanceof HTMLElement
            ? active
            : null;
        this.clearPointerOpener();
        afterNextRender(() => this.fullscreenClose()?.nativeElement.focus(), {
          injector: this.injector,
        });
      } else if (!fullscreenVisible && this.fullscreenWasVisible) {
        afterNextRender(
          () => {
            if (this.previousFocus?.isConnected) this.previousFocus.focus();
            this.previousFocus = null;
          },
          { injector: this.injector },
        );
      }
      this.fullscreenWasVisible = fullscreenVisible;
    });
    effect(() => {
      this.autoPlay();
      this.transitionInterval();
      this.visible();
      this.restartSlideShow();
    });
    effect(() => {
      const count = this.images().length;
      const index = this.activeIndex();
      const finiteIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
      const normalized = count
        ? Math.max(0, Math.min(finiteIndex, count - 1))
        : 0;
      if (index !== normalized) this.activeIndex.set(normalized);
    });
  }
  startSlideShow(): void {
    this.stopSlideShow();
    const interval = this.transitionInterval();
    if (
      this.autoPlay() &&
      this.visible() &&
      Number.isFinite(interval) &&
      interval > 0
    )
      this.slideshowTimer = setInterval(() => this.next(), interval);
  }
  stopSlideShow(): void {
    if (this.slideshowTimer) {
      clearInterval(this.slideshowTimer);
      this.slideshowTimer = null;
    }
  }
  restartSlideShow(): void {
    this.startSlideShow();
  }
  ngOnDestroy(): void {
    this.stopSlideShow();
    globalThis.document?.removeEventListener(
      'click',
      this.capturePointerOpener,
      true,
    );
    this.clearPointerOpener();
  }
  private clearPointerOpener(): void {
    if (this.pointerOpenerTimer !== null) clearTimeout(this.pointerOpenerTimer);
    this.pointerOpenerTimer = null;
    this.pointerOpener = null;
  }
  show(): void {
    this.visible.set(true);
    this.restartSlideShow();
  }
  hide(): void {
    this.visible.set(false);
    this.stopSlideShow();
  }
  toggle(): void {
    if (this.visible()) this.hide();
    else this.show();
  }
  goTo(index: number): void {
    const image = this.images()[index];
    if (!image) return;
    this.activeIndex.set(index);
    this.imageChange.emit({ index, image });
  }
  selectImageFromClick(index: number): void {
    this.goTo(index);
    this.stopSlideShowByClick();
  }
  previousFromClick(): void {
    this.previous();
    this.stopSlideShowByClick();
  }
  nextFromClick(): void {
    this.next();
    this.stopSlideShowByClick();
  }
  private stopSlideShowByClick(): void {
    if (this.shouldStopAutoplayByClick()) this.stopSlideShow();
  }
  scrollThumbnails(viewport: HTMLElement, direction: number): void {
    const vertical =
      this.thumbnailsPosition() === 'left' ||
      this.thumbnailsPosition() === 'right';
    const distance =
      Math.max(
        (vertical ? viewport.clientHeight : viewport.clientWidth) * 0.8,
        160,
      ) * direction;
    if (typeof viewport.scrollBy === 'function')
      viewport.scrollBy({
        [vertical ? 'top' : 'left']: distance,
        behavior: 'smooth',
      });
    else if (vertical) viewport.scrollTop += distance;
    else viewport.scrollLeft += distance;
  }
  onIndicatorKeydown(event: KeyboardEvent, index: number): void {
    const count = this.images().length;
    if (!count) return;
    let target = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      target = (index + 1) % count;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      target = (index - 1 + count) % count;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = count - 1;
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      this.goTo(index);
      return;
    } else return;
    event.preventDefault();
    event.stopPropagation();
    this.goTo(target);
    (event.currentTarget as HTMLElement | null)?.parentElement
      ?.querySelectorAll<HTMLElement>('[role="tab"]')
      .item(target)
      ?.focus();
  }
  previous(): void {
    const count = this.images().length;
    if (!count) return;
    const current = this.clampedActiveIndex();
    const index = this.circular()
      ? (current - 1 + count) % count
      : Math.max(0, current - 1);
    this.goTo(index);
  }
  next(): void {
    const count = this.images().length;
    if (!count) return;
    const current = this.clampedActiveIndex();
    const index = this.circular()
      ? (current + 1) % count
      : Math.min(count - 1, current + 1);
    this.goTo(index);
  }
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' && this.fullScreen() && this.visible()) {
      const root = event.currentTarget as HTMLElement;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('hidden'));
      if (!focusable.length) {
        event.preventDefault();
        root.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === root)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === root)
      ) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.key === 'Escape' && this.fullScreen() && this.visible()) {
      event.preventDefault();
      this.hide();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.goTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.goTo(this.images().length - 1);
    }
  }
}
