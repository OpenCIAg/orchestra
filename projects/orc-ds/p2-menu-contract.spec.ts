import { TestBed } from '@angular/core/testing';
import { MenuComponent, PrimeMenuItem } from './p2/p2-advanced-components';
import { MenubarComponent, MenubarItem } from './p2/p2-data-components';
import { MenubarComponent as FocusedMenubarComponent } from './p2/p2-menubar-component';
import { focusElement } from '../../tools/quality/test-focus-events';

describe('P2 Menu and Menubar contracts', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('keeps the focused Menubar module and compatibility barrel on one component identity', () => {
    expect(MenubarComponent).toBe(FocusedMenubarComponent);
  });

  it('renders the public Menu items alias and keeps nested activation active', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    const child: PrimeMenuItem = { label: 'Child', value: 'child' };
    const parent: PrimeMenuItem = {
      label: 'Parent',
      value: 'parent',
      items: [child],
    };
    const selected: PrimeMenuItem[] = [];
    fixture.componentRef.setInput('items', [
      parent,
      { label: 'Hidden', visible: false },
      { label: 'Blocked', disabled: true },
    ]);
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('[role="menuitem"]')).toHaveSize(3);
    const childButton = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    ).find((button) =>
      button.textContent?.includes('Child'),
    ) as HTMLButtonElement;
    childButton.click();
    fixture.detectChanges();

    expect(selected).toEqual([child]);
    expect(childButton.classList.contains('active')).toBeTrue();
    expect(childButton.getAttribute('tabindex')).toBe('0');
  });

  it('skips disabled and hidden Menu entries during DOM keyboard navigation', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'First', value: 'first' },
      { label: 'Hidden', value: 'hidden', visible: false },
      { label: 'Blocked', value: 'blocked', disabled: true },
      { label: 'Last', value: 'last' },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();
    const menu = fixture.nativeElement.querySelector('nav') as HTMLElement;
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(menu.querySelector('button.active')?.textContent).toContain('Last');
    expect(menu.querySelector('button[disabled]')).not.toBeNull();
  });

  it('uses visible enabled Menubar items for roving focus and nested activation', () => {
    const fixture = TestBed.createComponent(MenubarComponent);
    const file: MenubarItem = { value: 'file', label: 'File' };
    fixture.componentRef.setInput('items', [
      file,
      { value: 'hidden', label: 'Hidden', visible: false },
      { value: 'blocked', label: 'Blocked', disabled: true },
      { value: 'view', label: 'View' },
    ] satisfies MenubarItem[]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const nav = root.querySelector('[role="menubar"]') as HTMLElement;
    const topButtons = (): HTMLButtonElement[] =>
      Array.from(
        root.querySelectorAll<HTMLButtonElement>('[data-menubar-item]'),
      );
    expect(topButtons()).toHaveSize(3);
    expect(topButtons()[0].getAttribute('tabindex')).toBe('0');
    const focusEvents: Event[] = [];
    fixture.componentInstance.onFocus.subscribe((event) =>
      focusEvents.push(event),
    );
    focusElement(topButtons()[0]);
    expect(focusEvents).toHaveSize(1);

    nav.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(topButtons()[2].classList.contains('is-active')).toBeTrue();
    expect(document.activeElement).toBe(topButtons()[2]);

    const nestedFile: MenubarItem = {
      value: 'file',
      label: 'File',
      children: [{ value: 'new', label: 'New' }],
    };
    fixture.componentRef.setInput('items', [
      nestedFile,
      { value: 'hidden', label: 'Hidden', visible: false },
      { value: 'blocked', label: 'Blocked', disabled: true },
      { value: 'view', label: 'View' },
    ]);
    fixture.detectChanges();
    topButtons()[0].click();
    fixture.detectChanges();
    expect(root.querySelector('[role="menu"]')).not.toBeNull();
    expect(topButtons()[0].getAttribute('aria-expanded')).toBe('true');
    const selected: MenubarItem[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    root.querySelector<HTMLButtonElement>('[role="menu"] button')?.click();
    expect(selected.map((item) => item.value)).toEqual(['new']);
  });

  it('keeps one-level Menubar child focus, ARIA linkage, and Escape return coherent', async () => {
    const fixture = TestBed.createComponent(MenubarComponent);
    const parent: MenubarItem = {
      value: 'file',
      label: 'File',
      children: [
        { value: 'hidden', label: 'Hidden', visible: false },
        { value: 'blocked', label: 'Blocked', disabled: true },
        { value: 'new', label: 'New' },
        { value: 'open', label: 'Open' },
      ],
    };
    fixture.componentRef.setInput('items', [
      parent,
      { value: 'view', label: 'View' },
    ]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const nav = root.querySelector('[role="menubar"]') as HTMLElement;
    const parentButton = root.querySelector<HTMLButtonElement>(
      '[data-menubar-item]',
    ) as HTMLButtonElement;
    const selected: MenubarItem[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );

    parentButton.click();
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    const submenu = root.querySelector('[role="menu"]') as HTMLElement;
    const children = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        '[data-menubar-child]:not(:disabled)',
      ),
    );
    expect(children).toHaveSize(2);
    expect(parentButton.getAttribute('aria-haspopup')).toBe('menu');
    expect(parentButton.getAttribute('aria-expanded')).toBe('true');
    expect(parentButton.getAttribute('aria-controls')).toBe(submenu.id);
    expect(children[0].getAttribute('tabindex')).toBe('0');
    expect(document.activeElement).toBe(children[0]);
    expect(selected).toEqual([]);

    children[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(children[1]);
    expect(children[1].getAttribute('tabindex')).toBe('0');
    children[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(children[0]);

    children[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(selected.map((item) => item.value)).toEqual(['new']);
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()).toBeNull();
    expect(document.activeElement).toBe(parentButton);

    parentButton.click();
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    const reopenedChild = root.querySelector<HTMLButtonElement>(
      '[data-menubar-child]',
    ) as HTMLButtonElement;
    reopenedChild.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()).toBeNull();
    expect(document.activeElement).toBe(parentButton);
    expect(parentButton.getAttribute('aria-expanded')).toBe('false');

    nav.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    const viewButton = root.querySelectorAll<HTMLButtonElement>(
      '[data-menubar-item]',
    )[1];
    expect(document.activeElement).toBe(viewButton);
    viewButton.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(selected.map((item) => item.value)).toEqual(['new', 'view']);
  });

  it('uses horizontal root navigation and Down Arrow to open a submenu', async () => {
    const fixture = TestBed.createComponent(MenubarComponent);
    fixture.componentRef.setInput('items', [
      {
        value: 'file',
        label: 'File',
        children: [{ value: 'new', label: 'New' }],
      },
      {
        value: 'edit',
        label: 'Edit',
        children: [{ value: 'copy', label: 'Copy' }],
      },
    ] satisfies MenubarItem[]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[data-menubar-item]'),
    );

    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[1]);
    expect(fixture.componentInstance.openItem()).toBeNull();

    buttons[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()?.value).toBe('edit');
    expect(document.activeElement?.textContent).toContain('Copy');
  });

  it('closes the Menubar submenu when focus leaves the composite', async () => {
    const fixture = TestBed.createComponent(MenubarComponent);
    fixture.componentRef.setInput('items', [
      {
        value: 'file',
        label: 'File',
        children: [{ value: 'new', label: 'New' }],
      },
    ] satisfies MenubarItem[]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const parent = root.querySelector<HTMLButtonElement>(
      '[data-menubar-item]',
    ) as HTMLButtonElement;
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    parent.click();
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()?.value).toBe('file');

    focusElement(outside);
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()).toBeNull();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it('reconciles open and active items when a controlled Menubar model changes', async () => {
    const fixture = TestBed.createComponent(MenubarComponent);
    const firstParent: MenubarItem = {
      value: 'file',
      label: 'File',
      children: [
        { value: 'new', label: 'New' },
        { value: 'open', label: 'Open' },
      ],
    };
    fixture.componentRef.setInput('items', [
      firstParent,
      { value: 'view', label: 'View' },
    ]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const parent = root.querySelector<HTMLButtonElement>(
      '[data-menubar-item]',
    ) as HTMLButtonElement;
    parent.click();
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const replacement: MenubarItem = {
      value: 'file',
      label: 'File',
      children: [
        { value: 'new', label: 'Create' },
        { value: 'open', label: 'Open' },
      ],
    };
    fixture.componentRef.setInput('items', [
      replacement,
      { value: 'view', label: 'View' },
    ]);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()).toBe(replacement);
    expect(fixture.componentInstance.activeChild()).toBe(
      replacement.children![0],
    );
    expect(
      root
        .querySelector<HTMLButtonElement>('[data-menubar-child]')
        ?.getAttribute('tabindex'),
    ).toBe('0');

    const nav = root.querySelector('[role="menubar"]') as HTMLElement;
    nav.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    fixture.componentRef.setInput('items', [replacement]);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(
      root
        .querySelector<HTMLButtonElement>('[data-menubar-item]')
        ?.getAttribute('tabindex'),
    ).toBe('0');

    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()).toBeNull();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it('does not expose hidden-only Menubar children and gives each instance stable submenu IDs', () => {
    const first = TestBed.createComponent(MenubarComponent);
    const second = TestBed.createComponent(MenubarComponent);
    const hiddenParent: MenubarItem = {
      value: 'hidden-parent',
      label: 'Hidden parent',
      children: [{ value: 'gone', label: 'Gone', visible: false }],
    };
    const visibleParent: MenubarItem = {
      value: 'visible-parent',
      label: 'Visible parent',
      children: [{ value: 'child', label: 'Child' }],
    };
    first.componentRef.setInput('items', [hiddenParent]);
    second.componentRef.setInput('items', [visibleParent]);
    first.detectChanges();
    second.detectChanges();
    const firstRoot = first.nativeElement as HTMLElement;
    const secondRoot = second.nativeElement as HTMLElement;
    const firstButton = firstRoot.querySelector<HTMLButtonElement>(
      '[data-menubar-item]',
    ) as HTMLButtonElement;
    const secondButton = secondRoot.querySelector<HTMLButtonElement>(
      '[data-menubar-item]',
    ) as HTMLButtonElement;
    expect(firstButton.hasAttribute('aria-expanded')).toBeFalse();
    expect(firstButton.hasAttribute('aria-controls')).toBeFalse();
    secondButton.click();
    second.detectChanges();
    const submenu = secondRoot.querySelector('[role="menu"]') as HTMLElement;
    expect(secondButton.getAttribute('aria-controls')).toBe(submenu.id);
    expect(firstButton.getAttribute('aria-controls')).not.toBe(
      secondButton.getAttribute('aria-controls'),
    );
  });

  it('keeps Menubar disabled actions quiet and closes an open submenu on Escape', () => {
    const fixture = TestBed.createComponent(MenubarComponent);
    const file: MenubarItem = {
      value: 'file',
      label: 'File',
      children: [{ value: 'new', label: 'New' }],
    };
    fixture.componentRef.setInput('items', [
      file,
      { value: 'blocked', label: 'Blocked', disabled: true },
    ]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const nav = root.querySelector('[role="menubar"]') as HTMLElement;
    const selected: MenubarItem[] = [];
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );

    root.querySelector<HTMLButtonElement>('[data-menubar-item]')?.click();
    fixture.detectChanges();
    nav.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.openItem()).toBeNull();

    const blocked = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[data-menubar-item]'),
    ).find((button) =>
      button.textContent?.includes('Blocked'),
    ) as HTMLButtonElement;
    blocked.click();
    expect(selected).toEqual([]);
  });

  it('emits Menubar blur only when focus leaves the composite', () => {
    const fixture = TestBed.createComponent(MenubarComponent);
    fixture.componentRef.setInput('items', [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' },
    ] satisfies MenubarItem[]);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = root.querySelectorAll<HTMLButtonElement>(
      '[data-menubar-item]',
    );
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    const blurEvents: Event[] = [];
    fixture.componentInstance.onBlur.subscribe((event) =>
      blurEvents.push(event),
    );

    focusElement(buttons[0]);
    focusElement(buttons[1]);
    expect(blurEvents).toHaveSize(0);
    focusElement(outside);
    expect(blurEvents).toHaveSize(1);

    outside.remove();
  });
});
