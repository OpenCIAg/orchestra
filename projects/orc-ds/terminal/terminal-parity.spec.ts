import { TestBed } from '@angular/core/testing';
import { TerminalComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the terminal family. The specs import the
 * component through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('Terminal behavior parity', () => {
  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(TerminalComponent);
    for (const [key, value] of Object.entries(inputs))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => TestBed.configureTestingModule({}));

  it('renders the welcome message, prompt, and history lines with output', () => {
    const fixture = setup({
      welcomeMessage: 'Welcome',
      prompt: 'user@host % ',
      history: [{ command: 'ls', output: 'a.txt\nb.txt' }, { command: 'pwd' }],
    });
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.welcome')?.textContent?.trim()).toBe('Welcome');
    expect(root.querySelector('form .prompt')?.textContent?.trim()).toBe(
      'user@host %',
    );
    const history = root.querySelectorAll('[role="log"] > div');
    expect(history.length).toBe(2);
    expect(history[0].querySelector('pre')?.textContent).toContain('a.txt');
    expect(history[1].querySelector('pre')).toBeNull();
  });

  it('appends submitted commands to the history and emits both output names', () => {
    const fixture = setup();
    const aliased: string[] = [];
    const canonical: string[] = [];
    fixture.componentInstance.commandRun.subscribe(aliased.push.bind(aliased));
    fixture.componentInstance.onCommand.subscribe(
      canonical.push.bind(canonical),
    );

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    )!;
    input.value = '  echo hi  ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.history()).toEqual([
      { command: 'echo hi' },
    ]);
    expect(fixture.componentInstance.command()).toBe('');
    expect(aliased).toEqual(['echo hi']);
    expect(canonical).toEqual(['echo hi']);
  });

  it('keeps the history untouched when the trimmed command is empty', () => {
    const fixture = setup();
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    )!;
    input.value = '   ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.history()).toEqual([]);
    expect(fixture.componentInstance.command()).toBe('   ');
  });
});
