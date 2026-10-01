import { TestBed } from '@angular/core/testing';
import { KbdComponent, LinkComponent } from './p2/p2-layout-components';

describe('P2 layout component DOM contracts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [KbdComponent, LinkComponent] }),
  );

  it('tokenizes the default Kbd chord into separate key tokens', () => {
    const fixture = TestBed.createComponent(KbdComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const keys = root.querySelectorAll<HTMLElement>('kbd span');
    expect(Array.from(keys).map((key) => key.textContent)).toEqual(['⌘', 'K']);
  });

  it('tokenizes plus-delimited strings and trims explicit key arrays', () => {
    const fixture = TestBed.createComponent(KbdComponent);
    const root = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('keys', 'Ctrl + Shift + P');
    fixture.detectChanges();
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('kbd span')).map(
        (key) => key.textContent,
      ),
    ).toEqual(['Ctrl', 'Shift', 'P']);

    fixture.componentRef.setInput('keys', [' Alt ', '', 'Enter ']);
    fixture.detectChanges();
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('kbd span')).map(
        (key) => key.textContent,
      ),
    ).toEqual(['Alt', 'Enter']);
  });

  it('normalizes Unicode whitespace in chords and preserves multiword array keys', () => {
    const fixture = TestBed.createComponent(KbdComponent);
    const root = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('keys', 'Ctrl\t+\u00a0Enter\n');
    fixture.detectChanges();
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('kbd span')).map(
        (key) => key.textContent,
      ),
    ).toEqual(['Ctrl', 'Enter']);

    fixture.componentRef.setInput('keys', [' Page Up ', 'Shift', ' ']);
    fixture.detectChanges();
    expect(
      Array.from(root.querySelectorAll<HTMLElement>('kbd span')).map(
        (key) => key.textContent,
      ),
    ).toEqual(['Page Up', 'Shift']);
  });

  it('uses only a nonblank accessible-name override', () => {
    const fixture = TestBed.createComponent(KbdComponent);
    fixture.componentRef.setInput('ariaLabel', 'Search shortcut');
    fixture.detectChanges();

    const kbd = fixture.nativeElement.querySelector('kbd') as HTMLElement;
    expect(kbd.getAttribute('aria-label')).toBe('Search shortcut');

    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.detectChanges();

    expect(kbd.hasAttribute('aria-label')).toBeFalse();
    expect(kbd.textContent).toContain('K');
  });

  it('preserves enabled link navigation semantics and emits activation once', () => {
    const fixture = TestBed.createComponent(LinkComponent);
    fixture.componentRef.setInput('href', '#docs');
    fixture.componentRef.setInput('target', '_blank');
    fixture.componentRef.setInput('ariaLabel', 'Open docs');
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const activated = jasmine.createSpy('activated');
    fixture.componentInstance.activated.subscribe(activated);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    let preventedBeforeTestGuard = false;
    // Keep the contract check from opening a real `_blank` tab in ChromeHeadless.
    // This listener runs after the component's click handler, so it can observe
    // whether the component canceled native navigation before stopping it here.
    link.addEventListener('click', (event) => {
      preventedBeforeTestGuard = event.defaultPrevented;
      event.preventDefault();
    });
    link.dispatchEvent(click);

    expect(link.getAttribute('href')).toBe('#docs');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('aria-label')).toBe('Open docs');
    expect(link.getAttribute('aria-disabled')).toBeNull();
    expect(preventedBeforeTestGuard).toBeFalse();
    expect(activated).toHaveBeenCalledOnceWith(click);
  });

  it('removes disabled links from native interaction and blocks click and keyboard activation', () => {
    const fixture = TestBed.createComponent(LinkComponent);
    fixture.componentRef.setInput('href', '/blocked');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const activated = jasmine.createSpy('activated');
    fixture.componentInstance.activated.subscribe(activated);

    expect(link.getAttribute('href')).toBeNull();
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.hasAttribute('inert')).toBeTrue();
    expect(link.classList.contains('disabled')).toBeTrue();

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(enter);
    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(space);

    expect(click.defaultPrevented).toBeTrue();
    expect(enter.defaultPrevented).toBeTrue();
    expect(space.defaultPrevented).toBeTrue();
    expect(activated).not.toHaveBeenCalled();
  });
});
