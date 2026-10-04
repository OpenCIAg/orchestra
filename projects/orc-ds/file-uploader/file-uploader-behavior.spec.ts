import { HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploaderComponent } from './file-uploader.component';

describe('FileUploader browser behavior', () => {
  let fixture: ComponentFixture<FileUploaderComponent>;
  let component: FileUploaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploaderComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(FileUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.inject(HttpTestingController).verify();
  });

  function file(name: string, contents = 'data', type = 'text/plain'): File {
    return new File([contents], name, { type, lastModified: 10 });
  }

  it('selects accepted files, rejects invalid types and sizes, and reports the rejected files', () => {
    fixture.componentRef.setInput('accept', '.pdf');
    fixture.componentRef.setInput('maxFileSize', 4);
    const errors: File[][] = [];
    component.onError.subscribe((event) => errors.push(event.files));
    const accepted = file('ok.pdf', '1234', 'application/pdf');
    const wrongType = file('notes.txt', '1');
    const tooLarge = file('large.pdf', '12345', 'application/pdf');

    component['handleFiles'](
      [wrongType, tooLarge, accepted],
      new Event('change'),
    );

    expect(component.files().map((item) => item.file)).toEqual([accepted]);
    expect(errors).toEqual([[wrongType, tooLarge]]);
  });

  it('does not add duplicate files and reports an actionable duplicate error', () => {
    const duplicateErrors: Array<{ files: File[]; message?: string }> = [];
    component.onError.subscribe((event) =>
      duplicateErrors.push({
        files: event.files,
        message: event.error?.message,
      }),
    );
    const selected = file('same.txt');

    component['handleFiles']([selected]);
    component['handleFiles']([file('same.txt')]);

    expect(component.files()).toHaveSize(1);
    expect(duplicateErrors).toEqual([
      { files: [jasmine.any(File)], message: 'Duplicate file' },
    ]);
  });

  it('reports files beyond the configured limit with the configured message', () => {
    fixture.componentRef.setInput('fileLimit', 1);
    fixture.componentRef.setInput(
      'invalidFileLimitMessageSummary',
      'Too many files',
    );
    fixture.componentRef.setInput(
      'invalidFileLimitMessageDetail',
      'Choose at most {0}',
    );
    const errors: Array<{ files: File[]; message?: string }> = [];
    component.onError.subscribe((event) =>
      errors.push({ files: event.files, message: event.error?.message }),
    );
    const first = file('first.txt');
    const second = file('second.txt');

    component['handleFiles']([first, second]);

    expect(component.files().map((item) => item.file)).toEqual([first]);
    expect(errors[0].files).toEqual([second]);
    expect(errors[0].message).toBe('Too many files: Choose at most 1');
  });

  it('supports keyboard activation and keeps disabled/full controls out of the tab order', () => {
    const input = fixture.nativeElement.querySelector(
      'input[type=file]',
    ) as HTMLInputElement;
    const click = spyOn(input, 'click');
    const dropzone = fixture.nativeElement.querySelector(
      '.orc-file-uploader__dropzone',
    ) as HTMLElement;
    dropzone.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(click).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(dropzone.getAttribute('tabindex')).toBe('-1');
    click.calls.reset();
    dropzone.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(click).not.toHaveBeenCalled();
  });

  it('normalizes forceDragover as a boolean input', () => {
    const dropzone = fixture.nativeElement.querySelector(
      '.orc-file-uploader__dropzone',
    ) as HTMLElement;

    fixture.componentRef.setInput('forceDragover', 'false');
    fixture.detectChanges();
    expect(
      dropzone.classList.contains('orc-file-uploader__dropzone--dragover'),
    ).toBeFalse();

    fixture.componentRef.setInput('forceDragover', '');
    fixture.detectChanges();
    expect(
      dropzone.classList.contains('orc-file-uploader__dropzone--dragover'),
    ).toBeTrue();
  });

  it('keeps the dragover state while moving between dropzone descendants', () => {
    const dropzone = fixture.nativeElement.querySelector(
      '.orc-file-uploader__dropzone',
    ) as HTMLElement;
    const content = dropzone.querySelector(
      '.orc-file-uploader__dropzone-content',
    ) as HTMLElement;

    dropzone.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
    fixture.detectChanges();
    expect(
      dropzone.classList.contains('orc-file-uploader__dropzone--dragover'),
    ).toBeTrue();

    dropzone.dispatchEvent(
      new DragEvent('dragleave', {
        bubbles: true,
        relatedTarget: content,
      }),
    );
    fixture.detectChanges();
    expect(
      dropzone.classList.contains('orc-file-uploader__dropzone--dragover'),
    ).toBeTrue();

    dropzone.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
    fixture.detectChanges();
    expect(
      dropzone.classList.contains('orc-file-uploader__dropzone--dragover'),
    ).toBeFalse();
  });

  it('revokes image object URLs when values are replaced, removed, cleared, or destroyed', () => {
    const create = spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
    const revoke = spyOn(URL, 'revokeObjectURL');
    const image = file('photo.png', 'image', 'image/png');
    component['handleFiles']([image]);
    expect(create).toHaveBeenCalledOnceWith(image);
    const id = component.files()[0].id;
    component.onRemoveFile(id);
    expect(revoke).toHaveBeenCalledOnceWith('blob:test');

    component['handleFiles']([image]);
    component.clear();
    expect(revoke).toHaveBeenCalledTimes(2);

    component['handleFiles']([image]);
    fixture.destroy();
    expect(revoke).toHaveBeenCalledTimes(3);
  });

  it('updates file status and progress across an HTTP upload lifecycle', () => {
    fixture.componentRef.setInput('url', '/upload');
    const http = TestBed.inject(HttpTestingController);
    const selected = file('report.txt');
    component['handleFiles']([selected]);
    component.upload();
    expect(component.files()[0].status).toBe('uploading');
    const request = http.expectOne('/upload');
    expect(request.request.method).toBe('POST');
    request.event({ type: HttpEventType.UploadProgress, loaded: 3, total: 10 });
    expect(component.files()[0].progress).toBe(30);
    request.flush({ uploaded: true });
    expect(component.files()[0].status).toBe('success');
    expect(component.files()[0].progress).toBe(100);
  });

  it('applies the configured HTTP method, headers, credentials, and field name', () => {
    fixture.componentRef.setInput('url', '/upload');
    fixture.componentRef.setInput('method', 'put');
    fixture.componentRef.setInput(
      'headers',
      new HttpHeaders({ 'X-Upload': 'audit' }),
    );
    fixture.componentRef.setInput('withCredentials', true);
    fixture.componentRef.setInput('name', 'attachments');
    const http = TestBed.inject(HttpTestingController);
    const selected = file('configured.txt');
    component['handleFiles']([selected]);
    const sent = jasmine.createSpy('sent');
    const uploaded = jasmine.createSpy('uploaded');
    component.onSend.subscribe(sent);
    component.onUpload.subscribe(uploaded);

    component.upload();
    const request = http.expectOne('/upload');
    expect(request.request.method).toBe('PUT');
    expect(request.request.headers.get('X-Upload')).toBe('audit');
    expect(request.request.withCredentials).toBeTrue();
    expect((request.request.body as FormData).getAll('attachments')).toEqual([
      selected,
    ]);
    request.flush({ ok: true });
    expect(sent).toHaveBeenCalled();
    expect(uploaded).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ files: [selected] }),
    );
  });

  it('renders configured labels, icons, styles, preview sizing, and action visibility', () => {
    fixture.componentRef.setInput('label', 'Drop a document');
    fixture.componentRef.setInput('subLabel', 'PDF or image');
    fixture.componentRef.setInput('dropzoneAriaLabel', 'Document picker');
    fixture.componentRef.setInput('chooseIcon', 'icon-choose');
    fixture.componentRef.setInput('uploadIcon', 'icon-upload');
    fixture.componentRef.setInput('cancelIcon', 'icon-cancel');
    fixture.componentRef.setInput('uploadLabel', 'Send files');
    fixture.componentRef.setInput('cancelLabel', 'Discard files');
    fixture.componentRef.setInput('uploadStyleClass', 'upload-custom');
    fixture.componentRef.setInput('cancelStyleClass', 'cancel-custom');
    fixture.componentRef.setInput('showUploadButton', true);
    fixture.componentRef.setInput('showCancelButton', true);
    fixture.componentRef.setInput('styleClass', 'uploader-custom');
    fixture.componentRef.setInput('style', { '--audit-width': '31rem' });
    fixture.componentRef.setInput('previewWidth', 72);
    fixture.componentRef.setInput('removeAriaLabel', 'Remove document');
    const selected = file('preview.png', 'image', 'image/png');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:audit-preview');
    component['handleFiles']([selected]);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-file-uploader',
    ) as HTMLElement;
    const dropzone = fixture.nativeElement.querySelector(
      '.orc-file-uploader__dropzone',
    ) as HTMLElement;
    expect(root.classList).toContain('uploader-custom');
    expect(root.style.getPropertyValue('--audit-width')).toBe('31rem');
    fixture.componentRef.setInput('style', '--audit-width: 33rem');
    fixture.detectChanges();
    expect(root.style.getPropertyValue('--audit-width')).toBe('33rem');
    fixture.componentRef.setInput('style', { '--audit-width': '31rem' });
    fixture.detectChanges();
    expect(dropzone.getAttribute('aria-label')).toBe('Document picker');
    expect(fixture.nativeElement.textContent).toContain('Drop a document');
    expect(fixture.nativeElement.textContent).toContain('PDF or image');
    expect(fixture.nativeElement.textContent).toContain('Send files');
    expect(fixture.nativeElement.textContent).toContain('Discard files');
    expect(fixture.nativeElement.querySelector('.icon-choose')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.icon-upload')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.icon-cancel')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.upload-custom'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.cancel-custom'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('img').parentElement.parentElement
        .style.width,
    ).toBe('72px');
    expect(
      fixture.nativeElement
        .querySelector('orc-file-item button')
        .getAttribute('aria-label'),
    ).toBe('Remove document');

    fixture.componentRef.setInput('showUploadButton', false);
    fixture.componentRef.setInput('showCancelButton', false);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-file-uploader__upload'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.orc-file-uploader__cancel'),
    ).toBeNull();
  });

  it('passes the localized file status labels to the child file item', () => {
    fixture.componentRef.setInput('uploadingLabel', 'Sending');
    fixture.componentRef.setInput('uploadedLabel', 'Complete');
    fixture.componentRef.setInput('errorLabel', 'Failed');
    fixture.componentRef.setInput('pendingLabel', 'Queued');
    const selected = file('status.txt');
    component['handleFiles']([selected]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Queued');

    component.files.update((items) =>
      items.map((item) => ({ ...item, status: 'uploading' })),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sending');

    component.files.update((items) =>
      items.map((item) => ({ ...item, status: 'success' })),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Complete');

    component.files.update((items) =>
      items.map((item) => ({ ...item, status: 'error' })),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Failed');
  });

  it('uses maxFiles, single-file mode, and the configured size/type messages', () => {
    fixture.componentRef.setInput('maxFiles', 1);
    const limited = [file('max-first.txt'), file('max-second.txt')];
    component['handleFiles'](limited);
    expect(component.files().map((item) => item.file)).toEqual([limited[0]]);
    component.clear();

    fixture.componentRef.setInput('multiple', false);
    fixture.componentRef.setInput('maxFiles', 5);
    fixture.componentRef.setInput('maxFileSize', 2);
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.componentRef.setInput('invalidFileSizeMessageSummary', 'Too big');
    fixture.componentRef.setInput('invalidFileSizeMessageDetail', 'Limit {0}');
    fixture.componentRef.setInput(
      'invalidFileTypeMessageSummary',
      'Wrong type',
    );
    fixture.componentRef.setInput(
      'invalidFileTypeMessageDetail',
      'Expected {0}',
    );
    const errors: Array<{ files: File[]; message?: string }> = [];
    component.onError.subscribe((event) =>
      errors.push({ files: event.files, message: event.error?.message }),
    );
    const first = file('first.png', '12', 'image/png');
    const second = file('second.png', '1', 'image/png');
    const wrongType = file('wrong.txt', '1');
    const tooLarge = file('large.png', '123', 'image/png');

    component['handleFiles']([first, second]);
    component['handleFiles']([wrongType, tooLarge]);

    expect(component.effectiveFileLimit()).toBe(1);
    expect(component.files().map((item) => item.file)).toEqual([first]);
    expect(errors.map((event) => event.message)).toEqual([
      'Maximum of 1 files allowed',
      'Wrong type: Expected image/*; Too big: Limit 2 Bytes',
    ]);
  });

  it('renders the basic mode trigger and uses the configured labels and styles', () => {
    fixture.componentRef.setInput('mode', 'basic');
    fixture.componentRef.setInput('chooseLabel', 'Select document');
    fixture.componentRef.setInput('chooseStyleClass', 'choose-custom');
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '.orc-file-uploader__basic-trigger',
    ) as HTMLButtonElement;
    expect(trigger.textContent).toContain('Select document');
    expect(trigger.classList).toContain('choose-custom');
    expect(
      fixture.nativeElement.querySelector('.orc-file-uploader__dropzone'),
    ).toBeNull();
  });
  it('never allocates previews for files rejected by the limit and preserves caller-owned URLs', () => {
    const create = spyOn(URL, 'createObjectURL').and.returnValues(
      'blob:owned',
      'blob:unexpected',
    );
    const revoke = spyOn(URL, 'revokeObjectURL');
    fixture.componentRef.setInput('fileLimit', 1);
    component['handleFiles']([
      file('one.png', 'a', 'image/png'),
      file('two.png', 'b', 'image/png'),
    ]);
    expect(create).toHaveBeenCalledTimes(1);
    const external = { ...component.files()[0], previewUrl: 'blob:external' };
    component.writeValue([external]);
    expect(revoke).toHaveBeenCalledOnceWith('blob:owned');
    component.clear();
    fixture.destroy();
    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it('shows rejection messages, accepts compound extensions, and reports changes only for accepted files', () => {
    fixture.componentRef.setInput('accept', '.tar.gz');
    const change = jasmine.createSpy('change');
    const touched = jasmine.createSpy('touched');
    component.registerOnChange(change);
    component.registerOnTouched(touched);
    component['handleFiles']([file('bad.txt')]);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role=alert]').textContent,
    ).toContain('.tar.gz');
    expect(change).not.toHaveBeenCalled();
    component['handleFiles']([file('backup.TAR.GZ')]);
    expect(component.files()).toHaveSize(1);
    expect(change).toHaveBeenCalledTimes(1);
    expect(touched).toHaveBeenCalled();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeNull();
  });

  it('reports missing upload configuration without reporting a completed upload', () => {
    const uploaded = jasmine.createSpy('uploaded');
    component.onUpload.subscribe(uploaded);
    component['handleFiles']([file('pending.txt')]);
    component.upload();
    expect(uploaded).not.toHaveBeenCalled();
    expect(component.files()[0].status).toBe('pending');
    expect(component.validationMessage()).toContain('upload URL');
  });

  it('delegates custom uploads without an HTTP request or a false success event', () => {
    fixture.componentRef.setInput('customUpload', true);
    const custom = jasmine.createSpy('custom');
    const uploaded = jasmine.createSpy('uploaded');
    component.uploadHandler.subscribe(custom);
    component.onUpload.subscribe(uploaded);
    const selected = file('custom.txt');
    component['handleFiles']([selected]);
    component.upload();
    expect(custom).toHaveBeenCalledOnceWith({ files: [selected] });
    expect(uploaded).not.toHaveBeenCalled();
  });

  it('retries failed uploads once and does not restart active or successful uploads', () => {
    fixture.componentRef.setInput('url', '/upload');
    const http = TestBed.inject(HttpTestingController);
    component['handleFiles']([file('retry.txt')]);
    component.upload();
    const first = http.expectOne('/upload');
    component.upload();
    http.expectNone('/upload');
    expect(first.cancelled).toBeFalse();
    first.flush('Unavailable', { status: 503, statusText: 'Unavailable' });
    expect(component.files()[0].status).toBe('error');
    expect(component.canUpload()).toBeTrue();
    component.upload();
    http.expectOne('/upload').flush({ ok: true });
    expect(component.files()[0].status).toBe('success');
    component.upload();
    http.expectNone('/upload');
  });

  it('cancels active HTTP requests when clearing, replacing values, or destroying', () => {
    fixture.componentRef.setInput('url', '/upload');
    const http = TestBed.inject(HttpTestingController);
    for (const cancel of [
      () => component.clear(),
      () => component.writeValue([]),
      () => fixture.destroy(),
    ]) {
      component['handleFiles']([file('cancel.txt')]);
      component.upload();
      const request = http.expectOne('/upload');
      cancel();
      expect(request.cancelled).toBeTrue();
      expect(component.uploading()).toBeFalse();
    }
  });

  it('keeps new files queued while a batch uploads and only uploads unfinished files next', () => {
    fixture.componentRef.setInput('url', '/upload');
    const http = TestBed.inject(HttpTestingController);
    const firstFile = file('first.txt');
    const nextFile = file('next.txt');
    component['handleFiles']([firstFile]);
    component.upload();
    const first = http.expectOne('/upload');
    component['handleFiles']([nextFile]);
    first.flush({ ok: true });
    component.upload();
    const next = http.expectOne('/upload');
    expect((next.request.body as FormData).getAll('files')).toEqual([nextFile]);
    next.flush({ ok: true });
    expect(component.files().map((item) => item.status)).toEqual([
      'success',
      'success',
    ]);
  });

  it('forwards preview failures and gives the configured removal style to the native button', () => {
    fixture.componentRef.setInput('removeStyleClass', 'remove-custom');
    const selected = file('image.png', 'invalid image bytes', 'image/png');
    component['handleFiles']([selected]);
    const errors = jasmine.createSpy('imageErrors');
    component.onImageError.subscribe(errors);
    fixture.detectChanges();
    const preview = fixture.nativeElement.querySelector(
      'img',
    ) as HTMLImageElement;
    const event = new Event('error');
    preview.dispatchEvent(event);
    fixture.detectChanges();
    expect(errors).toHaveBeenCalledOnceWith({
      file: selected,
      originalEvent: event,
    });
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('button.remove-custom'),
    ).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('(imageError)');
  });

  it('releases an owned preview URL as soon as preview decoding fails', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:broken-preview');
    const revoke = spyOn(URL, 'revokeObjectURL');
    const selected = file('broken.png', 'invalid image bytes', 'image/png');
    component['handleFiles']([selected]);
    fixture.detectChanges();

    const preview = fixture.nativeElement.querySelector(
      'img',
    ) as HTMLImageElement;
    preview.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(revoke).toHaveBeenCalledOnceWith('blob:broken-preview');
    component.clear();
    fixture.destroy();
    expect(revoke).toHaveBeenCalledOnceWith('blob:broken-preview');
  });
  it('automatically starts files queued during an upload after the active batch succeeds', () => {
    fixture.componentRef.setInput('url', '/upload');
    fixture.componentRef.setInput('auto', true);
    const http = TestBed.inject(HttpTestingController);
    component['handleFiles']([file('auto-first.txt')]);
    const first = http.expectOne('/upload');
    const nextFile = file('auto-next.txt');
    component['handleFiles']([nextFile]);
    http.expectNone('/upload');
    first.flush({ ok: true });
    const next = http.expectOne('/upload');
    expect((next.request.body as FormData).getAll('files')).toEqual([nextFile]);
    expect(component.uploading()).toBeTrue();
    next.flush({ ok: true });
    expect(component.uploading()).toBeFalse();
  });
});
