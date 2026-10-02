import { TestBed } from '@angular/core/testing';
import { SplitButtonComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the split button. Imported through the public
 * `@ciag/orchestra/p2` surface; must pass unchanged across the family move.
 */
describe('SplitButton behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  type MenuItem = {
    label: string;
    icon?: string;
    disabled?: boolean;
    visible?: boolean;
    command?: () => void;
  };

  function create(model: MenuItem[] = []) {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.componentRef.setInput('label', 'Save');
    fixture.componentRef.setInput('model', model);
    fixture.detectChanges();
    return fixture;
  }

  const buttonsOf = (fixture: ReturnType<typeof create>) =>
    Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('.orc-p2-split > button'),
    );

  it('emits both primary aliases from the main button and both dropdown aliases from the trigger', () => {
    const fixture = create();
    const primary: Event[] = [];
    const primaryAlias: Event[] = [];
    const dropdown: Event[] = [];
    const dropdownAlias: Event[] = [];
    fixture.componentInstance.primaryClick.subscribe((event) =>
      primary.push(event),
    );
    fixture.componentInstance.onClick.subscribe((event) =>
      primaryAlias.push(event),
    );
    fixture.componentInstance.dropdownClick.subscribe((event) =>
      dropdown.push(event),
    );
    fixture.componentInstance.onDropdownClick.subscribe((event) =>
      dropdownAlias.push(event),
    );

    const [primaryButton, trigger] = buttonsOf(fixture);
    primaryButton.click();
    fixture.detectChanges();
    expect(primary.length).toBe(1);
    expect(primaryAlias.length).toBe(1);
    expect(primary[0]).toBe(primaryAlias[0]);

    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();
    expect(dropdown.length).toBe(1);
    expect(dropdownAlias.length).toBe(1);
    expect(dropdown[0]).toBe(dropdownAlias[0]);
  });

  it('runs the item command, closes the menu, and restores focus to the primary button', () => {
    let commands = 0;
    const fixture = create([
      { label: 'Save as' },
      { label: 'Blocked', disabled: true },
      { label: 'Invisible', visible: false },
      {
        label: 'Export',
        command: () => {
          commands += 1;
        },
      },
    ]);
    const [, trigger] = buttonsOf(fixture);
    trigger.click();
    fixture.detectChanges();

    const items = Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    );
    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'Save as',
      'Blocked',
      'Export',
    ]);

    items[2].click();
    fixture.detectChanges();
    expect(commands).toBe(1);
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(document.activeElement).toBe(buttonsOf(fixture)[0]);
  });

  it('closes the menu on Escape and on an outside pointerdown through document listeners', async () => {
    const fixture = create([{ label: 'Only', command: () => {} }]);
    const [, trigger] = buttonsOf(fixture);
    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isMenuOpen()).toBeTrue();

    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(escape);
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();

    trigger.click();
    fixture.detectChanges();
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await Promise.resolve();
    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('opens from the trigger with ArrowDown and roves items with ArrowUp/Home/End', () => {
    const fixture = create([
      { label: 'One' },
      { label: 'Two' },
      { label: 'Three' },
    ]);
    const [, trigger] = buttonsOf(fixture);
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();

    const items = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '[role="menuitem"]',
      ),
    );
    expect(fixture.componentInstance.open()).toBeTrue();
    expect(document.activeElement).toBe(items[0]);

    const keydown = (key: string, target: HTMLElement) =>
      target.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
        }),
      );

    keydown('ArrowUp', items[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[2]);

    keydown('Home', items[2]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);

    keydown('End', items[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[2]);
  });
});
