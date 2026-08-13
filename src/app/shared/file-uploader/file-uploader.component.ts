import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  signal,
  ViewChild,
  ElementRef,
  forwardRef,
  HostListener,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileItemComponent } from './file-item/file-item.component';

import { FileItemData, FileStatus } from './file-uploader.types';

@Component({
  selector: 'app-file-uploader, orc-file-uploader',
  standalone: true,
  imports: [CommonModule, FileItemComponent],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploaderComponent),
      multi: true
    }
  ]
})
export class FileUploaderComponent implements ControlValueAccessor {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  // ── Inputs ──────────────────────────────────────────────────
  readonly accept = input<string>(''); // e.g., 'image/*,.pdf'
  readonly multiple = input<boolean>(true);
  readonly maxFiles = input<number>(10);
  readonly maxFileSize = input<number>(5); // In MB
  readonly disabled = input<boolean>(false);
  readonly label = input<string>('Clique ou arraste seus arquivos aqui');
  readonly subLabel = input<string>('Suporta imagens e PDFs');
  readonly forceDragover = input<boolean>(false);

  // ── Internal State (Signals) ────────────────────────────────
  readonly files = signal<FileItemData[]>([]);
  readonly isDragging = signal<boolean>(false);
  
  // ── CVA callbacks ───────────────────────────────────────────
  private onChange: (value: FileItemData[]) => void = () => {};
  private onTouched: () => void = () => {};
  
  // ── Computeds ───────────────────────────────────────────────
  readonly isDisabled = computed(() => this.disabled());
  readonly hasReachedMaxFiles = computed(() => {
    return this.multiple() ? this.files().length >= this.maxFiles() : this.files().length >= 1;
  });

  // ── CVA Methods ─────────────────────────────────────────────
  writeValue(value: FileItemData[] | null): void {
    this.files.set(value || []);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // handled via input optionally, but mostly via form group
  }

  // ── Drag & Drop Handlers ────────────────────────────────────
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isDisabled() || this.hasReachedMaxFiles()) return;
    this.isDragging.set(true);
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    if (this.isDisabled() || this.hasReachedMaxFiles()) return;
    
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      this.handleFiles(Array.from(droppedFiles));
    }
  }

  // ── User Actions ────────────────────────────────────────────
  onAreaClick(): void {
    if (this.isDisabled() || this.hasReachedMaxFiles()) return;
    this.fileInputRef.nativeElement.click();
    this.onTouched();
  }

  onAreaKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onAreaClick();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
      input.value = ''; // Reset input to allow re-selecting same file
    }
  }

  onRemoveFile(id: string): void {
    if (this.isDisabled()) return;
    this.files.update(list => list.filter(f => f.id !== id));
    this.onChange(this.files());
  }

  // ── Logic ───────────────────────────────────────────────────
  private handleFiles(newFiles: File[]): void {
    const currentFiles = this.files();
    let filesToAdd = newFiles;

    if (!this.multiple()) {
      filesToAdd = [newFiles[0]];
    } else {
      const remainingSlots = this.maxFiles() - currentFiles.length;
      if (remainingSlots <= 0) return;
      filesToAdd = newFiles.slice(0, remainingSlots);
    }

    const newItems: FileItemData[] = filesToAdd.map(file => this.createFileItem(file));
    
    if (!this.multiple()) {
      this.files.set(newItems);
    } else {
      this.files.update(list => [...list, ...newItems]);
    }

    this.onChange(this.files());
  }

  private createFileItem(file: File): FileItemData {
    const isOverSize = file.size > this.maxFileSize() * 1024 * 1024;
    
    // Simplistic accept validation (for demo purposes)
    let isInvalidType = false;
    if (this.accept()) {
      const allowedTypes = this.accept().split(',').map(t => t.trim().toLowerCase());
      if (allowedTypes.length > 0 && !allowedTypes.includes('*/*')) {
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        const fileType = file.type.toLowerCase();
        
        isInvalidType = !allowedTypes.some(type => {
          if (type.startsWith('.')) return fileExt === type;
          if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', ''));
          return fileType === type;
        });
      }
    }

    let status: FileStatus = 'pending';
    let errorMessage = '';

    if (isOverSize) {
      status = 'error';
      errorMessage = `O arquivo excede o limite de ${this.maxFileSize()}MB`;
    } else if (isInvalidType) {
      status = 'error';
      errorMessage = 'Formato de arquivo não suportado';
    }

    return {
      id: Math.random().toString(36).substring(2, 11),
      file,
      name: file.name,
      size: file.size,
      formattedSize: this.formatBytes(file.size),
      type: file.type,
      progress: 0,
      status,
      errorMessage,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    };
  }

  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
