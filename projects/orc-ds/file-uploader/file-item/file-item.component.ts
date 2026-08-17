import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
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

  // ── Outputs ─────────────────────────────────────────────────
  readonly remove = output<string>();

  // ── Computeds ───────────────────────────────────────────────
  readonly isImage = computed(() => {
    return this.fileData().type.startsWith('image/');
  });

  readonly badgeVariant = computed(() => {
    switch (this.fileData().status) {
      case 'success': return 'soft';
      case 'error': return 'soft';
      default: return 'outline';
    }
  });

  readonly badgeStatus = computed(() => {
    switch (this.fileData().status) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'uploading': return 'primary';
      default: return 'neutral';
    }
  });

  readonly showProgress = computed(() => {
    return this.fileData().status === 'uploading' || this.fileData().progress > 0;
  });

  // ── Handlers ────────────────────────────────────────────────
  onRemove(): void {
    if (this.disabled()) return;
    this.remove.emit(this.fileData().id);
  }
}
