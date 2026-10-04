import { TestBed } from '@angular/core/testing';
import { DockComponent } from '@ciag/orchestra/p2';
import type { DockItem } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the dock. Imported through the public
 * `@ciag/orchestra/p2` surface; must pass unchanged across the family move.
 */
describe('Dock behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const keydown = (key: string, target: EventTarget) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );

  const items: DockItem[] = [
    { label: 'Home', value: 'home', icon: '⌂' },
    { label: 'Blocked', value: 'blocked', icon: 'x', disabled: true },
    { label: 'Files', value: 'files', icon: '▤' },
    { label: 'Settings', value: 'settings', icon: '⚙' },
  ];

  function create() {
    const fixture = TestBed.createComponent(DockComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    return fixture;
  }

  const dockButtons = (fixture: ReturnType<typeof create>) =>
    Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('nav button'),
    );

  it('renders every item with its icon and only marks enabled items as tab stops', () => {
    const fixture = create();
    const buttons = dockButtons(fixture);
    expect(buttons.length).toBe(4);
    expect(
      buttons.map((button) => button.textContent?.replace(/\s+/g, ' ').trim()),
    ).toEqual(['⌂Home', 'xBlocked', '▤Files', '⚙Settings']);
    expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1, -1, -1]);
    expect(buttons[1].matches(':disabled')).toBeTrue();
    const nav = (fixture.nativeElement as HTMLElement).querySelector(
      'nav',
    ) as HTMLElement;
    expect(nav.className).toContain('bottom');
  });

  it('moves DOM focus among enabled items with wrap-around and Home/End', () => {
    const fixture = create();
    const buttons = dockButtons(fixture);
    buttons[0].focus();

    keydown('ArrowRight', buttons[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[2]);

    keydown('ArrowLeft', buttons[2]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[0]);

    keydown('ArrowLeft', buttons[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[3]);

    keydown('End', buttons[3]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[3]);

    keydown('Home', buttons[3]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('runs the item command on activation', () => {
    let commands = 0;
    const fixture = TestBed.createComponent(DockComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Run', value: 'run', command: () => (commands += 1) },
    ] satisfies DockItem[]);
    fixture.detectChanges();
    dockButtons(fixture)[0].click();
    expect(commands).toBe(1);
  });
});
