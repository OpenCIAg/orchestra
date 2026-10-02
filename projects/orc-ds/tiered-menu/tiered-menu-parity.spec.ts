import { TestBed } from '@angular/core/testing';
import { TieredMenuComponent } from '@ciag/orchestra/p2';
import type { PrimeMenuItem } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the tiered menu family. The specs import the
 * component through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('TieredMenu behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const keydown = (key: string, target: EventTarget) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );

  it('renders enabled, disabled, hidden, and separator entries from the model alias', () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('model', [
      { label: 'First', value: 'first' },
      { label: 'Hidden', value: 'hidden', visible: false },
      { label: 'Blocked', value: 'blocked', disabled: true },
      { label: '', separator: true },
      { label: 'Last', value: 'last' },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();

    const nav = (fixture.nativeElement as HTMLElement).querySelector(
      'nav',
    ) as HTMLElement;
    const items = Array.from(nav.querySelectorAll('[role="menuitem"]'));
    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'First',
      'Blocked',
      'Last',
    ]);
    expect(nav.querySelectorAll('hr').length).toBe(1);
    expect((items[1] as HTMLButtonElement).matches(':disabled')).toBeTrue();
  });

  it('roves DOM focus across enabled items, wraps, and honors Home/End', async () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('popup', true);
    fixture.componentRef.setInput('items', [
      { label: 'First', value: 'first' },
      { label: 'Blocked', value: 'blocked', disabled: true },
      { label: 'Last', value: 'last' },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();
    fixture.componentInstance.show();
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const nav = (fixture.nativeElement as HTMLElement).querySelector(
      'nav',
    ) as HTMLElement;
    const items = Array.from(
      nav.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    // Roving focus indexes enabled targets only; the disabled entry never takes focus.
    const enabled = items.filter((item) => !item.matches(':disabled'));
    expect(enabled.length).toBe(2);
    expect(document.activeElement).toBe(enabled[0]);

    keydown('ArrowUp', enabled[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(enabled[1]);

    keydown('ArrowDown', enabled[1]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(enabled[0]);

    keydown('End', enabled[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(enabled[1]);

    keydown('Home', enabled[1]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(enabled[0]);
  });

  it('emits both itemSelect and onItemClick for leaf activation and hides the popup', () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('popup', true);
    const selected: PrimeMenuItem[] = [];
    const clicked: PrimeMenuItem[] = [];
    const shown: number[] = [];
    const hidden: number[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.componentInstance.onItemClick.subscribe((item) =>
      clicked.push(item),
    );
    fixture.componentInstance.onShow.subscribe(() => shown.push(1));
    fixture.componentInstance.onHide.subscribe(() => hidden.push(1));
    fixture.componentRef.setInput('items', [
      { label: 'Save', value: 'save' },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();

    fixture.componentInstance.show();
    fixture.detectChanges();
    expect(shown.length).toBe(1);

    const item = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="menuitem"]',
    ) as HTMLElement;
    item.click();
    fixture.detectChanges();

    expect(selected.length).toBe(1);
    expect(clicked.length).toBe(1);
    expect(selected[0]).toBe(clicked[0]);
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(hidden.length).toBe(1);
  });

  it('keeps an open popup through inside pointerdown and hides on outside pointerdown', () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('popup', true);
    fixture.componentRef.setInput('items', [
      { label: 'Open', value: 'open' },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();
    fixture.componentInstance.show();
    fixture.detectChanges();

    const nav = (fixture.nativeElement as HTMLElement).querySelector(
      'nav',
    ) as HTMLElement;
    nav.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();

    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    outside.remove();
  });
});
