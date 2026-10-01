import { Component } from '@angular/core';
import { ModalComponent } from '@ciag/orchestra/modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageComponent } from './image.component';

@Component({
  standalone: true,
  imports: [ModalComponent, ImageComponent],
  template:
    '<orc-modal [isOpen]="true" [showHeader]="false"><div modal-body><orc-image [src]="src" [preview]="true" /></div></orc-modal>',
})
class ParentModalHost {
  readonly src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
}

@Component({
  standalone: true,
  imports: [ImageComponent],
  template:
    '<orc-image [src]="src" (error)="errorCount = errorCount + 1" (onImageError)="aliasCount = aliasCount + 1" />',
})
class ImageOutputHost {
  readonly src = 'data:image/svg+xml;base64,invalid';
  errorCount = 0;
  aliasCount = 0;
}

describe('Image browser behavior', () => {
  let fixture: ComponentFixture<ImageComponent>;
  let image: ImageComponent;
  let originalBodyOverflow = '';

  beforeEach(() => {
    originalBodyOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    fixture?.destroy();
    document.body.style.overflow = originalBodyOverflow;
  });

  const VALID_IMAGE =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iNDgwIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0icmVkIi8+PC9zdmc+';
  const FALLBACK_IMAGE =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iNDgwIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0iYmx1ZSIvPjwvc3ZnPg==';

  const create = (inputs: Record<string, unknown> = {}) => {
    fixture = TestBed.createComponent(ImageComponent);
    image = fixture.componentInstance;
    for (const [name, value] of Object.entries(inputs))
      fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return image;
  };

  const trigger = () =>
    fixture.nativeElement.querySelector(
      '.orc-image__trigger',
    ) as HTMLButtonElement;

  const dialog = () =>
    fixture.nativeElement.querySelector('dialog.p-dialog') as HTMLDialogElement;

  it('resets fallback and failed state when the source changes', () => {
    const component = create({
      src: VALID_IMAGE,
      srcSet: `${VALID_IMAGE} 1x`,
      sizes: '100vw',
      fallbackSrc: FALLBACK_IMAGE,
    });
    const errors = jasmine.createSpy('errors');
    component.error.subscribe(errors);

    let source = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    source.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(component.renderedSrc()).toBe(FALLBACK_IMAGE);
    expect(component.failed()).toBeFalse();
    expect(source.getAttribute('srcset')).toBeNull();
    expect(source.getAttribute('sizes')).toBeNull();
    source = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    source.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(component.failed()).toBeTrue();
    expect(errors).toHaveBeenCalledOnceWith(jasmine.any(Event));

    fixture.componentRef.setInput('src', VALID_IMAGE);
    fixture.componentRef.setInput('srcSet', `${VALID_IMAGE} 2x`);
    fixture.componentRef.setInput('sizes', '50vw');
    fixture.detectChanges();
    expect(component.renderedSrc()).toBe(VALID_IMAGE);
    expect(component.failed()).toBeFalse();
    source = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(source.src).toBe(VALID_IMAGE);
    expect(source.getAttribute('srcset')).toBe(`${VALID_IMAGE} 2x`);
    expect(source.getAttribute('sizes')).toBe('50vw');
  });

  it('registers both public error output names in a consumer template', () => {
    const outputFixture = TestBed.createComponent(ImageOutputHost);
    outputFixture.detectChanges();
    const source = outputFixture.nativeElement.querySelector(
      'img',
    ) as HTMLImageElement;
    source.dispatchEvent(new Event('error'));
    outputFixture.detectChanges();
    expect(outputFixture.componentInstance.errorCount).toBe(1);
    expect(outputFixture.componentInstance.aliasCount).toBe(1);
    outputFixture.destroy();
  });

  it('renders a plain image without preview and preserves an empty alt attribute', () => {
    create({ src: VALID_IMAGE, alt: '', preview: false });

    expect(trigger()).toBeNull();
    const imageElement = fixture.nativeElement.querySelector(
      '.orc-image > img',
    ) as HTMLImageElement;
    expect(imageElement).toBeTruthy();
    expect(imageElement.getAttribute('alt')).toBe('');
  });

  it('applies presentation, responsive-source, and loading inputs to the image', () => {
    create({
      src: VALID_IMAGE,
      srcSet: `${VALID_IMAGE} 1x`,
      sizes: '(max-width: 600px) 100vw, 50vw',
      fit: 'contain',
      width: '12rem',
      height: '8rem',
      loading: 'eager',
      radius: 'lg',
      styleClass: 'gallery-frame',
      imageClass: 'cover-image',
      imageStyle: { objectPosition: 'center top', opacity: 0.8 },
    });

    const figure = fixture.nativeElement.querySelector(
      'figure.orc-image',
    ) as HTMLElement;
    const imageElement = figure.querySelector('img') as HTMLImageElement;
    expect(figure.classList).toContain('gallery-frame');
    expect(figure.classList).toContain('orc-image--lg');
    expect(figure.style.width).toBe('12rem');
    expect(figure.style.height).toBe('8rem');
    expect(imageElement.classList).toContain('cover-image');
    expect(imageElement.getAttribute('srcset')).toBe(`${VALID_IMAGE} 1x`);
    expect(imageElement.getAttribute('sizes')).toBe(
      '(max-width: 600px) 100vw, 50vw',
    );
    expect(imageElement.loading).toBe('eager');
    expect(imageElement.style.objectFit).toBe('contain');
    expect(imageElement.style.objectPosition).toBe('center top');
    expect(imageElement.style.opacity).toBe('0.8');
  });

  it('uses preview-specific responsive sources and emits load and preview lifecycle outputs', async () => {
    const component = create({
      src: VALID_IMAGE,
      srcSet: `${VALID_IMAGE} 1x`,
      sizes: '100vw',
      previewImageSrc: FALLBACK_IMAGE,
      previewImageSrcSet: `${FALLBACK_IMAGE} 2x`,
      previewImageSizes: '80vw',
      alt: 'A red landscape',
      preview: true,
    });
    const loaded = jasmine.createSpy('loaded');
    const shown = jasmine.createSpy('shown');
    const hidden = jasmine.createSpy('hidden');
    component.loaded.subscribe(loaded);
    component.onShow.subscribe(shown);
    component.onHide.subscribe(hidden);

    const thumbnail = fixture.nativeElement.querySelector(
      '.orc-image__trigger > img',
    ) as HTMLImageElement;
    thumbnail.dispatchEvent(new Event('load'));
    expect(loaded).toHaveBeenCalledTimes(1);
    expect(thumbnail.getAttribute('srcset')).toBe(`${VALID_IMAGE} 1x`);
    expect(thumbnail.getAttribute('sizes')).toBe('100vw');

    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();
    const preview = fixture.nativeElement.querySelector(
      '.orc-image__preview-content > img',
    ) as HTMLImageElement;
    expect(shown).toHaveBeenCalledTimes(1);
    expect(preview.src).toBe(FALLBACK_IMAGE);
    expect(preview.getAttribute('srcset')).toBe(`${FALLBACK_IMAGE} 2x`);
    expect(preview.getAttribute('sizes')).toBe('80vw');
    expect(preview.alt).toBe('A red landscape');

    component.closePreview();
    fixture.detectChanges();
    expect(hidden).toHaveBeenCalledTimes(1);
  });

  it('applies explicit zero and small heights to placeholders while keeping an unsized placeholder useful', () => {
    create({ placeholder: 'No image', width: 200, height: 0 });
    const figure = fixture.nativeElement.querySelector(
      'figure.orc-image',
    ) as HTMLElement;
    const placeholder = fixture.nativeElement.querySelector(
      '.orc-image__placeholder',
    ) as HTMLElement;
    expect(placeholder.getBoundingClientRect().height).toBe(0);

    fixture.componentRef.setInput('height', 32);
    fixture.detectChanges();
    expect(placeholder.getBoundingClientRect().height).toBe(32);

    fixture.componentRef.setInput('height', '');
    fixture.detectChanges();
    expect(figure.getBoundingClientRect().height).toBeGreaterThanOrEqual(64);
  });

  it('opens a named modal through native button activation and exposes named controls', async () => {
    const component = create({
      src: VALID_IMAGE,
      alt: 'A mountain',
      preview: true,
    });
    const shown = jasmine.createSpy('shown');
    component.onShow.subscribe(shown);
    const button = trigger();
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const previewDialog = dialog();
    expect(shown).toHaveBeenCalledTimes(1);
    expect(previewDialog.open).toBeTrue();
    expect(previewDialog.getAttribute('aria-label')).toBe('Image preview');
    expect(
      Array.from(
        previewDialog.querySelectorAll<HTMLButtonElement>(
          '.orc-image__preview-toolbar button',
        ),
      ).map((control) => control.getAttribute('aria-label')),
    ).toEqual([
      'Zoom out',
      'Zoom in',
      'Rotate left',
      'Rotate right',
      'Close image preview',
    ]);
    expect(
      previewDialog.querySelector('[role="group"]')?.getAttribute('aria-label'),
    ).toBe('Image preview controls');
    expect(document.body.style.overflow).toBe('hidden');
    component.zoomIn();
    button.click();
    fixture.detectChanges();
    expect(component.scale()).toBe(1.25);
    expect(shown).toHaveBeenCalledTimes(1);
    component.onImageClick();
    expect(component.scale()).toBe(1.25);
    expect(shown).toHaveBeenCalledTimes(1);
    component.closePreview();
    fixture.detectChanges();
    button.click();
    fixture.detectChanges();
    expect(component.scale()).toBe(1);
    expect(shown).toHaveBeenCalledTimes(2);
    component.closePreview();
    fixture.detectChanges();
  });

  it('keeps deprecated attachment and transition inputs behavior-free', async () => {
    const appendTarget = document.createElement('div');
    document.body.append(appendTarget);
    const component = create({
      src: VALID_IMAGE,
      preview: true,
      appendTo: appendTarget,
      showTransitionOptions: '0ms',
      hideTransitionOptions: '0ms',
    });
    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();

    const previewDialog = dialog();
    expect(previewDialog).toBeTruthy();
    expect(appendTarget.contains(previewDialog)).toBeFalse();
    expect(previewDialog.style.transition).toBe('');
    component.closePreview();
    fixture.detectChanges();
    appendTarget.remove();
  });

  it('trims blank preview and control names and uses their useful fallbacks', async () => {
    create({
      src: VALID_IMAGE,
      alt: ' A mountain ',
      preview: true,
      ariaLabel: '   ',
      zoomOutAriaLabel: '  Zoom smaller  ',
      zoomInAriaLabel: '   ',
      rotateLeftAriaLabel: '   ',
      rotateRightAriaLabel: '   ',
      closePreviewAriaLabel: '   ',
    });

    const button = trigger();
    expect(button.getAttribute('aria-label')).toBe(
      'Open image preview: A mountain',
    );
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const previewDialog = dialog();
    expect(previewDialog.getAttribute('aria-label')).toBe('Image preview');
    expect(
      Array.from(
        previewDialog.querySelectorAll<HTMLButtonElement>(
          '.orc-image__preview-toolbar button',
        ),
      ).map((control) => control.getAttribute('aria-label')),
    ).toEqual([
      'Zoom smaller',
      'Zoom in',
      'Rotate left',
      'Rotate right',
      'Close image preview',
    ]);
    image.closePreview();
    fixture.detectChanges();
  });

  it('resets preview transforms when the preview source changes while open', async () => {
    const component = create({
      src: VALID_IMAGE,
      previewImageSrc: VALID_IMAGE,
      preview: true,
    });
    component.onImageClick();
    fixture.detectChanges();
    await fixture.whenStable();
    component.zoomIn();
    component.rotateRight();
    expect(component.scale()).toBe(1.25);
    expect(component.rotation()).toBe(90);

    fixture.componentRef.setInput('previewImageSrc', FALLBACK_IMAGE);
    fixture.detectChanges();
    await fixture.whenStable();
    const preview = fixture.nativeElement.querySelector(
      '.orc-image__preview-content > img',
    ) as HTMLImageElement;
    expect(preview.src).toBe(FALLBACK_IMAGE);
    expect(component.scale()).toBe(1);
    expect(component.rotation()).toBe(0);
    component.closePreview();
    fixture.detectChanges();
  });

  it('updates the open preview source and clamps zoom and rotation controls', async () => {
    const component = create({ src: VALID_IMAGE, preview: true });
    component.onImageClick();
    fixture.detectChanges();
    await fixture.whenStable();
    const preview = fixture.nativeElement.querySelector(
      '.orc-image__preview-content > img',
    ) as HTMLImageElement;
    expect(preview.src).toBe(VALID_IMAGE);

    fixture.componentRef.setInput('src', FALLBACK_IMAGE);
    fixture.detectChanges();
    expect(preview.src).toBe(FALLBACK_IMAGE);
    for (let i = 0; i < 20; i += 1) component.zoomIn();
    expect(component.scale()).toBe(3);
    for (let i = 0; i < 20; i += 1) component.zoomOut();
    expect(component.scale()).toBe(0.5);
    component.rotateLeft();
    expect(component.rotation()).toBe(270);
    component.rotateRight();
    expect(component.rotation()).toBe(0);

    const controls = fixture.nativeElement.querySelectorAll(
      '.orc-image__preview-toolbar button',
    ) as NodeListOf<HTMLButtonElement>;
    fixture.detectChanges();
    expect(controls[0].disabled).toBeTrue();
    expect(controls[1].disabled).toBeFalse();
    controls[1].click();
    fixture.detectChanges();
    expect(component.scale()).toBe(0.75);
    for (let i = 0; i < 20; i += 1) controls[1].click();
    fixture.detectChanges();
    expect(component.scale()).toBe(3);
    expect(controls[1].disabled).toBeTrue();
    component.closePreview();
    fixture.detectChanges();
  });

  it('applies pixel dimensions including zero to the image geometry', async () => {
    create({ src: VALID_IMAGE, width: 320, height: 180, loading: 'eager' });
    await fixture.whenStable();
    const figure = fixture.nativeElement.querySelector(
      'figure.orc-image',
    ) as HTMLElement;
    expect(figure.style.width).toBe('320px');
    expect(figure.style.height).toBe('180px');
    expect(figure.getBoundingClientRect().width).toBe(320);
    expect(figure.getBoundingClientRect().height).toBe(180);
    expect(getComputedStyle(figure).overflow).toBe('visible');
    const imageElement = figure.querySelector('img') as HTMLImageElement;
    expect(getComputedStyle(imageElement).borderTopLeftRadius).toBe(
      getComputedStyle(figure).borderTopLeftRadius,
    );

    fixture.componentRef.setInput('height', 32);
    fixture.detectChanges();
    expect(imageElement.getBoundingClientRect().height).toBe(32);
    fixture.componentRef.setInput('width', 0);
    fixture.componentRef.setInput('height', 0);
    fixture.detectChanges();
    expect(figure.style.width).toBe('0px');
    expect(figure.style.height).toBe('0px');
    expect(imageElement.getBoundingClientRect().width).toBe(0);
    expect(imageElement.getBoundingClientRect().height).toBe(0);

    fixture.destroy();
    for (const height of [180, 32, 0]) {
      create({
        src: VALID_IMAGE,
        preview: true,
        width: 320,
        height,
        loading: 'eager',
      });
      await fixture.whenStable();
      const previewThumbnail = fixture.nativeElement.querySelector(
        '.orc-image__trigger > img',
      ) as HTMLImageElement;
      expect(previewThumbnail.getBoundingClientRect().width).toBe(320);
      expect(previewThumbnail.getBoundingClientRect().height).toBe(height);
      fixture.destroy();
    }
  });

  it('contains Tab focus within the open preview and restores the original scroll state', async () => {
    const component = create({ src: VALID_IMAGE, preview: true });
    document.body.style.overflow = 'scroll';
    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();
    const previewDialog = dialog();
    const focusables = Array.from(
      previewDialog.querySelectorAll<HTMLButtonElement>('button'),
    ).filter((element) => !element.disabled);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    last.focus();
    const tab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(first);
    component.closePreview();
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('dismisses and releases modal state when preview is disabled while open', async () => {
    const component = create({ src: VALID_IMAGE, preview: true });
    const button = trigger();
    button.focus();
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.previewVisible()).toBeTrue();
    fixture.componentRef.setInput('preview', false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.previewVisible()).toBeFalse();
    expect(fixture.nativeElement.querySelector('dialog.p-dialog')).toBeNull();
    expect(document.body.style.overflow).toBe(originalBodyOverflow);
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('figure.orc-image'),
    );
  });

  it('returns focus to the stable image container when its preview source disappears', async () => {
    const component = create({ src: VALID_IMAGE, preview: true });
    trigger().focus();
    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.previewVisible()).toBeTrue();

    fixture.componentRef.setInput('src', '');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.previewVisible()).toBeFalse();
    expect(fixture.nativeElement.querySelector('dialog.p-dialog')).toBeNull();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector('figure.orc-image'),
    );
  });

  it('measures preview content within the native dialog at the loaded image size', async () => {
    const component = create({ src: VALID_IMAGE, preview: true });
    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();
    const preview = fixture.nativeElement.querySelector(
      '.orc-image__preview-content > img',
    ) as HTMLImageElement;
    const previewDialog = dialog();
    const animationDone = new Promise<void>((resolve) => {
      if (getComputedStyle(previewDialog).animationName === 'none') resolve();
      else
        previewDialog.addEventListener('animationend', () => resolve(), {
          once: true,
        });
    });
    await preview.decode();
    await animationDone;
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector(
      '.orc-image__preview-content',
    ) as HTMLElement;
    const dialogRect = previewDialog.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const imageRect = preview.getBoundingClientRect();
    expect(preview.naturalWidth).toBeGreaterThan(0);
    expect(dialogRect.width).toBeGreaterThan(0);
    expect(contentRect.width).toBeGreaterThan(0);
    expect(contentRect.width).toBeLessThanOrEqual(dialogRect.width);
    expect(imageRect.width).toBeLessThanOrEqual(contentRect.width);
    expect(imageRect.height).toBeLessThanOrEqual(contentRect.height);
    expect(dialogRect.left).toBeGreaterThanOrEqual(0);
    expect(dialogRect.right).toBeLessThanOrEqual(window.innerWidth);
    expect(dialogRect.top).toBeGreaterThanOrEqual(0);
    expect(dialogRect.bottom).toBeLessThanOrEqual(window.innerHeight);
    expect(preview.style.maxHeight).toBe('');
    for (const control of previewDialog.querySelectorAll<HTMLButtonElement>(
      '.orc-image__preview-toolbar button',
    )) {
      const controlRect = control.getBoundingClientRect();
      // The native dialog's opening transform can leave a sub-pixel scale
      // (31.998px for a 32px control); retain a real usable-target check.
      expect(controlRect.width).toBeGreaterThan(31);
      expect(controlRect.height).toBeGreaterThan(31);
      expect(controlRect.left).toBeGreaterThanOrEqual(dialogRect.left);
      expect(controlRect.right).toBeLessThanOrEqual(dialogRect.right);
    }
    component.closePreview();
    fixture.detectChanges();
  });

  it('dismisses on modal Escape and backdrop interactions and restores focus and scroll', async () => {
    const component = create({ src: VALID_IMAGE, preview: true });
    document.body.style.overflow = 'scroll';
    const button = trigger();
    button.focus();
    component.onImageClick();
    fixture.detectChanges();
    await fixture.whenStable();
    const previewDialog = dialog();
    const cancel = new Event('cancel', { bubbles: false, cancelable: true });
    previewDialog.dispatchEvent(cancel);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.previewVisible()).toBeFalse();
    expect(document.body.style.overflow).toBe('scroll');
    expect(document.activeElement).toBe(button);

    component.onImageClick();
    fixture.detectChanges();
    await fixture.whenStable();
    const reopened = dialog();
    reopened.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(component.previewVisible()).toBeFalse();
  });

  it('cleans the modal scroll lock when destroyed while preview is open', async () => {
    const component = create({ src: VALID_IMAGE, preview: true });
    component.onImageClick();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.body.style.overflow).toBe('hidden');
    const previewDialog = dialog();
    expect(previewDialog.open).toBeTrue();
    fixture.destroy();
    expect(previewDialog.open).toBeFalse();
    expect(document.body.style.overflow).toBe(originalBodyOverflow);
  });

  it('keeps image preview ownership correct inside a parent native modal', async () => {
    const parentFixture = TestBed.createComponent(ParentModalHost);
    document.body.append(parentFixture.nativeElement);
    parentFixture.detectChanges();
    await parentFixture.whenStable();
    const parentDialog = parentFixture.nativeElement.querySelector(
      'dialog.p-dialog',
    ) as HTMLDialogElement;
    expect(parentDialog.open).toBeTrue();

    const imageTrigger = parentFixture.nativeElement.querySelector(
      '.orc-image__trigger',
    ) as HTMLButtonElement;
    imageTrigger.click();
    parentFixture.detectChanges();
    await parentFixture.whenStable();
    const dialogs = parentFixture.nativeElement.querySelectorAll(
      'dialog.p-dialog',
    ) as NodeListOf<HTMLDialogElement>;
    expect(dialogs.length).toBe(2);
    expect(dialogs[1].open).toBeTrue();
    dialogs[1].dispatchEvent(new Event('cancel', { cancelable: true }));
    parentFixture.detectChanges();
    await parentFixture.whenStable();
    expect(parentDialog.open).toBeTrue();
    parentFixture.destroy();
    parentFixture.nativeElement.remove();
  });

  it('leaves a lower image preview open when a newer modal owns Escape', async () => {
    const firstFixture = TestBed.createComponent(ImageComponent);
    const secondFixture = TestBed.createComponent(ImageComponent);
    document.body.append(
      firstFixture.nativeElement,
      secondFixture.nativeElement,
    );
    const first = firstFixture.componentInstance;
    const second = secondFixture.componentInstance;
    for (const current of [firstFixture, secondFixture]) {
      current.componentRef.setInput('src', VALID_IMAGE);
      current.componentRef.setInput('preview', true);
      current.detectChanges();
    }
    first.onImageClick();
    firstFixture.detectChanges();
    await firstFixture.whenStable();
    second.onImageClick();
    secondFixture.detectChanges();
    await secondFixture.whenStable();

    const firstDialog = firstFixture.nativeElement.querySelector(
      'dialog.p-dialog',
    ) as HTMLDialogElement;
    const secondDialog = secondFixture.nativeElement.querySelector(
      'dialog.p-dialog',
    ) as HTMLDialogElement;
    firstDialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(first.previewVisible()).toBeTrue();
    secondDialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    secondFixture.detectChanges();
    expect(second.previewVisible()).toBeFalse();
    firstFixture.destroy();
    secondFixture.destroy();
    firstFixture.nativeElement.remove();
    secondFixture.nativeElement.remove();
  });
});
