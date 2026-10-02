import { TestBed } from '@angular/core/testing';
import { MenubarComponent } from '@ciag/orchestra/p2';
import type { MenubarItem } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the menubar. Imported through the public
 * `@ciag/orchestra/p2` surface; must pass unchanged across the family move.
 */
describe('Menubar behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const keydown = (key: string, target: EventTarget) =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );

  const model: MenubarItem[] = [
    { label: 'File', value: 'file' },
    {
      label: 'Edit',
      value: 'edit',
      children: [{ label: 'Copy', value: 'copy', shortcut: '⌘C' }],
    },
    { label: 'Blocked', value: 'blocked', disabled: true },
  ];

  const rootButtons = (fixture: ReturnType<typeof create>) =>
    Array.from(
      (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll<HTMLButtonElement>('[data-menubar-item]'),
    );

  function create() {
    const fixture = TestBed.createComponent(MenubarComponent);
    fixture.componentRef.setInput('model', model);
    fixture.detectChanges();
    return fixture;
  }

  it('renders visible roots from the model alias with accessible chrome', () => {
    const fixture = create();
    const roots = rootButtons(fixture);
    expect(roots.map((root) => root.textContent?.trim())).toEqual([
      'File',
      'Edit',
      'Blocked',
    ]);
    expect(roots[2].matches(':disabled')).toBeTrue();
    const nav = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="menubar"]',
    ) as HTMLElement;
    expect(nav.getAttribute('aria-orientation')).toBe('horizontal');
    expect(roots[1].getAttribute('aria-haspopup')).toBe('menu');
  });

  it('roves root focus across enabled entries with wrap-around and honors Home/End', () => {
    const fixture = create();
    const roots = rootButtons(fixture);
    roots[0].focus();

    keydown('ArrowRight', roots[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(roots[1]);

    keydown('ArrowLeft', roots[1]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(roots[0]);

    keydown('ArrowLeft', roots[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(roots[1]);

    keydown('Home', roots[1]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(roots[0]);

    // End lands on the last enabled root, skipping the trailing disabled one.
    keydown('End', roots[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(roots[1]);
  });

  it('opens a submenu with ArrowDown, focuses its child, and closes with Escape', async () => {
    const fixture = create();
    const roots = rootButtons(fixture);
    roots[1].focus();
    keydown('ArrowDown', roots[1]);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()).toBe(model[1]);

    const child = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-menubar-child]',
    ) as HTMLButtonElement;
    expect(child).not.toBeNull();
    expect(child.textContent?.trim()).toBe('Copy⌘C');
    expect(document.activeElement).toBe(child);

    keydown('Escape', child);
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()).toBeNull();
  });

  it('emits itemSelect for leaf activation and passes keydowns through menuKeydown', () => {
    const fixture = create();
    const selected: MenubarItem[] = [];
    const keys: string[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.componentInstance.menuKeydown.subscribe((event) =>
      keys.push(event.key),
    );
    const roots = rootButtons(fixture);
    roots[0].focus();
    keydown('Enter', roots[0]);
    fixture.detectChanges();
    expect(selected.map((item) => item.value)).toEqual(['file']);
    expect(keys).toContain('Enter');
  });
});
