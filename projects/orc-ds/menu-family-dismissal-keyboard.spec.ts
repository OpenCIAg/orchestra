import { TestBed } from '@angular/core/testing';
import { TieredMenuComponent } from '@ciag/orchestra/tiered-menu';
import { ContextMenuComponent } from '@ciag/orchestra/context-menu';
import type { PrimeMenuItem } from '@ciag/orchestra/internal';

/**
 * Unified family behaviors: outside dismissal runs through the shared
 * internal overlay helper and roving focus follows the shared menu
 * keyboard helpers. Each menu keeps its own item semantics.
 */
describe('menu family shared dismissal and roving focus', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('hides a popup TieredMenu on an outside pointerdown and stays for inside ones', () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('popup', true);
    fixture.componentRef.setInput('items', [
      { label: 'Open', value: 'open' },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();
    fixture.componentInstance.show();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();

    const host = fixture.nativeElement.querySelector('nav') as HTMLElement;
    host.dispatchEvent(
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

  it('moves TieredMenu DOM focus across enabled items and wraps around', async () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('popup', true);
    fixture.componentRef.setInput('items', [
      { label: 'First', value: 'first' },
      { label: 'Hidden', value: 'hidden', visible: false },
      { label: 'Blocked', value: 'blocked', disabled: true },
      { label: 'Last', value: 'last' },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();
    fixture.componentInstance.show();
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const items = Array.from(
      nav.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'First',
      'Blocked',
      'Last',
    ]);
    expect(document.activeElement).toBe(items[0]);

    const keydown = (key: string, target: HTMLElement) =>
      target.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
        }),
      );
    keydown('ArrowDown', items[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[2]);
    keydown('ArrowDown', items[2]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
    keydown('End', items[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[2]);
    keydown('Home', items[2]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
  });

  it('keeps the ContextMenu open for a pointerdown on the menu itself', () => {
    const fixture = TestBed.createComponent(ContextMenuComponent);
    fixture.componentRef.setInput('items', [{ label: 'Open', value: 'open' }]);
    fixture.detectChanges();
    fixture.componentInstance.show();
    fixture.detectChanges();
    const menu = fixture.nativeElement.querySelector(
      '.orc-p2-context-menu',
    ) as HTMLElement;
    expect(menu).not.toBeNull();

    menu.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();

    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
