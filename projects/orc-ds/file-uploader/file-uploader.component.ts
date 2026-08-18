import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  signal,
  output,
  booleanAttribute,
  numberAttribute,
  ViewChild,
  ElementRef,
  forwardRef,
  HostListener,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { FileItemComponent } from './file-item/file-item.component';

import { FileItemData, FileStatus } from './file-uploader.types';

@Component({
  selector: 'orc-file-uploader, orc-file-upload',
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
  readonly name = input<string | undefined>(undefined);
  readonly url = input<string | undefined>(undefined);
  readonly method = input<'post' | 'put'>('post');
  readonly headers = input<HttpHeaders | undefined>(undefined);
  readonly multiple = input(true, { transform: booleanAttribute });
  readonly auto = input(false, { transform: booleanAttribute });
  readonly withCredentials = input(false, { transform: booleanAttribute });
  readonly maxFiles = input<number>(10);
  readonly fileLimit = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  readonly maxFileSize = input(5 * 1024 * 1024, { transform: numberAttribute }); // PrimeNG-compatible bytes
  readonly invalidFileSizeMessageSummary = input('File too large');
  readonly invalidFileSizeMessageDetail = input('Maximum allowed size is {0}.');
  readonly invalidFileTypeMessageSummary = input('Invalid file type');
  readonly invalidFileTypeMessageDetail = input('Allowed file types: {0}.');
  readonly invalidFileLimitMessageSummary = input('Maximum number of files exceeded');
  readonly invalidFileLimitMessageDetail = input('Maximum {0} files allowed.');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string>('Clique ou arraste seus arquivos aqui');
  readonly subLabel = input<string>('Suporta imagens e PDFs');
  readonly chooseLabel = input<string | undefined>(undefined);
  readonly uploadLabel = input<string | undefined>(undefined);
  readonly cancelLabel = input<string | undefined>(undefined);
  readonly previewWidth = input(100, { transform: numberAttribute });
  readonly styleClass = input<string | undefined>(undefined);
  readonly style = input<string | Record<string, string | number> | undefined>(undefined);
  readonly chooseIcon = input<string | undefined>(undefined);
  readonly uploadIcon = input<string | undefined>(undefined);
  readonly cancelIcon = input<string | undefined>(undefined);
  readonly showUploadButton = input(true, { transform: booleanAttribute });
  readonly showCancelButton = input(true, { transform: booleanAttribute });
  readonly mode = input<'advanced' | 'basic'>('advanced');
  readonly customUpload = input(false, { transform: booleanAttribute });
  readonly uploadStyleClass = input('');
  readonly cancelStyleClass = input('');
  readonly chooseStyleClass = input('');
  readonly removeStyleClass = input('');
  readonly forceDragover = input<boolean>(false);

  readonly onSelect = output<{ originalEvent: Event; files: File[]; currentFiles: File[] }>();
  readonly onRemove = output<{ originalEvent: Event; file: File }>();
  readonly onClear = output<Event>();
  readonly onUpload = output<{ originalEvent: unknown; files: File[] }>();
  readonly onError = output<{ files: File[]; error?: ErrorEvent }>();
  readonly onProgress = output<{ originalEvent: unknown; progress: number }>();
  readonly onBeforeUpload = output<{ formData: FormData }>();
  readonly uploadHandler = output<{ files: File[] }>();
  readonly onSend = output<{ originalEvent: unknown; formData: FormData }>();
  readonly onImageError = output<{ file: File; originalEvent: Event }>();
  readonly onRemoveUploadedFile = output<{ file: File; originalEvent: Event }>();

  // ── Internal State (Signals) ────────────────────────────────
  readonly files = signal<FileItemData[]>([]);
  readonly isDragging = signal<boolean>(false);
  private readonly cvaDisabled = signal(false);
  private readonly http = inject(HttpClient, { optional: true });
  
  // ── CVA callbacks ───────────────────────────────────────────
  private onChange: (value: FileItemData[]) => void = () => {};
  private onTouched: () => void = () => {};
  
  // ── Computeds ───────────────────────────────────────────────
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly hasReachedMaxFiles = computed(() => {
    const limit = this.fileLimit() ?? this.maxFiles();
    return this.multiple() ? this.files().length >= limit : this.files().length >= 1;
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
    this.cvaDisabled.set(isDisabled);
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
      this.handleFiles(Array.from(droppedFiles), event);
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
      this.handleFiles(Array.from(input.files), event);
      input.value = ''; // Reset input to allow re-selecting same file
    }
  }

  onRemoveFile(id: string, originalEvent: Event = new Event('remove')): void {
    if (this.isDisabled()) return;
    const removed = this.files().find(f => f.id === id);
    this.files.update(list => list.filter(f => f.id !== id));
    this.onChange(this.files());
    if (removed) this.onRemove.emit({ originalEvent, file: removed.file });
  }

  clear(originalEvent: Event = new Event('clear')): void { if (this.isDisabled()) return; this.files.set([]); this.onChange([]); this.onClear.emit(originalEvent); }
  upload(): void {
    if (this.isDisabled() || !this.files().length) return;
    const files = this.files().filter(item => item.status !== 'error').map(item => item.file);
    if (!files.length) return;
    const form = new FormData();
    files.forEach(file => form.append(this.name() || 'files', file, file.name));
    this.onBeforeUpload.emit({ formData: form });
    if (this.customUpload() || !this.url() || !this.http) {
      if (this.customUpload()) this.uploadHandler.emit({ files });
      else this.onUpload.emit({ originalEvent: new Event('upload'), files });
      return;
    }
    const request = this.http.request(this.method(), this.url()!, { body: form, headers: this.headers(), withCredentials: this.withCredentials(), reportProgress: true, observe: 'events' });
    request.subscribe({
      next: event => {
        if (event.type === HttpEventType.Sent) this.onSend.emit({ originalEvent: event, formData: form });
        if (event.type === HttpEventType.UploadProgress && event.total) this.onProgress.emit({ originalEvent: event, progress: Math.round((event.loaded / event.total) * 100) });
        if (event.type === HttpEventType.Response) { this.onProgress.emit({ originalEvent: event, progress: 100 }); this.onUpload.emit({ originalEvent: event, files }); }
      },
      error: error => this.onError.emit({ files, error: error as ErrorEvent })
    });
  }
  choose(): void { this.onAreaClick(); }
  uploader(): void { this.upload(); }

  // ── Logic ───────────────────────────────────────────────────
  private handleFiles(newFiles: File[], originalEvent: Event = new Event('select')): void {
    const currentFiles = this.files();
    let filesToAdd = newFiles;

    if (!this.multiple()) {
      filesToAdd = [newFiles[0]];
    } else {
      const remainingSlots = (this.fileLimit() ?? this.maxFiles()) - currentFiles.length;
      if (remainingSlots <= 0) {
        this.onError.emit({ files: [] });
        return;
      }
      filesToAdd = newFiles.slice(0, remainingSlots);
    }

    const newItems: FileItemData[] = filesToAdd.map(file => this.createFileItem(file));
    const invalidFiles = newItems.filter(item => item.status === 'error').map(item => item.file);
    if (invalidFiles.length) this.onError.emit({ files: invalidFiles });
    const validItems = newItems.filter(item => item.status !== 'error');

    if (!this.multiple()) {
      this.files.set(validItems);
    } else {
      this.files.update(list => [...list, ...validItems]);
    }

    this.onChange(this.files());
    if (validItems.length) this.onSelect.emit({ originalEvent, files: validItems.map(item => item.file), currentFiles: this.files().map(item => item.file) });
    if (this.auto()) this.upload();
  }

  private createFileItem(file: File): FileItemData {
    const isOverSize = file.size > this.maxFileSize();
    
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
      errorMessage = `${this.invalidFileSizeMessageSummary()}: ${this.invalidFileSizeMessageDetail().replace('{0}', this.formatBytes(this.maxFileSize()))}`;
    } else if (isInvalidType) {
      status = 'error';
      errorMessage = `${this.invalidFileTypeMessageSummary()}: ${this.invalidFileTypeMessageDetail().replace('{0}', this.accept())}`;
    }

    const item = {
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
    return item;
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
