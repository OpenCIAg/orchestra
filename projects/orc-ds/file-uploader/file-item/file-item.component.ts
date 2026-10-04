import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  numberAttribute,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileItemData } from '../file-uploader.types';
import { ProgressBarComponent } from '@ciag/orchestra/progress';
import { ButtonComponent } from '@ciag/orchestra/button';

@Component({
  selector: 'orc-file-item',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, ButtonComponent],
  templateUrl: './file-item.component.html',
  styleUrl: './file-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileItemComponent {
  // ── Inputs ──────────────────────────────────────────────────
  readonly fileData = input.required<FileItemData>();
  readonly disabled = input<boolean>(false);
  readonly removeAriaLabel = input<string | undefined>(undefined);
  readonly uploadingLabel = input<string | undefined>(undefined);
  readonly uploadedLabel = input<string | undefined>(undefined);
  readonly errorLabel = input<string | undefined>(undefined);
  readonly pendingLabel = input<string | undefined>(undefined);
  readonly previewWidth = input(100, { transform: numberAttribute });
  readonly removeStyleClass = input('');
  private readonly failedPreview = signal<string | undefined>(undefined);
  readonly showPreview = computed(
    () =>
      this.isImage() &&
      !!this.fileData().previewUrl &&
      this.failedPreview() !== this.fileData().previewUrl,
  );
  readonly effectivePreviewWidth = computed(() =>
    Number.isFinite(this.previewWidth())
      ? Math.max(1, this.previewWidth())
      : 100,
  );

  // ── Outputs ─────────────────────────────────────────────────
  readonly remove = output<string>();
  readonly imageError = output<{ file: File; originalEvent: Event }>();

  // ── Computeds ───────────────────────────────────────────────
  readonly isImage = computed(() => {
    return this.fileData().type.startsWith('image/');
  });

  readonly badgeVariant = computed(() => {
    switch (this.fileData().status) {
      case 'success':
        return 'soft';
      case 'error':
        return 'soft';
      default:
        return 'outline';
    }
  });

  readonly badgeStatus = computed(() => {
    switch (this.fileData().status) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'uploading':
        return 'primary';
      default:
        return 'neutral';
    }
  });

  readonly showProgress = computed(() => {
    return (
      this.fileData().status === 'uploading' || this.fileData().progress > 0
    );
  });

  // ── Handlers ────────────────────────────────────────────────
  onRemove(): void {
    if (this.disabled()) return;
    this.remove.emit(this.fileData().id);
  }

  onImageError(event: Event): void {
    this.failedPreview.set(this.fileData().previewUrl);
    this.imageError.emit({ file: this.fileData().file, originalEvent: event });
  }
}
