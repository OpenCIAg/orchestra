import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
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
  readonly alt = input('');
  readonly fallbackSrc = input('');
  readonly fit = input<ImageFit>('cover');
  readonly width = input<string | number>('');
  readonly height = input<string | number>('');
  readonly loading = input<'eager' | 'lazy'>('lazy');
  readonly radius = input<'none' | 'sm' | 'md' | 'lg' | 'full'>('md');
  readonly placeholder = input('Imagem indisponível');
  readonly ariaLabel = input('');

  private readonly usingFallback = signal(false);
  readonly failed = signal(false);
  readonly renderedSrc = computed(() => this.failed() ? '' : (this.usingFallback() ? this.fallbackSrc() : this.src()));
  readonly loaded = output<void>();
  readonly error = output<Event>();

  onLoad(): void { this.loaded.emit(); }

  onError(event: Event): void {
    if (this.fallbackSrc() && !this.usingFallback()) {
      this.usingFallback.set(true);
      return;
    }
    this.failed.set(true);
    this.error.emit(event);
  }
}
