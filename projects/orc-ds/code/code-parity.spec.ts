import { TestBed } from '@angular/core/testing';
import { CodeComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the code viewer family. The specs import the
 * component through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('Code behavior parity', () => {
  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(CodeComponent);
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders the code with its language badge and the copy toolbar', () => {
    const fixture = setup({
      code: 'const answer = 42;',
      language: 'ts',
      copyLabel: 'Kopieren',
    });
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('code')?.textContent).toBe('const answer = 42;');
    expect(root.querySelector('code')?.getAttribute('data-language')).toBe(
      'ts',
    );
    expect(root.querySelector('.language')?.textContent?.trim()).toBe('ts');
    const button = root.querySelector<HTMLButtonElement>('.toolbar button')!;
    expect(button.textContent?.trim()).toBe('Kopieren');
  });

  it('hides the language badge when no language is set', () => {
    const fixture = setup({ code: 'x' });
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.language'),
    ).toBeNull();
  });

  it('copies through the clipboard, announces the success, and emits the copied value', async () => {
    const writeText = jasmine
      .createSpy('writeText')
      .and.returnValue(Promise.resolve());
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue({
      writeText,
    } as unknown as Clipboard);

    const fixture = setup({ code: 'payload' });
    const copied: string[] = [];
    fixture.componentInstance.copiedEvent.subscribe(copied.push.bind(copied));

    await fixture.componentInstance.copy();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith('payload');
    expect(copied).toEqual(['payload']);
    expect(fixture.componentInstance.copied()).toBeTrue();
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLButtonElement>('.toolbar button')!
        .textContent?.trim(),
    ).toBe('Copied');
  });

  it('reports the failure state and output when the clipboard rejects', async () => {
    const writeText = jasmine
      .createSpy('writeText')
      .and.returnValue(Promise.reject(new Error('denied')));
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue({
      writeText,
    } as unknown as Clipboard);

    const fixture = setup({
      code: 'payload',
      copyFailedLabel: 'Fehlgeschlagen',
    });
    const failures: unknown[] = [];
    fixture.componentInstance.copyFailed.subscribe(
      failures.push.bind(failures),
    );

    await fixture.componentInstance.copy();
    fixture.detectChanges();

    expect(fixture.componentInstance.copied()).toBeFalse();
    expect(failures.length).toBe(1);
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLButtonElement>('.toolbar button')!
        .textContent?.trim(),
    ).toBe('Copy');
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('.sr-only')
        ?.textContent?.trim(),
    ).toBe('Fehlgeschlagen');
  });
});
