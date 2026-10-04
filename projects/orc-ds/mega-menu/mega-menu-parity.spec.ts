import { TestBed } from '@angular/core/testing';
import { MegaMenuComponent } from '@ciag/orchestra/p2';
import type { PrimeMenuItem } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the mega menu. Imported through the public
 * `@ciag/orchestra/p2` surface; must pass unchanged across the family move.
 */
describe('MegaMenu behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const keydown = (key: string, target: EventTarget) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );

  const model: PrimeMenuItem[] = [
    {
      label: 'First group',
      items: [
        { label: 'One', value: 'one' },
        { label: 'Two', value: 'two' },
      ],
    },
    {
      label: 'Disabled group',
      disabled: true,
      items: [{ label: 'Skip me', value: 'skip' }],
    },
    {
      label: 'Second group',
      items: [
        { label: 'Three', value: 'three' },
        { label: 'Blocked', value: 'blocked', disabled: true },
        { label: 'Invisible', value: 'gone', visible: false },
      ],
    },
  ];

  const navOf = (fixture: ReturnType<typeof create>) =>
    (fixture.nativeElement as HTMLElement).querySelector('nav') as HTMLElement;

  const enabledTargets = (fixture: ReturnType<typeof create>) =>
    Array.from(
      navOf(fixture).querySelectorAll<HTMLElement>('[data-mega-item]'),
    ).filter(
      (item) =>
        !(item instanceof HTMLButtonElement && item.disabled) &&
        !item.matches('[data-mega-disabled]'),
    );

  function create() {
    const fixture = TestBed.createComponent(MegaMenuComponent);
    fixture.componentRef.setInput('model', model);
    fixture.detectChanges();
    return fixture;
  }

  it('renders every visible entry including disabled ones and labels all groups', () => {
    const fixture = create();
    const nav = navOf(fixture);
    const items = Array.from(nav.querySelectorAll('[data-mega-item]'));
    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'One',
      'Two',
      'Skip me',
      'Three',
      'Blocked',
    ]);
    const headings = Array.from(nav.querySelectorAll('h3')).map((heading) =>
      heading.textContent?.trim(),
    );
    expect(headings).toEqual(['First group', 'Disabled group', 'Second group']);
    expect(
      fixture.componentInstance.navigableItems().map((item) => item.label),
    ).toEqual(['One', 'Two', 'Three']);
  });

  it('roves focus across enabled items with wrap-around and honors Home/End horizontally', () => {
    const fixture = create();
    const items = enabledTargets(fixture);
    expect(items.length).toBe(3);
    items[0].focus();

    keydown('ArrowRight', items[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[1]);

    keydown('ArrowLeft', items[1]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);

    keydown('ArrowLeft', items[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[2]);

    keydown('End', items[2]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[2]);

    keydown('Home', items[2]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
  });

  it('uses vertical arrows as forward/backward keys in vertical orientation', () => {
    const fixture = create();
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    const items = enabledTargets(fixture);
    items[0].focus();

    keydown('ArrowDown', items[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[1]);

    keydown('ArrowUp', items[1]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
    expect(navOf(fixture).classList.contains('vertical')).toBeTrue();
  });

  it('emits both itemSelect and onItemClick for allowed activations only', () => {
    const fixture = create();
    const selected: PrimeMenuItem[] = [];
    const clicked: PrimeMenuItem[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.componentInstance.onItemClick.subscribe((item) =>
      clicked.push(item),
    );
    const buttons = Array.from(navOf(fixture).querySelectorAll('button'));

    const three = buttons.find((button) =>
      button.textContent?.includes('Three'),
    ) as HTMLButtonElement;
    three.click();
    fixture.detectChanges();
    expect(selected.length).toBe(1);
    expect(clicked.length).toBe(1);
    expect(selected[0]).toBe(clicked[0]);

    // Disabled entries render but never activate.
    const blocked = buttons.find((button) =>
      button.textContent?.includes('Blocked'),
    ) as HTMLButtonElement;
    blocked.click();
    fixture.detectChanges();
    expect(selected.length).toBe(1);
  });
});
