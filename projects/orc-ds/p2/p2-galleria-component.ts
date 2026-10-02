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
import { P2_SHARED_STYLES } from './p2-shared';

export interface GalleryImage {
  src: string;
  alt?: string;
  thumbnail?: string;
  title?: string;
}
@Component({
  selector: 'orc-galleria, orc-gallery',
  standalone: true,
  template: `
    <section
      class="orc-galleria"
      [class.orc-galleria--fullscreen]="fullScreen() && visible()"
      [class]="
        'orc-galleria orc-galleria--thumbs-' +
        thumbnailsPosition() +
        ' orc-galleria--indicators-' +
        indicatorsPosition() +
        ' ' +
        containerClass()
      "
      [style]="containerStyle()"
      [style.z-index]="fullScreen() && visible() ? baseZIndex() + 1000 : null"
      [attr.role]="fullScreen() ? 'dialog' : null"
      [attr.aria-modal]="fullScreen() && visible() ? 'true' : null"
      [attr.aria-label]="label()?.trim() || null"
      [attr.aria-roledescription]="roleDescription()?.trim() || null"
      [attr.aria-hidden]="visible() ? null : 'true'"
      [attr.tabindex]="visible() ? 0 : -1"
      (mouseenter)="hovered.set(true)"
      (mouseleave)="hovered.set(false)"
      (keydown)="onKeydown($event)"
    >
      @if (visible()) {
        @if (fullScreen()) {
          <button
            type="button"
            class="orc-galleria__close"
            #fullscreenClose
            [attr.aria-label]="closeLabel()?.trim() || 'Close gallery'"
            (click)="hide()"
          >
            ×
          </button>
        }
        @if (fullScreen()) {
          <div
            class="orc-galleria__mask"
            [class]="maskClass()"
            (click)="hide()"
          ></div>
        }
        <div class="orc-galleria__content">
          @if (activeImage(); as image) {
            <figure>
              <img
                [src]="image.src"
                [attr.alt]="image.alt ?? image.title ?? ''"
              />
              @if (showIndicators() && showIndicatorsOnItem()) {
                <div
                  class="orc-galleria__indicators orc-galleria__indicators--item"
                  role="tablist"
                  aria-label="Gallery indicators"
                >
                  @for (image of images(); track $index) {
                    <button
                      type="button"
                      role="tab"
                      [attr.aria-label]="'Go to image ' + ($index + 1)"
                      [attr.aria-selected]="
                        $index === clampedActiveIndex() ? 'true' : 'false'
                      "
                      [attr.tabindex]="$index === clampedActiveIndex() ? 0 : -1"
                      (mouseenter)="
                        changeItemOnIndicatorHover() && goTo($index)
                      "
                      (click)="goTo($index)"
                      (keydown)="onIndicatorKeydown($event, $index)"
                    ></button>
                  }
                </div>
              }
              @if (image.title) {
                <figcaption>{{ image.title }}</figcaption>
              }
            </figure>
          }
          @if (showThumbnails()) {
            <div class="orc-galleria__thumbnail-track">
              @if (showThumbnailNavigators()) {
                <button
                  type="button"
                  class="orc-galleria__thumbnail-nav"
                  aria-label="Previous thumbnails"
                  (click)="scrollThumbnails(thumbnailViewport, -1)"
                >
                  {{
                    thumbnailsPosition() === 'left' ||
                    thumbnailsPosition() === 'right'
                      ? '↑'
                      : '‹'
                  }}
                </button>
              }
              <div
                #thumbnailViewport
                class="thumbs"
                role="list"
                [attr.aria-label]="
                  thumbnailLabel()?.trim() || 'Gallery thumbnails'
                "
              >
                @for (image of images(); track $index) {
                  <button
                    type="button"
                    [class.active]="$index === clampedActiveIndex()"
                    [attr.aria-current]="
                      $index === clampedActiveIndex() ? 'true' : null
                    "
                    [attr.aria-label]="
                      thumbnailLabel()?.trim()
                        ? thumbnailLabel()?.trim() + ' ' + ($index + 1)
                        : image.alt || 'Image ' + ($index + 1)
                    "
                    (mouseenter)="changeItemOnIndicatorHover() && goTo($index)"
                    (click)="selectImageFromClick($index)"
                  >
                    <img
                      [src]="image.thumbnail || image.src"
                      [attr.alt]="image.alt ?? ''"
                    />
                  </button>
                }
              </div>
              @if (showThumbnailNavigators()) {
                <button
                  type="button"
                  class="orc-galleria__thumbnail-nav"
                  aria-label="Next thumbnails"
                  (click)="scrollThumbnails(thumbnailViewport, 1)"
                >
                  {{
                    thumbnailsPosition() === 'left' ||
                    thumbnailsPosition() === 'right'
                      ? '↓'
                      : '›'
                  }}
                </button>
              }
            </div>
          }
          <nav aria-label="Gallery controls">
            @if (showNavigators()) {
              <button
                type="button"
                (click)="previousFromClick()"
                [disabled]="!canPrevious()"
                [attr.aria-label]="previousLabel()?.trim() || 'Previous image'"
              >
                ‹
              </button>
            }
            @if (showIndicators() && !showIndicatorsOnItem()) {
              <div
                class="orc-galleria__indicators"
                role="tablist"
                aria-label="Gallery indicators"
              >
                @for (image of images(); track $index) {
                  <button
                    type="button"
                    role="tab"
                    [attr.aria-label]="'Go to image ' + ($index + 1)"
                    [attr.aria-selected]="
                      $index === clampedActiveIndex() ? 'true' : 'false'
                    "
                    [attr.tabindex]="$index === clampedActiveIndex() ? 0 : -1"
                    (mouseenter)="changeItemOnIndicatorHover() && goTo($index)"
                    (click)="selectImageFromClick($index)"
                    (keydown)="onIndicatorKeydown($event, $index)"
                  ></button>
                }
              </div>
            }
            @if (showNavigators()) {
              <button
                type="button"
                (click)="nextFromClick()"
                [disabled]="!canNext()"
                [attr.aria-label]="nextLabel()?.trim() || 'Next image'"
              >
                ›
              </button>
            }
          </nav>
        </div>
      }
    </section>
  `,
  styles: [
    P2_SHARED_STYLES +
      `.orc-galleria{position:relative;display:grid;gap:.5rem;width:100%;max-width:48rem}.orc-galleria__content{position:relative;z-index:1;display:grid;gap:.5rem}.orc-galleria--fullscreen{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;max-width:none;padding:1rem}.orc-galleria__mask{position:absolute;inset:0;z-index:0;background:var(--orc-component-scrim)}.orc-galleria__close{position:absolute;z-index:2;top:.5rem;right:.5rem;border:0;border-radius:50%;background:var(--orc-component-scrim);color:var(--orc-component-on-dark);font-size:1.5rem;width:2rem;height:2rem}.orc-galleria figure{position:relative;margin:0;aspect-ratio:16/9;overflow:hidden;border-radius:.5rem;background:var(--orc-component-surface-muted)}.orc-galleria figure img{width:100%;height:100%;object-fit:contain}.orc-galleria figcaption{position:absolute;right:0;bottom:0;left:0;padding:.45rem .7rem;background:var(--orc-component-scrim);color:var(--orc-component-on-dark)}.orc-galleria__thumbnail-track{display:flex;align-items:center;gap:.35rem}.thumbs{display:flex;flex:1;gap:.35rem;overflow:auto}.thumbs button{width:4rem;height:3rem;flex:0 0 auto;padding:0;border:2px solid transparent;border-radius:.3rem;overflow:hidden}.thumbs button.active{border-color:var(--orc-component-interactive)}.thumbs img{width:100%;height:100%;object-fit:cover}.orc-galleria__thumbnail-nav,.orc-galleria nav button{border:1px solid var(--orc-component-border-strong);border-radius:.3rem;background:var(--orc-component-surface)}.orc-galleria nav{display:flex;justify-content:center;gap:1rem;align-items:center}.orc-galleria__indicators{position:absolute;bottom:.5rem;left:50%;z-index:2;display:flex;gap:.25rem;transform:translateX(-50%);padding:.2rem .4rem;border-radius:.25rem;background:var(--orc-component-scrim);color:var(--orc-component-on-dark)}.orc-galleria__indicators button{width:.55rem;height:.55rem;padding:0;border:1px solid var(--orc-component-on-dark);border-radius:50%;background:transparent}.orc-galleria__indicators button[aria-selected="true"]{background:var(--orc-component-on-dark)}.orc-galleria__indicators--item{top:.5rem;right:.5rem;bottom:auto;left:auto;transform:none}.orc-galleria--indicators-top .orc-galleria__indicators{top:.5rem;bottom:auto}.orc-galleria--indicators-left .orc-galleria__indicators{top:50%;right:auto;bottom:auto;left:.5rem;transform:translateY(-50%)}.orc-galleria--indicators-right .orc-galleria__indicators{top:50%;right:.5rem;bottom:auto;left:auto;transform:translateY(-50%)}.orc-galleria--thumbs-top .orc-galleria__thumbnail-track{order:-1}.orc-galleria--thumbs-left .orc-galleria__content,.orc-galleria--thumbs-right .orc-galleria__content{display:grid;grid-template-columns:minmax(0,1fr) auto}.orc-galleria--thumbs-left figure,.orc-galleria--thumbs-left nav,.orc-galleria--thumbs-left .orc-galleria__thumbnail-track{grid-column:1}.orc-galleria--thumbs-right figure,.orc-galleria--thumbs-right nav,.orc-galleria--thumbs-right .orc-galleria__thumbnail-track{grid-column:2}.orc-galleria--thumbs-left .orc-galleria__thumbnail-track,.orc-galleria--thumbs-right .orc-galleria__thumbnail-track{grid-row:1}.orc-galleria--thumbs-left figure,.orc-galleria--thumbs-right figure{grid-row:1}.orc-galleria--thumbs-left nav,.orc-galleria--thumbs-right nav{grid-column:1 / -1;grid-row:2}.orc-galleria--thumbs-left .orc-galleria__content{grid-template-columns:auto minmax(0,1fr)}.orc-galleria--thumbs-left figure{grid-column:2;grid-row:1}.orc-galleria--thumbs-left .orc-galleria__thumbnail-track{grid-column:1;grid-row:1}.orc-galleria--thumbs-right .orc-galleria__content{grid-template-columns:minmax(0,1fr) auto}.orc-galleria--thumbs-right figure{grid-column:1;grid-row:1}.orc-galleria--thumbs-right .orc-galleria__thumbnail-track{grid-column:2;grid-row:1}.orc-galleria--thumbs-left .orc-galleria__thumbnail-track,.orc-galleria--thumbs-right .orc-galleria__thumbnail-track{flex-direction:column;align-self:stretch;min-height:0}.orc-galleria--thumbs-left .thumbs,.orc-galleria--thumbs-right .thumbs{flex-direction:column;overflow-x:hidden;overflow-y:auto;min-height:0}`,
  ],
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
