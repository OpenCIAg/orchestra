import { TestBed } from '@angular/core/testing';
import { TerminalComponent } from './p2-input-gap-components';

describe('TerminalComponent behavior', () => {
  it('renders a welcome message separately and applies the consumer class', () => {
    const fixture = TestBed.createComponent(TerminalComponent);
    fixture.componentRef.setInput('welcomeMessage', 'Welcome to the console.');
    fixture.componentRef.setInput('prompt', 'ops> ');
    fixture.componentRef.setInput('styleClass', 'consumer-terminal compact');
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.welcome')?.textContent.trim(),
    ).toBe('Welcome to the console.');
    expect(
      fixture.nativeElement.querySelector('.history').textContent.trim(),
    ).toBe('');
    const region = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    expect(region.classList.contains('orc-terminal')).toBeTrue();
    expect(region.classList.contains('consumer-terminal')).toBeTrue();
    expect(region.classList.contains('compact')).toBeTrue();
    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll(
          '.prompt',
        ) as NodeListOf<HTMLElement>,
      ).map((prompt) => prompt.textContent),
    ).toEqual(['ops> ']);
    expect(fixture.componentInstance.history()).toEqual([]);
  });

  it('submits a native form command once and keeps command history and both outputs in sync', () => {
    const fixture = TestBed.createComponent(TerminalComponent);
    const component = fixture.componentInstance;
    const commandRun = jasmine.createSpy('commandRun');
    const onCommand = jasmine.createSpy('onCommand');
    component.commandRun.subscribe(commandRun);
    component.onCommand.subscribe(onCommand);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = '  status  ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    // Enter uses the browser's native form-submit path. requestSubmit exercises
    // that same submit event without relying on synthetic keyboard defaults.
    form.requestSubmit();
    fixture.detectChanges();

    expect(component.history()).toEqual([{ command: 'status' }]);
    expect(component.command()).toBe('');
    expect(commandRun).toHaveBeenCalledOnceWith('status');
    expect(onCommand).toHaveBeenCalledOnceWith('status');
    const history = fixture.nativeElement.querySelector(
      '.history',
    ) as HTMLElement;
    expect(history.getAttribute('role')).toBe('log');
    expect(history.getAttribute('aria-live')).toBe('polite');
    expect(
      fixture.nativeElement.querySelector('.history').textContent,
    ).toContain('status');
    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll(
          '.prompt',
        ) as NodeListOf<HTMLElement>,
      ).map((prompt) => prompt.textContent),
    ).toEqual(['$ ', '$ ']);
  });

  it('does not record, clear, or emit a whitespace-only command', () => {
    const fixture = TestBed.createComponent(TerminalComponent);
    const component = fixture.componentInstance;
    const commandRun = jasmine.createSpy('commandRun');
    const onCommand = jasmine.createSpy('onCommand');
    component.commandRun.subscribe(commandRun);
    component.onCommand.subscribe(onCommand);
    component.command.set('   ');
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('form') as HTMLFormElement
    ).requestSubmit();

    expect(component.history()).toEqual([]);
    expect(component.command()).toBe('   ');
    expect(commandRun).not.toHaveBeenCalled();
    expect(onCommand).not.toHaveBeenCalled();
  });

  it('renders command output and provides accessible default and overridden names', () => {
    const fixture = TestBed.createComponent(TerminalComponent);
    fixture.componentInstance.history.set([
      { command: 'status', output: 'All systems operational.' },
    ]);
    fixture.detectChanges();

    let region = fixture.nativeElement.querySelector('section') as HTMLElement;
    let input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(region.getAttribute('aria-label')).toBe('Terminal');
    expect(input.getAttribute('aria-label')).toBe('Terminal command');
    expect(
      fixture.nativeElement.querySelector('.history pre').textContent,
    ).toBe('All systems operational.');

    fixture.componentRef.setInput('ariaLabel', 'Operations console');
    fixture.componentRef.setInput('commandAriaLabel', 'Run an operation');
    fixture.detectChanges();
    region = fixture.nativeElement.querySelector('section') as HTMLElement;
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(region.getAttribute('aria-label')).toBe('Operations console');
    expect(input.getAttribute('aria-label')).toBe('Run an operation');
  });

  it('falls back to nonblank accessible names when overrides contain only whitespace', () => {
    const fixture = TestBed.createComponent(TerminalComponent);
    fixture.componentRef.setInput('ariaLabel', '  \t\n ');
    fixture.componentRef.setInput('commandAriaLabel', '\u00a0 \t');
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector(
      'section',
    ) as HTMLElement;
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(region.getAttribute('aria-label')).toBe('Terminal');
    expect(input.getAttribute('aria-label')).toBe('Terminal command');
    fixture.destroy();
  });

  it('publishes command and history model changes when input is submitted', () => {
    const fixture = TestBed.createComponent(TerminalComponent);
    const component = fixture.componentInstance;
    const commandChanges = jasmine.createSpy('commandChanges');
    const historyChanges = jasmine.createSpy('historyChanges');
    component.command.subscribe(commandChanges);
    component.history.subscribe(historyChanges);
    fixture.detectChanges();

    component.command.set('  status  ');
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('form') as HTMLFormElement
    ).requestSubmit();
    fixture.detectChanges();

    expect(commandChanges.calls.allArgs()).toEqual([['  status  '], ['']]);
    expect(historyChanges).toHaveBeenCalledOnceWith([{ command: 'status' }]);
    expect(component.history()).toEqual([{ command: 'status' }]);
    fixture.destroy();
  });

  it('follows new history at the bottom but preserves a reader scrolling older entries', async () => {
    const fixture = TestBed.createComponent(TerminalComponent);
    const component = fixture.componentInstance;
    component.history.set(
      Array.from({ length: 40 }, (_, index) => ({
        command: `command ${index + 1}`,
      })),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const viewport = fixture.nativeElement.querySelector(
      '.history',
    ) as HTMLDivElement;
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    expect(
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight,
    ).toBeLessThanOrEqual(1);

    viewport.scrollTop = 0;
    component.history.update((lines) => [...lines, { command: 'new command' }]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(viewport.scrollTop).toBe(0);

    viewport.scrollTop = viewport.scrollHeight;
    component.history.update((lines) => [
      ...lines,
      { command: 'latest command' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight,
    ).toBeLessThanOrEqual(1);
    fixture.destroy();
  });
});
