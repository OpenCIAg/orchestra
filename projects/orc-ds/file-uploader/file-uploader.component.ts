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
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { FileItemComponent } from './file-item/file-item.component';

import { FileItemData, FileStatus } from './file-uploader.types';

@Component({
  selector: 'orc-file-uploader',
  standalone: true,
  imports: [CommonModule, FileItemComponent],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploaderComponent),
      multi: true,
    },
  ],
})
export class FileUploaderComponent implements ControlValueAccessor, OnDestroy {
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  // ── Inputs ──────────────────────────────────────────────────
  readonly accept = input<string>(''); // e.g., 'image/*,.pdf'
  readonly name = input<string | undefined>(undefined);
  readonly url = input<string | undefined>(undefined);
  readonly method = input<'post' | 'put'>('post');
  readonly headers = input<HttpHeaders | undefined>(undefined);
  readonly multiple = input(true, { transform: booleanAttribute });
  readonly auto = input(false, { transform: booleanAttribute });
  readonly withCredentials = input(false, { transform: booleanAttribute });
  readonly maxFiles = input<number, unknown>(10, {
    transform: numberAttribute,
  });
  readonly fileLimit = input<number | undefined, unknown>(undefined, {
    transform: numberAttribute,
  });
  readonly maxFileSize = input(5 * 1024 * 1024, { transform: numberAttribute }); // PrimeNG-compatible bytes
  readonly invalidFileSizeMessageSummary = input<string | undefined>(undefined);
  readonly invalidFileSizeMessageDetail = input<string | undefined>(undefined);
  readonly invalidFileTypeMessageSummary = input<string | undefined>(undefined);
  readonly invalidFileTypeMessageDetail = input<string | undefined>(undefined);
  readonly invalidFileLimitMessageSummary = input<string | undefined>(
    undefined,
  );
  readonly invalidFileLimitMessageDetail = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly subLabel = input<string | undefined>(undefined);
  readonly dropzoneAriaLabel = input<string | undefined>(undefined);
  readonly chooseLabel = input<string | undefined>(undefined);
  readonly uploadLabel = input<string | undefined>(undefined);
  readonly cancelLabel = input<string | undefined>(undefined);
  readonly removeAriaLabel = input<string | undefined>(undefined);
  readonly uploadingLabel = input<string | undefined>(undefined);
  readonly uploadedLabel = input<string | undefined>(undefined);
  readonly errorLabel = input<string | undefined>(undefined);
  readonly pendingLabel = input<string | undefined>(undefined);
  readonly previewWidth = input(100, { transform: numberAttribute });
  readonly styleClass = input<string | undefined>(undefined);
  readonly style = input<string | Record<string, string | number> | undefined>(
    undefined,
  );
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
  readonly forceDragover = input(false, { transform: booleanAttribute });

  readonly onSelect = output<{
    originalEvent: Event;
    files: File[];
    currentFiles: File[];
  }>();
  readonly onRemove = output<{ originalEvent: Event; file: File }>();
  readonly onClear = output<Event>();
  readonly onUpload = output<{ originalEvent: unknown; files: File[] }>();
  readonly onError = output<{ files: File[]; error?: ErrorEvent }>();
  readonly onProgress = output<{ originalEvent: unknown; progress: number }>();
  readonly onBeforeUpload = output<{ formData: FormData }>();
  readonly uploadHandler = output<{ files: File[] }>();
  readonly onSend = output<{ originalEvent: unknown; formData: FormData }>();
  readonly onImageError = output<{ file: File; originalEvent: Event }>();
  readonly onRemoveUploadedFile = output<{
    file: File;
    originalEvent: Event;
  }>();

  // ── Internal State (Signals) ────────────────────────────────
  readonly files = signal<FileItemData[]>([]);
  readonly isDragging = signal<boolean>(false);
  private readonly cvaDisabled = signal(false);
  private readonly http = inject(HttpClient, { optional: true });
  private uploadSubscription?: Subscription;
  private readonly ownedPreviewUrls = new Set<string>();
  readonly validationMessage = signal('');
  readonly uploading = signal(false);

  // ── CVA callbacks ───────────────────────────────────────────
  private onChange: (value: FileItemData[]) => void = () => {};
  private onTouched: () => void = () => {};

  // ── Computeds ───────────────────────────────────────────────
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly effectiveFileLimit = computed(() => {
    const configured = this.fileLimit() ?? this.maxFiles();
    const limit = Number.isFinite(configured)
      ? Math.max(0, Math.floor(configured))
      : 10;
    return this.multiple() ? limit : Math.min(1, limit);
  });
  readonly hasReachedMaxFiles = computed(
    () => this.files().length >= this.effectiveFileLimit(),
  );
  readonly canUpload = computed(
    () =>
      !this.isDisabled() &&
      !this.uploading() &&
      this.files().some(
        (item) => item.status === 'pending' || item.status === 'error',
      ),
  );

  // ── CVA Methods ─────────────────────────────────────────────
  writeValue(value: FileItemData[] | null): void {
    this.cancelUpload();
    const next = value || [];
    const nextPreviewUrls = new Set(
      next.map((item) => item.previewUrl).filter(Boolean),
    );
    this.files().forEach((item) => {
      if (item.previewUrl && !nextPreviewUrls.has(item.previewUrl))
        this.revokePreview(item);
    });
    this.files.set(next);
    this.validationMessage.set('');
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

    const currentTarget = event.currentTarget;
    if (
      currentTarget instanceof Node &&
      event.relatedTarget instanceof Node &&
      currentTarget.contains(event.relatedTarget)
    )
      return;

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
    this.fileInputRef?.nativeElement.click();
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
    const removed = this.files().find((f) => f.id === id);
    if (!removed || removed.status === 'uploading') return;
    this.files.update((list) => list.filter((f) => f.id !== id));
    this.onChange(this.files());
    this.onTouched();
    if (removed) {
      this.revokePreview(removed);
      this.onRemove.emit({ originalEvent, file: removed.file });
      if (removed.status === 'success')
        this.onRemoveUploadedFile.emit({ originalEvent, file: removed.file });
    }
  }

  clear(originalEvent: Event = new Event('clear')): void {
    if (this.isDisabled()) return;
    this.cancelUpload();
    this.files().forEach((item) => this.revokePreview(item));
    this.files.set([]);
    this.validationMessage.set('');
    this.onChange([]);
    this.onTouched();
    this.onClear.emit(originalEvent);
  }
  upload(): void {
    if (!this.canUpload()) return;
    const selected = this.files().filter(
      (item) => item.status === 'pending' || item.status === 'error',
    );
    const files = selected.map((item) => item.file);
    if (!this.customUpload() && (!this.url() || !this.http)) {
      this.emitValidationError(
        files,
        !this.url()
          ? 'Configure an upload URL or use customUpload.'
          : 'Provide HttpClient to upload files.',
      );
      return;
    }
    this.validationMessage.set('');
    const form = new FormData();
    files.forEach((file) =>
      form.append(this.name() || 'files', file, file.name),
    );
    this.onBeforeUpload.emit({ formData: form });
    if (this.customUpload()) {
      this.uploadHandler.emit({ files });
      return;
    }
    const ids = new Set(selected.map((item) => item.id));
    const update = (
      status: FileStatus,
      progress: number,
      errorMessage?: string,
    ) => {
      this.files.update((items) =>
        items.map((item) =>
          ids.has(item.id) ? { ...item, status, progress, errorMessage } : item,
        ),
      );
      this.onChange(this.files());
    };
    this.uploading.set(true);
    update('uploading', 0);
    const request = this.http!.request(this.method(), this.url()!, {
      body: form,
      headers: this.headers(),
      withCredentials: this.withCredentials(),
      reportProgress: true,
      observe: 'events',
    });
    const subscription = new Subscription();
    this.uploadSubscription = subscription;
    subscription.add(
      request.subscribe({
        next: (event) => {
          if (event.type === HttpEventType.Sent)
            this.onSend.emit({ originalEvent: event, formData: form });
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.min(
              100,
              Math.max(0, Math.round((event.loaded / event.total) * 100)),
            );
            update('uploading', progress);
            this.onProgress.emit({ originalEvent: event, progress });
          }
          if (event.type === HttpEventType.Response) {
            update('success', 100);
            this.uploading.set(false);
            this.onProgress.emit({ originalEvent: event, progress: 100 });
            this.onUpload.emit({ originalEvent: event, files });
          }
        },
        error: (error) => {
          this.uploading.set(false);
          const message = error.message || 'Upload failed. Try again.';
          update('error', 0, message);
          this.emitValidationError(files, message, error);
        },
        complete: () => {
          if (this.uploadSubscription !== subscription) return;
          this.uploading.set(false);
          if (
            this.auto() &&
            this.files().some((item) => item.status === 'pending')
          )
            this.upload();
        },
      }),
    );
  }

  private cancelUpload(): void {
    this.uploadSubscription?.unsubscribe();
    this.uploadSubscription = undefined;
    this.uploading.set(false);
  }
  choose(): void {
    this.onAreaClick();
  }
  uploader(): void {
    this.upload();
  }

  // ── Logic ───────────────────────────────────────────────────
  private handleFiles(
    newFiles: File[],
    originalEvent: Event = new Event('select'),
  ): void {
    if (!newFiles.length || this.isDisabled()) return;
    this.validationMessage.set('');
    const currentFiles = this.files();
    const existingKeys = new Set(
      currentFiles.map((item) => this.fileKey(item.file)),
    );
    const seenKeys = new Set<string>();
    const duplicateFiles: File[] = [];
    const duplicateFreeFiles = newFiles.filter((file) => {
      const key = this.fileKey(file);
      if (existingKeys.has(key) || seenKeys.has(key)) {
        duplicateFiles.push(file);
        return false;
      }
      seenKeys.add(key);
      return true;
    });
    this.emitValidationError(duplicateFiles, 'Duplicate file');

    const candidates = duplicateFreeFiles.map((file) =>
      this.createFileItem(file),
    );
    const invalidCandidates = candidates.filter(
      (item) => item.status === 'error',
    );
    if (invalidCandidates.length) {
      this.emitValidationError(
        invalidCandidates.map((item) => item.file),
        invalidCandidates
          .map((item) => item.errorMessage)
          .filter(Boolean)
          .join('; ') || 'Invalid file',
      );
    }
    const validCandidates = candidates.filter(
      (item) => item.status !== 'error',
    );
    const remainingSlots = Math.max(
      0,
      this.effectiveFileLimit() - currentFiles.length,
    );
    const validItems = validCandidates.slice(0, remainingSlots);
    this.emitLimitError(
      validCandidates.slice(remainingSlots).map((item) => item.file),
    );
    // Allocate previews only after validation and capacity checks succeed.
    validItems.forEach((item) => {
      if (item.type.startsWith('image/')) {
        item.previewUrl = URL.createObjectURL(item.file);
        this.ownedPreviewUrls.add(item.previewUrl);
      }
    });

    if (!this.multiple()) {
      if (validItems.length) {
        currentFiles.forEach((item) => this.revokePreview(item));
        this.files.set(validItems);
      }
    } else {
      this.files.update((list) => [...list, ...validItems]);
    }

    if (!validItems.length) return;
    this.onChange(this.files());
    this.onTouched();
    if (validItems.length)
      this.onSelect.emit({
        originalEvent,
        files: validItems.map((item) => item.file),
        currentFiles: this.files().map((item) => item.file),
      });
    if (this.auto()) this.upload();
  }

  private createFileItem(file: File): FileItemData {
    const isOverSize = file.size > this.maxFileSize();

    // Follow native accept tokens: case-insensitive extensions, MIME types and MIME wildcards.
    let isInvalidType = false;
    if (this.accept()) {
      const allowedTypes = this.accept()
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      if (allowedTypes.length > 0 && !allowedTypes.includes('*/*')) {
        const fileType = file.type.toLowerCase();

        isInvalidType = !allowedTypes.some((type) => {
          if (type.startsWith('.'))
            return file.name.toLowerCase().endsWith(type);
          if (type.endsWith('/*'))
            return fileType.startsWith(type.slice(0, -1));
          return fileType === type;
        });
      }
    }

    let status: FileStatus = 'pending';
    let errorMessage = '';

    if (isOverSize) {
      status = 'error';
      const summary = this.invalidFileSizeMessageSummary();
      const detail = this.invalidFileSizeMessageDetail()?.replace(
        '{0}',
        this.formatBytes(this.maxFileSize()),
      );
      errorMessage =
        [summary, detail].filter(Boolean).join(': ') ||
        `File exceeds ${this.formatBytes(this.maxFileSize())}.`;
    } else if (isInvalidType) {
      status = 'error';
      const summary = this.invalidFileTypeMessageSummary();
      const detail = this.invalidFileTypeMessageDetail()?.replace(
        '{0}',
        this.accept(),
      );
      errorMessage =
        [summary, detail].filter(Boolean).join(': ') ||
        `File type must match ${this.accept()}.`;
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
    };
    return item;
  }

  private fileKey(file: File): string {
    return `${file.name}\u0000${file.size}\u0000${file.lastModified}\u0000${file.type}`;
  }

  private emitValidationError(
    files: File[],
    message: string,
    error?: unknown,
  ): void {
    if (!files.length) return;
    this.validationMessage.update((current) =>
      current ? `${current} ${message}` : message,
    );
    this.onError.emit({
      files,
      error: new ErrorEvent('error', { message, error }),
    });
  }

  private emitLimitError(files: File[]): void {
    if (!files.length) return;
    const summary = this.invalidFileLimitMessageSummary();
    const detail = this.invalidFileLimitMessageDetail();
    const configured = this.effectiveFileLimit();
    const message =
      summary && detail
        ? `${summary}: ${detail.replace('{0}', String(configured))}`
        : summary || detail || `Maximum of ${configured} files allowed`;
    this.emitValidationError(files, message);
  }

  /**
   * A failed preview will never render again for this item. Release an object
   * URL owned by the uploader immediately instead of retaining it until the
   * item is removed or the uploader is destroyed. Caller-owned URLs remain
   * untouched.
   */
  handleImageError(event: { file: File; originalEvent: Event }): void {
    const item = this.files().find(
      (candidate) => candidate.file === event.file,
    );
    if (item) this.revokePreview(item);
    this.onImageError.emit(event);
  }

  private revokePreview(item: FileItemData): void {
    if (item.previewUrl && this.ownedPreviewUrls.delete(item.previewUrl))
      URL.revokeObjectURL(item.previewUrl);
  }

  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  ngOnDestroy(): void {
    this.cancelUpload();
    this.ownedPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    this.ownedPreviewUrls.clear();
  }
}
