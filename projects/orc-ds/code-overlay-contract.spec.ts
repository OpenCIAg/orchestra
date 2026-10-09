import {
  TestBed,
  fakeAsync,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';
import { CodeComponent } from '@ciag/orchestra/code';

describe('Code and Overlay contracts', () => {
  let clipboardDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    clipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      'clipboard',
    );
    await TestBed.configureTestingModule({
      imports: [CodeComponent],
    }).compileComponents();
  });

  afterEach(() => {
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
    } else {
      delete (navigator as unknown as { clipboard?: Clipboard }).clipboard;
    }
  });

  it('presents preformatted source with a named language and an always-available copy button', () => {
    const fixture = TestBed.createComponent(CodeComponent);
    const source = 'const title = "Example";\nconsole.log(title);';
    fixture.componentRef.setInput('code', source);
    fixture.componentRef.setInput('language', 'typescript');
    fixture.detectChanges();

    const pre = fixture.nativeElement.querySelector('pre') as HTMLPreElement;
    const code = fixture.nativeElement.querySelector('code') as HTMLElement;
    const copy = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(pre.textContent).toBe(source);
    expect(code.getAttribute('data-language')).toBe('typescript');
    expect(
      fixture.nativeElement
        .querySelector('.language')
        .getAttribute('aria-label'),
    ).toBe('Language: typescript');
    expect(copy.type).toBe('button');
    expect(copy.textContent.trim()).toBe('Copy');
    expect(copy.getAttribute('aria-label')).toBeNull();
    fixture.destroy();
  });

  it('copies the exact code and announces only a successful clipboard write', async () => {
    const writeText = jasmine
      .createSpy('writeText')
      .and.returnValue(Promise.resolve());
    setClipboard(writeText);
    const fixture = TestBed.createComponent(CodeComponent);
    fixture.componentRef.setInput('code', '  let count = 2;\n');
    const copied: string[] = [];
    fixture.componentInstance.copiedEvent.subscribe((value) =>
      copied.push(value),
    );
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('button') as HTMLButtonElement
    ).click();
    await waitForCopyAttempt();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledOnceWith('  let count = 2;\n');
    expect(copied).toEqual(['  let count = 2;\n']);
    expect(fixture.componentInstance.copied()).toBeTrue();
    expect(
      fixture.nativeElement.querySelector('button').textContent.trim(),
    ).toBe('Copied');
    const status = fixture.nativeElement.querySelector('[aria-live="polite"]');
    expect(status.textContent.trim()).toBe('Copied');
    fixture.destroy();
  });

  it('reports permission errors instead of showing a false copied state', async () => {
    const failure = new Error('permission denied');
    const writeText = jasmine
      .createSpy('writeText')
      .and.returnValue(Promise.reject(failure));
    setClipboard(writeText);
    const fixture = TestBed.createComponent(CodeComponent);
    fixture.componentRef.setInput('code', 'secret');
    const copied: string[] = [];
    const errors: unknown[] = [];
    fixture.componentInstance.copiedEvent.subscribe((value) =>
      copied.push(value),
    );
    fixture.componentInstance.copyFailed.subscribe((error) =>
      errors.push(error),
    );
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('button') as HTMLButtonElement
    ).click();
    await waitForCopyAttempt();
    fixture.detectChanges();

    expect(copied).toEqual([]);
    expect(errors).toEqual([failure]);
    expect(fixture.componentInstance.copied()).toBeFalse();
    expect(
      fixture.nativeElement.querySelector('button').textContent.trim(),
    ).toBe('Copy');
    expect(
      fixture.nativeElement
        .querySelector('[aria-live="polite"]')
        .textContent.trim(),
    ).toBe('Copy failed');
    fixture.destroy();
  });

  it('ignores an older clipboard completion after a newer copy attempt succeeds', fakeAsync(() => {
    let finishFirst!: () => void;
    const pendingFirst = new Promise<void>((resolve) => {
      finishFirst = resolve;
    });
    const writeText = jasmine
      .createSpy('writeText')
      .and.returnValues(pendingFirst, Promise.resolve());
    setClipboard(writeText);
    const fixture = TestBed.createComponent(CodeComponent);
    fixture.componentRef.setInput('code', 'latest');
    const copied: string[] = [];
    fixture.componentInstance.copiedEvent.subscribe((value) =>
      copied.push(value),
    );
    fixture.detectChanges();

    void fixture.componentInstance.copy();
    void fixture.componentInstance.copy();
    flushMicrotasks();
    expect(copied).toEqual(['latest']);
    finishFirst();
    flushMicrotasks();
    expect(copied).toEqual(['latest']);
    expect(fixture.componentInstance.copied()).toBeTrue();
    fixture.destroy();
    flushMicrotasks();
  }));

  it('resets the copied state after its feedback interval and cancels the timer on destroy', fakeAsync(() => {
    const writeText = jasmine
      .createSpy('writeText')
      .and.returnValue(Promise.resolve());
    setClipboard(writeText);
    const fixture = TestBed.createComponent(CodeComponent);
    fixture.detectChanges();
    const instance = fixture.componentInstance;
    void instance.copy();
    flushMicrotasks();
    fixture.detectChanges();
    expect(instance.copied()).toBeTrue();

    tick(1200);
    fixture.detectChanges();
    expect(instance.copied()).toBeFalse();
    void instance.copy();
    flushMicrotasks();
    expect(instance.copied()).toBeTrue();
    fixture.destroy();
    tick(1200);
    expect(instance.copied()).toBeTrue();
  }));
});

function setClipboard(writeText: jasmine.Spy): void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText } as unknown as Clipboard,
  });
}

function waitForCopyAttempt(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
