import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  booleanAttribute,
  effect,
  untracked,
  viewChild,
} from '@angular/core';
import { ModalComponent } from '@ciag/orchestra/modal';

export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

@Component({
  selector: 'orc-image',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  private readonly imageContainer =
    viewChild<ElementRef<HTMLElement>>('imageContainer');
  private previewOpener: HTMLButtonElement | null = null;
  private focusRestoreTimer: ReturnType<typeof setTimeout> | undefined;

  readonly src = input('');
  readonly srcSet = input<string | undefined>(undefined);
  readonly sizes = input<string | undefined>(undefined);
  readonly previewImageSrc = input<string | undefined>(undefined);
  readonly previewImageSrcSet = input<string | undefined>(undefined);
  readonly previewImageSizes = input<string | undefined>(undefined);
  readonly alt = input('');
  readonly fallbackSrc = input('');
  readonly fit = input<ImageFit>('cover');
  readonly width = input<string | number>('');
  readonly height = input<string | number>('');
  readonly loading = input<'eager' | 'lazy'>('lazy');
  readonly radius = input<'none' | 'sm' | 'md' | 'lg' | 'full'>('md');
  readonly placeholder = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly zoomOutAriaLabel = input<string | undefined>(undefined);
  readonly zoomInAriaLabel = input<string | undefined>(undefined);
  readonly rotateLeftAriaLabel = input<string | undefined>(undefined);
  readonly rotateRightAriaLabel = input<string | undefined>(undefined);
  readonly closePreviewAriaLabel = input<string | undefined>(undefined);
  readonly preview = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly imageClass = input('');
  readonly imageStyle = input<Record<string, string | number> | undefined>(
    undefined,
  );
  /** @deprecated Native dialog placement is not controlled by the image preview. */
  readonly appendTo = input<unknown>(undefined);
  /** @deprecated Preview transition timing is fixed by the modal stylesheet. */
  readonly showTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
  /** @deprecated Preview transition timing is fixed by the modal stylesheet. */
  readonly hideTransitionOptions = input('100ms linear');

  private readonly usingFallback = signal(false);
  readonly failed = signal(false);
  readonly renderedSrc = computed(() =>
    this.failed() ? '' : this.usingFallback() ? this.fallbackSrc() : this.src(),
  );
  readonly renderedSrcSet = computed(() =>
    this.usingFallback() || this.failed() ? undefined : this.srcSet(),
  );
  readonly renderedSizes = computed(() =>
    this.usingFallback() || this.failed() ? undefined : this.sizes(),
  );
  readonly loaded = output<void>();
  readonly error = output<Event>();
  readonly onImageError = output<Event>({ alias: 'onImageError' });
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly previewVisible = signal(false);
  readonly scale = signal(1);
  readonly rotation = signal(0);

  private lastSource: string | symbol = Symbol('uninitialized');
  private lastFallbackSource: string | symbol = Symbol('uninitialized');
  private lastSourceSet: string | undefined | symbol = Symbol('uninitialized');
  private lastSizes: string | undefined | symbol = Symbol('uninitialized');
  private lastPreviewSource: string | undefined | symbol =
    Symbol('uninitialized');
  private lastPreviewSourceSet: string | undefined | symbol =
    Symbol('uninitialized');
  private lastPreviewSizes: string | undefined | symbol =
    Symbol('uninitialized');

  constructor() {
    effect(() => {
      const source = this.src();
      const fallbackSource = this.fallbackSrc();
      const sourceSet = this.srcSet();
      const sizes = this.sizes();
      const previewSource = this.previewImageSrc();
      const previewSourceSet = this.previewImageSrcSet();
      const previewSizes = this.previewImageSizes();
      const previewEnabled = this.preview();
      const mainSourceInputsMatchPrevious =
        source === this.lastSource &&
        fallbackSource === this.lastFallbackSource &&
        sourceSet === this.lastSourceSet &&
        sizes === this.lastSizes;
      const previewSourceInputsMatchPrevious =
        previewSource === this.lastPreviewSource &&
        previewSourceSet === this.lastPreviewSourceSet &&
        previewSizes === this.lastPreviewSizes;
      const sourceChanged =
        !mainSourceInputsMatchPrevious || !previewSourceInputsMatchPrevious;
      if (!mainSourceInputsMatchPrevious) {
        this.lastSource = source;
        this.lastFallbackSource = fallbackSource;
        this.lastSourceSet = sourceSet;
        this.lastSizes = sizes;
        this.usingFallback.set(false);
        this.failed.set(false);
      }
      if (!previewSourceInputsMatchPrevious) {
        this.lastPreviewSource = previewSource;
        this.lastPreviewSourceSet = previewSourceSet;
        this.lastPreviewSizes = previewSizes;
      }
      if (sourceChanged) {
        this.scale.set(1);
        this.rotation.set(0);
      }
      if (
        (!previewEnabled || !this.renderedSrc()) &&
        untracked(() => this.previewVisible())
      ) {
        this.closePreview();
      }
    });
  }

  cssDimension(value: string | number): string | null {
    if (value === '') return null;
    return typeof value === 'number' ? `${value}px` : value;
  }

  onLoad(): void {
    this.loaded.emit();
  }

  onError(event: Event): void {
    if (this.fallbackSrc() && !this.usingFallback()) {
      this.usingFallback.set(true);
      return;
    }
    this.failed.set(true);
    this.error.emit(event);
    this.onImageError.emit(event);
  }

  onImageClick(event?: MouseEvent): void {
    if (!this.preview() || !this.renderedSrc() || this.previewVisible()) return;
    if (this.focusRestoreTimer !== undefined) {
      clearTimeout(this.focusRestoreTimer);
      this.focusRestoreTimer = undefined;
    }
    this.previewOpener =
      (event?.currentTarget as HTMLButtonElement | null | undefined) ??
      this.imageContainer()?.nativeElement.querySelector<HTMLButtonElement>(
        '.orc-image__trigger',
      ) ??
      null;
    this.scale.set(1);
    this.rotation.set(0);
    this.previewVisible.set(true);
    this.onShow.emit();
  }

  accessibilityLabel(value: string | undefined, fallback: string): string {
    return value?.trim() || fallback;
  }

  previewTriggerLabel(): string {
    const alt = this.alt().trim();
    return this.accessibilityLabel(
      this.ariaLabel(),
      alt ? `Open image preview: ${alt}` : 'Open image preview',
    );
  }

  onPreviewModalClosed(): void {
    if (this.previewVisible()) this.closePreview();
  }

  closePreview(): void {
    if (!this.previewVisible()) return;
    this.previewVisible.set(false);
    this.onHide.emit();
    const opener = this.previewOpener;
    this.focusRestoreTimer = setTimeout(() => {
      this.focusRestoreTimer = undefined;
      if (this.previewVisible()) return;
      const target = opener?.isConnected
        ? opener
        : this.imageContainer()?.nativeElement;
      target?.focus({ preventScroll: true });
      this.previewOpener = null;
    }, 0);
  }

  zoomIn(): void {
    this.scale.update((value) => Math.min(3, value + 0.25));
  }

  zoomOut(): void {
    this.scale.update((value) => Math.max(0.5, value - 0.25));
  }

  rotateRight(): void {
    this.rotation.update((value) => (value + 90) % 360);
  }

  rotateLeft(): void {
    this.rotation.update((value) => (value + 270) % 360);
  }
}
