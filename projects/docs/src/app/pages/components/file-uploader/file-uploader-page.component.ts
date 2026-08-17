import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FileUploaderComponent, FileItemComponent, FileItemData } from '@ciag/orchestra/file-uploader';
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
    ModalComponent
  ],
  templateUrl: './file-uploader-page.component.html',
  styleUrl: './file-uploader-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderPageComponent {
  private readonly fb = inject(FormBuilder);

  // Simple reactive form for the FileUploader
  readonly form = this.fb.group({
    files: [[] as FileItemData[]]
  });

  readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

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
      status: 'uploading'
    },
    {
      id: 'img-1',
      file: new File([''], 'imagem.png', { type: 'image/png' }),
      name: 'imagem.png',
      size: 24641536,
      formattedSize: '23.5 MB',
      type: 'image/png',
      progress: 100,
      status: 'success'
    }
  ];

  constructor() {}

  simulateUpload(): void {
    const currentFiles = this.form.get('files')?.value || [];
    if (currentFiles.length === 0) return;

    this.isUploading.set(true);

    // Simulate upload process
    currentFiles.forEach(item => {
      if (item.status === 'pending' || item.status === 'error') {
        item.status = 'uploading';
        item.progress = 0;
        item.errorMessage = '';
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 20) + 10;
          if (progress >= 100) {
            progress = 100;
            item.status = 'success';
            item.progress = progress;
            clearInterval(interval);
            
            // Check if all are done
            if (currentFiles.every(f => f.status === 'success' || f.status === 'error')) {
              this.isUploading.set(false);
            }
          } else {
            item.progress = progress;
          }
          // Trigger change detection by emitting new array reference
          this.form.patchValue({ files: [...currentFiles] });
        }, 300);
      }
    });
  }

  readonly hasPendingFiles = computed(() => {
    const files = this.formValue().files || [];
    return files.some(f => f.status === 'pending' || f.status === 'error');
  });
}
