import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  booleanAttribute,
  HostListener,
} from '@angular/core';

export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

@Component({
  selector: 'orc-image',
  standalone: true,
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
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
  readonly placeholder = input('Imagem indisponível');
  readonly ariaLabel = input('');
  readonly preview = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly imageClass = input('');
  readonly imageStyle = input<Record<string, string | number> | undefined>(undefined);
  readonly appendTo = input<unknown>(undefined);
  readonly showTransitionOptions = input('150ms cubic-bezier(0, 0, 0.2, 1)');
  readonly hideTransitionOptions = input('100ms linear');

  private readonly usingFallback = signal(false);
  readonly failed = signal(false);
  readonly renderedSrc = computed(() => this.failed() ? '' : (this.usingFallback() ? this.fallbackSrc() : this.src()));
  readonly loaded = output<void>();
  readonly error = output<Event>();
  readonly onImageError = this.error;
  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly previewVisible = signal(false);
  readonly scale = signal(1);
  readonly rotation = signal(0);

  onLoad(): void { this.loaded.emit(); }

  onError(event: Event): void {
    if (this.fallbackSrc() && !this.usingFallback()) {
      this.usingFallback.set(true);
      return;
    }
    this.failed.set(true);
    this.error.emit(event);
  }
  onImageClick(): void { if (!this.preview() || !this.renderedSrc()) return; this.scale.set(1); this.rotation.set(0); this.previewVisible.set(true); this.onShow.emit(); }
  closePreview(): void { if (!this.previewVisible()) return; this.previewVisible.set(false); this.onHide.emit(); }
  zoomIn(): void { this.scale.update(value => Math.min(3, value + 0.25)); }
  zoomOut(): void { this.scale.update(value => Math.max(0.5, value - 0.25)); }
  rotateRight(): void { this.rotation.update(value => (value + 90) % 360); }
  rotateLeft(): void { this.rotation.update(value => (value + 270) % 360); }
  @HostListener('document:keydown.escape') onEscape(): void { this.closePreview(); }
}
