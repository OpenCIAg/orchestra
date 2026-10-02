import { TestBed } from '@angular/core/testing';
import { ContextMenuComponent } from '@ciag/orchestra/p2';
import type { ContextMenuItem } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the context menu. Imported through the public
 * `@ciag/orchestra/p2` surface; must pass unchanged across the family move.
 */
describe('ContextMenu behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const keydown = (key: string, target: EventTarget) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );

  const items: ContextMenuItem[] = [
    { label: 'Cut', value: 'cut' },
    { label: 'Blocked', value: 'blocked', disabled: true },
    { label: 'Invisible', value: 'gone', visible: false },
    { label: 'Copy', value: 'copy', shortcut: '⌘C' },
  ];

  function create() {
    const fixture = TestBed.createComponent(ContextMenuComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    return fixture;
  }

  const menuOf = (fixture: ReturnType<typeof create>) =>
    (fixture.nativeElement as HTMLElement).querySelector(
      '.orc-p2-context-menu',
    ) as HTMLElement;

  it('opens from the host contextmenu event at the pointer and keeps the visible alias in sync', () => {
    const fixture = create();
    expect(fixture.componentInstance.visible).toBe(
      fixture.componentInstance.open,
    );
    const host = (fixture.nativeElement as HTMLElement).querySelector(
      '.orc-p2-context-menu-host',
    ) as HTMLElement;
    host.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 40,
        clientY: 60,
      }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBeTrue();
    const menu = menuOf(fixture);
    expect(menu).not.toBeNull();
    expect(menu.style.left).toBe('40px');
    expect(menu.style.top).toBe('60px');
    const rendered = Array.from(menu.querySelectorAll('button'));
    expect(
      rendered.map((item) => item.textContent?.replace(/\s+/g, ' ').trim()),
    ).toEqual(['Cut', 'Blocked', 'Copy ⌘C']);

    fixture.componentInstance.hide();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(menuOf(fixture)).toBeNull();
  });

  it('roves items with wrap-around and activates with keyboard through itemSelect', () => {
    const fixture = create();
    const selected: ContextMenuItem[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    const host = (fixture.nativeElement as HTMLElement).querySelector(
      '.orc-p2-context-menu-host',
    ) as HTMLElement;
    host.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    const menu = menuOf(fixture);
    const buttons = Array.from(menu.querySelectorAll('button'));
    expect(document.activeElement).toBe(buttons[0]);

    keydown('ArrowUp', buttons[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[2]);

    keydown('ArrowDown', buttons[2]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[0]);

    keydown('End', buttons[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[2]);

    keydown('Enter', buttons[2]);
    fixture.detectChanges();
    expect(selected.map((item) => item.value)).toEqual(['copy']);
    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('closes on Escape with focus restoration and stays open for inside pointerdown', () => {
    const fixture = create();
    const host = (fixture.nativeElement as HTMLElement).querySelector(
      '.orc-p2-context-menu-host',
    ) as HTMLElement;
    const opener = document.createElement('button');
    host.appendChild(opener);
    opener.focus();
    host.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    const menu = menuOf(fixture);

    menu.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();

    keydown('Escape', menu);
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
});
