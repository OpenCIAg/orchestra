import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  FileUploaderComponent,
  FileItemComponent,
  FileItemData,
} from '@ciag/orchestra/file-uploader';
import { ButtonComponent } from '@ciag/orchestra/button';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ModalComponent } from '@ciag/orchestra/modal';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-file-uploader-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FileUploaderComponent,
    FileItemComponent,
    ButtonComponent,
    FooterComponent,
    ModalComponent,
  ],
  templateUrl: './file-uploader-page.component.html',
  styleUrl: './file-uploader-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderPageComponent {
  private readonly fb = inject(FormBuilder);

  // Simple reactive form for the FileUploader
  readonly form = this.fb.group({
    files: [[] as FileItemData[]],
  });

  readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  readonly isUploading = signal(false);

  // ── DADOS PARA COMPONENTES PLANOS ──
  readonly dummyFiles: FileItemData[] = [
    {
      id: 'doc-1',
      file: new File([''], 'documento.pdf', { type: 'application/pdf' }),
      name: 'documento.pdf',
      size: 1024000,
      formattedSize: '1000 KB',
      type: 'application/pdf',
      progress: 55,
      status: 'uploading',
    },
    {
      id: 'img-1',
      file: new File([''], 'imagem.png', { type: 'image/png' }),
      name: 'imagem.png',
      size: 24641536,
      formattedSize: '23.5 MB',
      type: 'image/png',
      progress: 100,
      status: 'success',
    },
  ];

  private progressTimer?: ReturnType<typeof setInterval>;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.progressTimer !== undefined) clearInterval(this.progressTimer);
    });
  }

  simulateUpload(): void {
    if (this.isUploading()) return;
    const currentFiles = this.form.controls.files.value || [];
    const activeIds = new Set(
      currentFiles
        .filter((item) => item.status === 'pending' || item.status === 'error')
        .map((item) => item.id),
    );
    if (!activeIds.size) return;
    this.isUploading.set(true);
    this.form.controls.files.disable();
    this.form.controls.files.setValue(
      currentFiles.map((item) =>
        activeIds.has(item.id)
          ? { ...item, status: 'uploading', progress: 0, errorMessage: '' }
          : item,
      ),
    );
    this.progressTimer = setInterval(() => {
      const next = (this.form.controls.files.value || []).map((item) => {
        if (!activeIds.has(item.id)) return item;
        const progress = Math.min(100, item.progress + 20);
        return {
          ...item,
          progress,
          status:
            progress === 100 ? ('success' as const) : ('uploading' as const),
        };
      });
      this.form.controls.files.setValue(next);
      if (
        next.every(
          (item) => !activeIds.has(item.id) || item.status === 'success',
        )
      ) {
        clearInterval(this.progressTimer);
        this.progressTimer = undefined;
        this.isUploading.set(false);
        this.form.controls.files.enable();
      }
    }, 300);
  }
}
