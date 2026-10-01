import { TestBed } from '@angular/core/testing';
import { MenuComponent, PrimeMenuItem } from './p2-advanced-components';
import {
  PanelMenuComponent,
  TieredMenuComponent,
} from './p2-menu-family-components';

describe('P2 advanced menu contracts', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('focuses the first enabled Menu item after the popup host renders', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const fixture = TestBed.createComponent(MenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Disabled', disabled: true },
      { label: 'First enabled' },
    ]);
    fixture.componentRef.setInput('popup', true);
    fixture.detectChanges();

    fixture.componentInstance.show();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(document.activeElement?.textContent).toContain('First enabled');
    trigger.remove();
  });

  it('moves native focus with Menu roving keyboard navigation', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'First', value: 'first' },
      {
        label: 'Nested parent',
        value: 'parent',
        items: [{ label: 'Nested child', value: 'child' }],
      },
      { label: 'Hidden', value: 'hidden', visible: false },
      { label: 'Separator', separator: true },
      { label: 'Blocked', value: 'blocked', disabled: true },
      { label: 'Last', value: 'last' },
    ] satisfies PrimeMenuItem[]);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const first = nav.querySelector(
      'button[role="menuitem"]',
    ) as HTMLButtonElement;
    first.focus();
    nav.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    expect(document.activeElement?.textContent).toContain('Nested parent');

    nav.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    expect(document.activeElement?.textContent).toContain('Last');

    nav.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('First');
  });

  it('syncs the Menu roving stop when focus lands directly on root or nested items', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    const parent: PrimeMenuItem = {
      label: 'Parent',
      items: [{ label: 'Child' }],
    };
    fixture.componentRef.setInput('items', [
      { label: 'First' },
      parent,
      { label: 'Last' },
    ]);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const roots = host.querySelectorAll<HTMLElement>(
      ':scope > .menu-entry > [role="menuitem"]',
    );
    roots[2].focus();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    expect(roots[2].getAttribute('tabindex')).toBe('0');
    expect(roots[0].getAttribute('tabindex')).toBe('-1');

    roots[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    const child = host.querySelector(
      'ul[role="menu"] [role="menuitem"]',
    ) as HTMLElement;
    child.focus();
    fixture.detectChanges();
    expect(child.getAttribute('tabindex')).toBe('0');
    expect(roots[1].getAttribute('tabindex')).toBe('-1');
  });

  it('generates unique Menu submenu ids for independent instances', () => {
    const firstFixture = TestBed.createComponent(MenuComponent);
    const secondFixture = TestBed.createComponent(MenuComponent);
    firstFixture.componentRef.setInput('items', [
      { label: 'First parent', items: [{ label: 'Child' }] },
    ]);
    secondFixture.componentRef.setInput('items', [
      { label: 'Second parent', items: [{ label: 'Child' }] },
    ]);
    firstFixture.detectChanges();
    secondFixture.detectChanges();

    const firstHost = firstFixture.nativeElement.querySelector(
      'nav',
    ) as HTMLElement;
    const secondHost = secondFixture.nativeElement.querySelector(
      'nav',
    ) as HTMLElement;
    const firstControls = firstHost
      .querySelector('[role="menuitem"]')
      ?.getAttribute('aria-controls') as string;
    const secondControls = secondHost
      .querySelector('[role="menuitem"]')
      ?.getAttribute('aria-controls') as string;
    expect(firstControls).toBeTruthy();
    expect(secondControls).toBeTruthy();
    expect(firstControls).not.toBe(secondControls);
    expect(
      Array.from(firstHost.querySelectorAll<HTMLElement>('[role="menu"]')).some(
        (menu) => menu.id === firstControls,
      ),
    ).toBeTrue();
    expect(
      Array.from(
        secondHost.querySelectorAll<HTMLElement>('[role="menu"]'),
      ).some((menu) => menu.id === secondControls),
    ).toBeTrue();
  });

  it('exposes nested Menu entries as collapsed disclosure menuitems', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Parent', items: [{ label: 'Child' }] },
    ]);
    fixture.detectChanges();
    const parent = fixture.nativeElement.querySelector(
      'button[role="menuitem"]',
    ) as HTMLButtonElement;
    expect(parent.getAttribute('aria-haspopup')).toBe('true');
    expect(parent.getAttribute('aria-expanded')).toBe('false');
    expect(parent.getAttribute('aria-controls')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('ul.menu-submenu-hidden'),
    ).not.toBeNull();
  });

  it('opens and toggles Menu disclosure parents without selecting them', async () => {
    const fixture = TestBed.createComponent(MenuComponent);
    const parent: PrimeMenuItem = {
      label: 'Parent',
      items: [{ label: 'First child' }, { label: 'Second child' }],
    };
    const selected: PrimeMenuItem[] = [];
    fixture.componentRef.setInput('items', [parent]);
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const parentButton = host.querySelector(
      '[role="menuitem"]',
    ) as HTMLButtonElement;
    const submenu = host.querySelector('ul[role="menu"]') as HTMLElement;
    expect(parentButton.getAttribute('aria-expanded')).toBe('false');
    expect(submenu.classList.contains('menu-submenu-hidden')).toBeTrue();

    parentButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(parentButton.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.textContent).toContain('First child');
    expect(selected).toEqual([]);

    const firstChild = document.activeElement as HTMLElement;
    firstChild.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(parentButton.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(parentButton);

    parentButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    parentButton.click();
    fixture.detectChanges();
    expect(parentButton.getAttribute('aria-expanded')).toBe('false');
    expect(selected).toEqual([]);
  });

  it('associates TieredMenu submenus and updates expansion state', () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Parent', items: [{ label: 'Child' }] },
    ]);
    fixture.detectChanges();
    const parent = fixture.nativeElement.querySelector(
      'button[role="menuitem"]',
    ) as HTMLButtonElement;
    expect(parent.getAttribute('aria-haspopup')).toBe('true');
    expect(parent.getAttribute('aria-expanded')).toBe('false');

    parent.click();
    fixture.detectChanges();
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    expect(parent.getAttribute('aria-controls')).toBeTruthy();
    const submenu = fixture.nativeElement.querySelector(
      '.submenu',
    ) as HTMLElement;
    expect(submenu.getAttribute('role')).toBe('menu');
    expect(submenu.getAttribute('aria-label')).toBe('Parent');
    expect(parent.getAttribute('aria-controls')).toBe(submenu.id);
  });

  it('opens and focuses the first enabled TieredMenu child with ArrowRight', async () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('items', [
      {
        label: 'Parent',
        items: [
          { label: 'Hidden', visible: false },
          { label: 'Disabled', disabled: true },
          { label: 'First child' },
          { label: 'Second child' },
        ],
      },
    ]);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const parent = nav.querySelector(
      ':scope > button[role="menuitem"]',
    ) as HTMLButtonElement;
    parent.focus();
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const submenu = fixture.nativeElement.querySelector(
      '.submenu',
    ) as HTMLElement;
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.textContent).toContain('First child');
    expect(
      submenu.querySelectorAll('button[role="menuitem"]:not(:disabled)').length,
    ).toBe(2);
  });

  it('roves TieredMenu child focus and restores the owner with Left or Escape', async () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('items', [
      {
        label: 'Parent',
        items: [{ label: 'First child' }, { label: 'Second child' }],
      },
    ]);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const parent = nav.querySelector(
      ':scope > button[role="menuitem"]',
    ) as HTMLButtonElement;
    parent.focus();
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    let child = document.activeElement as HTMLButtonElement;
    child.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('Second child');

    child = document.activeElement as HTMLButtonElement;
    child.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('First child');

    child.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('Second child');
    child = document.activeElement as HTMLButtonElement;
    child.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('First child');

    (document.activeElement as HTMLButtonElement).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(parent);
    expect(parent.getAttribute('aria-expanded')).toBe('false');
  });

  it('activates the focused TieredMenu child with Enter and Space', async () => {
    const command = jasmine.createSpy('childCommand');
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Parent', items: [{ label: 'Child', command }] },
    ]);
    fixture.detectChanges();

    const parent = fixture.nativeElement.querySelector(
      'nav > button[role="menuitem"]',
    ) as HTMLButtonElement;
    parent.focus();
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const child = document.activeElement as HTMLButtonElement;
    child.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    child.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(command).toHaveBeenCalledTimes(2);
  });

  it('opens TieredMenu submenus toward inline-end: right in LTR and left in RTL', () => {
    const measure = (direction: 'ltr' | 'rtl') => {
      const fixture = TestBed.createComponent(TieredMenuComponent);
      fixture.componentRef.setInput('items', [
        { label: 'Parent', items: [{ label: 'Child' }] },
      ]);
      fixture.detectChanges();

      const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
      nav.dir = direction;
      nav.style.width = '16rem';
      (
        nav.querySelector('button[role="menuitem"]') as HTMLButtonElement
      ).click();
      fixture.detectChanges();

      const submenu = fixture.nativeElement.querySelector(
        '.submenu',
      ) as HTMLElement;
      return {
        nav: nav.getBoundingClientRect(),
        submenu: submenu.getBoundingClientRect(),
      };
    };

    const ltr = measure('ltr');
    const rtl = measure('rtl');
    expect(ltr.submenu.right).toBeGreaterThan(ltr.nav.right);
    expect(rtl.submenu.left).toBeLessThan(rtl.nav.left);
  });

  it('moves PanelMenu root focus with arrows and exposes tree levels and controls', () => {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Hidden', visible: false },
      { label: 'Parent', items: [{ label: 'Child' }] },
      { label: 'Divider', separator: true },
      { label: 'Blocked', disabled: true },
      { label: 'Leaf' },
    ]);
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const roots = tree.querySelectorAll<HTMLButtonElement>(
      ':scope > button[role="treeitem"]:not(:disabled)',
    );
    expect(tree.querySelectorAll(':scope > [role="separator"]').length).toBe(1);
    expect(roots[0].getAttribute('aria-controls')).toBeNull();
    roots[0].focus();
    roots[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(roots[1]);
    roots[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(roots[0]);
    roots[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(roots[1]);

    roots[0].click();
    fixture.detectChanges();
    const parent = tree.querySelector(
      ':scope > button[aria-controls]',
    ) as HTMLButtonElement;
    const children = tree.querySelector('[role="group"]') as HTMLElement;
    expect(parent.getAttribute('aria-level')).toBe('1');
    expect(parent.getAttribute('aria-controls')).toBe(children.id);
    expect(parent.getAttribute('aria-owns')).toBe(children.id);
    expect(children.querySelector('button')?.getAttribute('aria-level')).toBe(
      '2',
    );
    expect(tree.querySelectorAll(':scope > button[tabindex="0"]').length).toBe(
      1,
    );
    expect(children.querySelector('button[tabindex="0"]')).toBeNull();
  });

  it('opens PanelMenu children with Right, roves them, and restores the parent', async () => {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', [
      {
        label: 'Parent',
        items: [
          { label: 'Hidden', visible: false },
          { label: 'Disabled', disabled: true },
          { label: 'First child' },
          { label: 'Second child' },
        ],
      },
    ]);
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const parent = tree.querySelector(
      ':scope > button[role="treeitem"]',
    ) as HTMLButtonElement;
    parent.focus();
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(parent);
    expect(parent.getAttribute('tabindex')).toBe('0');
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(parent.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(parent);
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const children = tree.querySelector('[role="group"]') as HTMLElement;
    const enabledChildren = children.querySelectorAll<HTMLButtonElement>(
      'button[role="treeitem"]:not(:disabled)',
    );
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    expect(parent.getAttribute('tabindex')).toBe('-1');
    expect(parent.getAttribute('aria-controls')).toBe(children.id);
    expect(enabledChildren.length).toBe(2);
    expect(document.activeElement).toBe(enabledChildren[0]);
    expect(enabledChildren[0].getAttribute('tabindex')).toBe('0');
    enabledChildren[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(enabledChildren[1]);
    enabledChildren[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(parent);
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    expect(parent.getAttribute('aria-controls')).toBe(children.id);
    expect(parent.getAttribute('aria-owns')).toBe(children.id);
    expect(parent.getAttribute('tabindex')).toBe('0');
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(parent);
    expect(parent.getAttribute('aria-expanded')).toBe('false');
    expect(parent.getAttribute('aria-controls')).toBeNull();
    expect(parent.getAttribute('aria-owns')).toBeNull();
  });

  it('traverses PanelMenu expanded roots and children as one tree without wrapping', () => {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', [
      {
        label: 'Parent',
        items: [{ label: 'First child' }, { label: 'Second child' }],
      },
      { label: 'Leaf' },
    ]);
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const parent = tree.querySelector(
      ':scope > button[role="treeitem"]',
    ) as HTMLButtonElement;
    const leaf = tree.querySelectorAll<HTMLButtonElement>(
      ':scope > button[role="treeitem"]',
    )[1];
    parent.click();
    fixture.detectChanges();
    parent.focus();
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('First child');
    (document.activeElement as HTMLButtonElement).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('Second child');
    (document.activeElement as HTMLButtonElement).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(leaf);
    leaf.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(leaf);
    leaf.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(parent);
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(leaf);
  });

  it('activates PanelMenu children with Enter and Space while toggling parents', async () => {
    const command = jasmine.createSpy('panelChildCommand');
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Parent', items: [{ label: 'Child', command }] },
    ]);
    fixture.detectChanges();

    const parent = fixture.nativeElement.querySelector(
      '[role="tree"] > button[role="treeitem"]',
    ) as HTMLButtonElement;
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    await fixture.whenStable();
    const child = fixture.nativeElement.querySelector(
      '[role="group"] button[role="treeitem"]',
    ) as HTMLButtonElement;
    child.focus();
    child.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    child.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(command).toHaveBeenCalledTimes(2);
  });

  it('keeps PanelMenu parent focus when ArrowRight opens an empty child group', () => {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', [
      {
        label: 'Empty parent',
        items: [
          { label: 'Hidden', visible: false },
          { label: 'Disabled', disabled: true },
        ],
      },
    ]);
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const parent = tree.querySelector(
      ':scope > button[role="treeitem"]',
    ) as HTMLButtonElement;
    parent.focus();
    parent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();

    expect(document.activeElement).toBe(parent);
    expect(parent.getAttribute('tabindex')).toBe('0');
    expect(
      tree.querySelector(
        '[role="group"] button[role="treeitem"]:not(:disabled)',
      ),
    ).toBeNull();
    expect(parent.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps children disabled when a controlled open parent is disabled', () => {
    const command = jasmine.createSpy('disabledParentChildCommand');
    const parent: PrimeMenuItem = {
      label: 'Blocked parent',
      disabled: true,
      items: [{ label: 'Child', command }],
    };
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', [parent]);
    fixture.componentRef.setInput('open', new Set([parent]));
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    const child = tree.querySelector(
      '[role="group"] button[role="treeitem"]',
    ) as HTMLButtonElement;
    expect(child.disabled).toBeTrue();
    child.click();
    fixture.detectChanges();
    expect(command).not.toHaveBeenCalled();
  });

  it('uses logical PanelMenu child indentation and text alignment in RTL', () => {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Parent', items: [{ label: 'Child' }] },
    ]);
    fixture.detectChanges();

    const tree = fixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    tree.dir = 'rtl';
    (
      tree.querySelector(
        ':scope > button[role="treeitem"]',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    const group = tree.querySelector('[role="group"]') as HTMLElement;
    const child = group.querySelector(
      'button[role="treeitem"]',
    ) as HTMLButtonElement;
    expect(getComputedStyle(group).paddingInlineStart).not.toBe('0px');
    expect(getComputedStyle(child).textAlign).toBe('start');
  });

  it('emits collapse aliases when single-open PanelMenu switches parents', () => {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    const first = { label: 'First', items: [{ label: 'First child' }] };
    const second = { label: 'Second', items: [{ label: 'Second child' }] };
    fixture.componentRef.setInput('items', [first, second]);
    const collapsed: PrimeMenuItem[] = [];
    const collapsedAliases: PrimeMenuItem[] = [];
    fixture.componentInstance.onItemCollapse.subscribe((item) =>
      collapsed.push(item),
    );
    fixture.componentInstance.onNodeCollapse.subscribe((item) =>
      collapsedAliases.push(item),
    );

    fixture.componentInstance.toggle(first);
    fixture.componentInstance.toggle(second);

    expect(collapsed).toEqual([first]);
    expect(collapsedAliases).toEqual([first]);
    expect(fixture.componentInstance.open().has(first)).toBeFalse();
    expect(fixture.componentInstance.open().has(second)).toBeTrue();
  });

  it('navigates nested Menu siblings and restores the parent focus', async () => {
    const fixture = TestBed.createComponent(MenuComponent);
    const command = jasmine.createSpy('nestedKeyboardCommand');
    const parent: PrimeMenuItem = {
      label: 'Parent',
      items: [{ label: 'First child' }, { label: 'Second child', command }],
    };
    fixture.componentRef.setInput('items', [parent, { label: 'Leaf' }]);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const parentButton = nav.querySelector(
      ':scope > .menu-entry > [role="menuitem"]',
    ) as HTMLButtonElement;
    const children = () =>
      Array.from(
        nav.querySelectorAll<HTMLButtonElement>(
          ':scope > .menu-entry > ul > .menu-entry > [role="menuitem"]',
        ),
      );
    parentButton.focus();
    parentButton.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('First child');
    expect(children()[0].getAttribute('tabindex')).toBe('0');
    expect(parentButton.getAttribute('tabindex')).toBe('-1');

    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('Second child');
    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(command).toHaveBeenCalledTimes(1);

    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(parentButton);
    expect(parentButton.getAttribute('tabindex')).toBe('0');
  });

  it('filters hidden-only Menu children and preserves leaf URL activation semantics', () => {
    const fixture = TestBed.createComponent(MenuComponent);
    const command = jasmine.createSpy('menuLinkCommand');
    const link: PrimeMenuItem = {
      label: 'Docs',
      url: '/docs',
      target: '_blank',
      command,
    };
    const disabled: PrimeMenuItem = {
      label: 'Disabled docs',
      url: '/disabled',
      target: '_self',
      disabled: true,
    };
    const hiddenParent: PrimeMenuItem = {
      label: 'Hidden parent',
      items: [{ label: 'Hidden child', visible: false }],
    };
    const selected: PrimeMenuItem[] = [];
    const aliases: PrimeMenuItem[] = [];
    fixture.componentRef.setInput('items', [link, disabled, hiddenParent]);
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.componentInstance.onItemClick.subscribe((item) =>
      aliases.push(item),
    );
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const anchor = root.querySelector('a[href="/docs"]') as HTMLAnchorElement;
    expect(anchor.target).toBe('_blank');
    expect(anchor.rel).toBe('noopener noreferrer');
    expect(anchor.getAttribute('tabindex')).toBe('0');
    fixture.componentInstance.activate(link);
    expect(command).toHaveBeenCalledTimes(1);
    expect(selected).toEqual([link]);
    expect(aliases).toEqual(selected);

    const disabledAnchor = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('a'),
    ).find((item) =>
      item.textContent?.includes('Disabled docs'),
    ) as HTMLAnchorElement;
    expect(disabledAnchor.getAttribute('href')).toBeNull();
    expect(disabledAnchor.getAttribute('aria-disabled')).toBe('true');
    fixture.componentInstance.activate(disabled);
    expect(selected).toEqual([link]);

    const hiddenParentButton = Array.from(
      root.querySelectorAll<HTMLButtonElement>('button'),
    ).find((item) =>
      item.textContent?.includes('Hidden parent'),
    ) as HTMLButtonElement;
    expect(hiddenParentButton.getAttribute('aria-haspopup')).toBeNull();
    expect(hiddenParentButton.getAttribute('aria-expanded')).toBeNull();
    expect(hiddenParentButton.parentElement?.querySelector('ul')).toBeNull();
  });

  it('renders safe leaf links and preserves TieredMenu event cardinality', () => {
    const fixture = TestBed.createComponent(TieredMenuComponent);
    const command = jasmine.createSpy('tieredLinkCommand');
    const link: PrimeMenuItem = {
      label: 'Docs',
      url: '/tiered-docs',
      target: '_blank',
      command,
    };
    const disabled: PrimeMenuItem = {
      label: 'Disabled docs',
      url: '/tiered-disabled',
      disabled: true,
    };
    const child: PrimeMenuItem = { label: 'Child docs', url: '/tiered-child' };
    const parent: PrimeMenuItem = { label: 'Parent', items: [child] };
    const selected: PrimeMenuItem[] = [];
    const aliases: PrimeMenuItem[] = [];
    fixture.componentRef.setInput('items', [link, disabled, parent]);
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.componentInstance.onItemClick.subscribe((item) =>
      aliases.push(item),
    );
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const anchor = root.querySelector(
      'a[href="/tiered-docs"]',
    ) as HTMLAnchorElement;
    expect(anchor.target).toBe('_blank');
    expect(anchor.rel).toBe('noopener noreferrer');
    fixture.componentInstance.activate(link);
    fixture.componentInstance.activate(disabled);
    expect(command).toHaveBeenCalledTimes(1);
    expect(selected).toEqual([link]);
    expect(aliases).toEqual(selected);
    expect(root.querySelector('a[href="/tiered-disabled"]')).toBeNull();

    fixture.componentInstance.activate(parent);
    fixture.detectChanges();
    const childAnchor = root.querySelector(
      'a[href="/tiered-child"]',
    ) as HTMLAnchorElement;
    expect(childAnchor).not.toBeNull();
    fixture.componentInstance.activateChild(child);
    expect(selected).toEqual([link, child]);
    expect(aliases).toEqual(selected);
  });

  it('renders safe leaf links and disabled semantics in PanelMenu', () => {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    const rootLink: PrimeMenuItem = {
      label: 'Docs',
      url: '/panel-docs',
      target: '_blank',
    };
    const disabled: PrimeMenuItem = {
      label: 'Disabled docs',
      url: '/panel-disabled',
      disabled: true,
    };
    const child: PrimeMenuItem = {
      label: 'Child docs',
      url: '/panel-child',
      target: '_self',
    };
    const parent: PrimeMenuItem = { label: 'Parent', items: [child] };
    const selected: PrimeMenuItem[] = [];
    const aliases: PrimeMenuItem[] = [];
    fixture.componentRef.setInput('items', [rootLink, disabled, parent]);
    fixture.componentInstance.itemSelect.subscribe((item) =>
      selected.push(item),
    );
    fixture.componentInstance.onNodeSelect.subscribe((item) =>
      aliases.push(item),
    );
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const anchor = root.querySelector(
      'a[href="/panel-docs"]',
    ) as HTMLAnchorElement;
    expect(anchor.target).toBe('_blank');
    expect(anchor.rel).toBe('noopener noreferrer');
    fixture.componentInstance.select(rootLink);
    expect(selected).toEqual([rootLink]);
    expect(aliases).toEqual(selected);
    const disabledAnchor = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('a'),
    ).find((item) =>
      item.textContent?.includes('Disabled docs'),
    ) as HTMLAnchorElement;
    expect(disabledAnchor.getAttribute('href')).toBeNull();
    expect(disabledAnchor.getAttribute('aria-disabled')).toBe('true');

    fixture.componentInstance.toggle(parent);
    fixture.detectChanges();
    const childAnchor = root.querySelector(
      'a[href="/panel-child"]',
    ) as HTMLAnchorElement;
    expect(childAnchor.target).toBe('_self');
    fixture.componentInstance.select(child, parent);
    expect(selected).toEqual([rootLink, child]);
    expect(aliases).toEqual(selected);
  });

  it('keeps menu hosts out of the tab sequence and exposes one roving item stop', async () => {
    const menuFixture = TestBed.createComponent(MenuComponent);
    menuFixture.componentRef.setInput('items', [
      { label: 'Parent', items: [{ label: 'Child' }] },
      { label: 'Leaf' },
    ]);
    menuFixture.detectChanges();
    const menu = menuFixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(menu.getAttribute('tabindex')).toBe('-1');
    expect(
      menu.querySelectorAll('button[role="menuitem"][tabindex="0"]').length,
    ).toBe(1);

    const tieredFixture = TestBed.createComponent(TieredMenuComponent);
    tieredFixture.componentRef.setInput('items', [
      { label: 'Parent', items: [{ label: 'Child' }] },
      { label: 'Leaf' },
    ]);
    tieredFixture.detectChanges();
    const tiered = tieredFixture.nativeElement.querySelector(
      'nav',
    ) as HTMLElement;
    expect(tiered.getAttribute('tabindex')).toBe('-1');
    expect(
      tiered.querySelectorAll('button[role="menuitem"][tabindex="0"]').length,
    ).toBe(1);
    const tieredParent = tiered.querySelector(
      ':scope > button[role="menuitem"]',
    ) as HTMLButtonElement;
    tieredParent.click();
    tieredFixture.detectChanges();
    expect(
      tiered.querySelectorAll('button[role="menuitem"][tabindex="0"]').length,
    ).toBe(1);
    expect(tieredParent.getAttribute('tabindex')).toBe('0');
    tieredParent.focus();
    tieredParent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    tieredFixture.detectChanges();
    await tieredFixture.whenStable();
    tieredFixture.detectChanges();
    expect(
      tiered.querySelectorAll('button[role="menuitem"][tabindex="0"]').length,
    ).toBe(1);
    expect(document.activeElement?.textContent).toContain('Child');
    expect(tieredParent.getAttribute('tabindex')).toBe('-1');

    const panelFixture = TestBed.createComponent(PanelMenuComponent);
    panelFixture.componentRef.setInput('items', [
      { label: 'Parent', items: [{ label: 'Child' }] },
      { label: 'Leaf' },
    ]);
    panelFixture.detectChanges();
    const tree = panelFixture.nativeElement.querySelector(
      '[role="tree"]',
    ) as HTMLElement;
    expect(tree.getAttribute('tabindex')).toBe('-1');
    expect(
      tree.querySelectorAll('button[role="treeitem"][tabindex="0"]').length,
    ).toBe(1);
    const panelParent = tree.querySelector(
      ':scope > button[role="treeitem"]',
    ) as HTMLButtonElement;
    panelParent.focus();
    panelParent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    panelFixture.detectChanges();
    panelParent.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    panelFixture.detectChanges();
    const panelChild = tree.querySelector(
      '[role="group"] button[role="treeitem"]',
    ) as HTMLButtonElement;
    expect(
      tree.querySelectorAll('button[role="treeitem"][tabindex="0"]').length,
    ).toBe(1);
    expect(panelChild.getAttribute('tabindex')).toBe('0');
    expect(panelParent.getAttribute('tabindex')).toBe('-1');

    menuFixture.componentRef.setInput('tabindex', -1);
    tieredFixture.componentRef.setInput('tabindex', -1);
    panelFixture.componentRef.setInput('tabindex', -1);
    menuFixture.detectChanges();
    tieredFixture.detectChanges();
    panelFixture.detectChanges();
    expect(menu.querySelectorAll('[tabindex="0"]').length).toBe(0);
    expect(tiered.querySelectorAll('[tabindex="0"]').length).toBe(0);
    expect(tree.querySelectorAll('[tabindex="0"]').length).toBe(0);
  });

  it('removes every Menu-family item from focus when globally disabled', () => {
    const menuFixture = TestBed.createComponent(MenuComponent);
    menuFixture.componentRef.setInput('items', [
      { label: 'Link', url: '/link' },
      { label: 'Action' },
    ]);
    menuFixture.componentRef.setInput('disabled', true);
    menuFixture.detectChanges();
    expect(
      menuFixture.nativeElement.querySelectorAll(
        '[role="menuitem"][tabindex="0"]',
      ).length,
    ).toBe(0);

    const tieredFixture = TestBed.createComponent(TieredMenuComponent);
    tieredFixture.componentRef.setInput('items', [
      { label: 'Link', url: '/link' },
      { label: 'Action', items: [{ label: 'Child' }] },
    ]);
    tieredFixture.componentRef.setInput('disabled', true);
    tieredFixture.detectChanges();
    expect(
      tieredFixture.nativeElement.querySelectorAll(
        '[role="menuitem"][tabindex="0"]',
      ).length,
    ).toBe(0);

    const panelFixture = TestBed.createComponent(PanelMenuComponent);
    panelFixture.componentRef.setInput('items', [
      { label: 'Link', url: '/link' },
      { label: 'Action', items: [{ label: 'Child' }] },
    ]);
    panelFixture.componentRef.setInput('disabled', true);
    panelFixture.detectChanges();
    expect(
      panelFixture.nativeElement.querySelectorAll(
        '[role="treeitem"][tabindex="0"]',
      ).length,
    ).toBe(0);
  });

  it('focuses the first Menu item on show and restores the caller trigger on hide', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open menu';
    document.body.appendChild(trigger);
    trigger.focus();
    const fixture = TestBed.createComponent(MenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'First' },
      { label: 'Second' },
    ]);
    fixture.detectChanges();

    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('First');
    fixture.componentInstance.hide();
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('handles controlled popup visibility once and dismisses outside while preserving trigger toggles', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open popup';
    document.body.appendChild(trigger);
    trigger.focus();
    const fixture = TestBed.createComponent(MenuComponent);
    const shown: void[] = [];
    const hidden: void[] = [];
    fixture.componentRef.setInput('items', [{ label: 'First' }]);
    fixture.componentRef.setInput('popup', true);
    fixture.componentInstance.onShow.subscribe(() => shown.push(undefined));
    fixture.componentInstance.onHide.subscribe(() => hidden.push(undefined));
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();
    expect(shown.length).toBe(1);
    expect(document.activeElement?.textContent).toContain('First');

    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(hidden.length).toBe(1);
    expect(document.activeElement).toBe(trigger);

    trigger.focus();
    fixture.componentInstance.show();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(shown.length).toBe(2);
    trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.componentInstance.toggle();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(hidden.length).toBe(2);

    fixture.componentInstance.show();
    fixture.detectChanges();
    await fixture.whenStable();
    const first = fixture.nativeElement.querySelector(
      '[role="menuitem"]',
    ) as HTMLElement;
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(hidden.length).toBe(3);

    fixture.componentInstance.show();
    fixture.detectChanges();
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    expect(hidden.length).toBe(4);
    trigger.remove();
  });

  it('gives TieredMenu popup visibility the same focus and dismissal lifecycle', async () => {
    const trigger = document.createElement('button');
    const destination = document.createElement('button');
    document.body.append(trigger, destination);
    trigger.focus();
    const fixture = TestBed.createComponent(TieredMenuComponent);
    const shown: void[] = [];
    const hidden: void[] = [];
    fixture.componentRef.setInput('items', [
      { label: 'First' },
      { label: 'Second' },
    ]);
    fixture.componentRef.setInput('popup', true);
    fixture.componentInstance.onShow.subscribe(() => shown.push(undefined));
    fixture.componentInstance.onHide.subscribe(() => hidden.push(undefined));
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(shown.length).toBe(1);
    expect(document.activeElement?.textContent).toContain('First');

    destination.focus();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(document.activeElement).toBe(destination);
    expect(hidden.length).toBe(1);

    trigger.focus();
    fixture.componentInstance.show();
    fixture.detectChanges();
    await fixture.whenStable();
    (
      fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLElement
    ).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(hidden.length).toBe(2);
    expect(document.activeElement).toBe(trigger);

    fixture.componentInstance.show();
    fixture.detectChanges();
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    fixture.detectChanges();
    expect(hidden.length).toBe(3);
    trigger.remove();
    destination.remove();
  });

  it('focuses the first enabled TieredMenu item after the popup host renders', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const fixture = TestBed.createComponent(TieredMenuComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Disabled', disabled: true },
      { label: 'First enabled' },
    ]);
    fixture.componentRef.setInput('popup', true);
    fixture.detectChanges();

    fixture.componentInstance.show();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(document.activeElement?.textContent).toContain('First enabled');
    trigger.remove();
  });

  it('dismisses popup Menu on focus-leave without stealing destination focus', () => {
    const trigger = document.createElement('button');
    const destination = document.createElement('button');
    document.body.append(trigger, destination);
    trigger.focus();
    const fixture = TestBed.createComponent(MenuComponent);
    const hidden: void[] = [];
    fixture.componentRef.setInput('items', [{ label: 'First' }]);
    fixture.componentRef.setInput('popup', true);
    fixture.componentInstance.onHide.subscribe(() => hidden.push(undefined));
    fixture.componentInstance.show();
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLElement
    ).focus();
    destination.focus();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeFalse();
    expect(hidden.length).toBe(1);
    expect(document.activeElement).toBe(destination);
    trigger.remove();
    destination.remove();
  });

  it('captures Menu trigger focus and outside dismissal in the host ownerDocument', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const frameDocument = frame.contentDocument!;
    const trigger = frameDocument.createElement('button');
    const destination = frameDocument.createElement('button');
    trigger.textContent = 'Open framed menu';
    destination.textContent = 'Outside framed menu';
    frameDocument.body.append(trigger, destination);
    trigger.focus();

    const fixture = TestBed.createComponent(MenuComponent);
    try {
      fixture.componentRef.setInput('items', [{ label: 'Framed item' }]);
      fixture.componentRef.setInput('popup', true);
      fixture.detectChanges();
      frameDocument.body.append(fixture.nativeElement as HTMLElement);
      expect((fixture.nativeElement as HTMLElement).ownerDocument).toBe(
        frameDocument,
      );

      fixture.componentInstance.show();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const item = fixture.nativeElement.querySelector(
        '[role="menuitem"]',
      ) as HTMLElement;
      expect(frameDocument.activeElement).toBe(item);

      destination.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.visible()).toBeFalse();
      expect(frameDocument.activeElement).toBe(trigger);
    } finally {
      fixture.destroy();
      frame.remove();
    }
  });

  it('captures TieredMenu trigger focus and outside dismissal in the host ownerDocument', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const frameDocument = frame.contentDocument!;
    const trigger = frameDocument.createElement('button');
    const destination = frameDocument.createElement('button');
    trigger.textContent = 'Open framed tiered menu';
    destination.textContent = 'Outside framed tiered menu';
    frameDocument.body.append(trigger, destination);
    trigger.focus();

    const fixture = TestBed.createComponent(TieredMenuComponent);
    try {
      fixture.componentRef.setInput('items', [{ label: 'Framed item' }]);
      fixture.componentRef.setInput('popup', true);
      fixture.detectChanges();
      frameDocument.body.append(fixture.nativeElement as HTMLElement);
      expect((fixture.nativeElement as HTMLElement).ownerDocument).toBe(
        frameDocument,
      );

      fixture.componentInstance.show();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const item = fixture.nativeElement.querySelector(
        '[role="menuitem"]',
      ) as HTMLElement;
      expect(frameDocument.activeElement).toBe(item);

      destination.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      );
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.visible()).toBeFalse();
      expect(frameDocument.activeElement).toBe(trigger);
    } finally {
      fixture.destroy();
      frame.remove();
    }
  });
});
