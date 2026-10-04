import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { FileUploaderComponent } from '@ciag/orchestra/file-uploader';
import { FileUploaderPageComponent } from './file-uploader-page.component';

describe('File uploader documentation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [FileUploaderPageComponent],
      providers: [provideRouter([])],
    }),
  );

  it('accepts the advertised size and completes the explicitly simulated upload through its button', fakeAsync(() => {
    const fixture = TestBed.createComponent(FileUploaderPageComponent);
    fixture.detectChanges();
    const uploaderElement = fixture.debugElement.query(
      By.directive(FileUploaderComponent),
    );
    const uploader = uploaderElement.componentInstance as FileUploaderComponent;
    expect(uploader.maxFileSize()).toBe(10 * 1024 * 1024);
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(['document content beyond ten bytes'], 'report.pdf', {
        type: 'application/pdf',
      }),
    );
    const input = uploaderElement.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.files.value).toHaveSize(1);
    uploaderElement.nativeElement
      .querySelector('.orc-file-uploader__upload')
      .click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isUploading()).toBeTrue();
    expect(uploader.isDisabled()).toBeTrue();
    tick(1500);
    fixture.detectChanges();
    expect(fixture.componentInstance.isUploading()).toBeFalse();
    expect(fixture.componentInstance.form.controls.files.value![0].status).toBe(
      'success',
    );
    expect(uploader.files()[0].progress).toBe(100);
    fixture.destroy();
  }));

  it('cancels progress timers when navigating away', fakeAsync(() => {
    const fixture = TestBed.createComponent(FileUploaderPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.controls.files.setValue([
      {
        ...fixture.componentInstance.dummyFiles[0],
        status: 'pending',
        progress: 0,
      },
    ]);
    fixture.componentInstance.simulateUpload();
    fixture.destroy();
    tick(3000);
    expect(
      fixture.componentInstance.form.controls.files.value![0].progress,
    ).toBe(0);
  }));
});
