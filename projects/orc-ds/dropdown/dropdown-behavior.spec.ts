import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';

describe('Dropdown browser lifecycle', () => {
  function createFormFixture(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(DropdownComponent);
    if (!Object.hasOwn(inputs, 'options')) {
      fixture.componentRef.setInput('options', []);
    }
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return {
      fixture,
      component: fixture.componentInstance,
      root: fixture.nativeElement as HTMLElement,
    };
  }

  function setup(filter = true) {
    const fixture = TestBed.createComponent(DropdownComponent);
    fixture.componentRef.setInput('options', [
      { label: 'Disabled', value: 0, disabled: true },
      { label: 'Alpha', value: 1 },
      { label: 'Beta', value: 2 },
    ]);
    fixture.componentRef.setInput('label', 'Choose');
    fixture.componentRef.setInput('filter', filter);
    fixture.detectChanges();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.orc-dropdown-trigger',
    );
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    tick();
    return { fixture, trigger, component: fixture.componentInstance };
  }

  function panelFor(component: DropdownComponent): HTMLElement | null {
    return document.getElementById(`${component.effectiveId()}-panel`);
  }

  it('keeps detached filter interactions open, filters and restores focus after selection', fakeAsync(() => {
    const { fixture, trigger, component } = setup();
    const panel = panelFor(component)!;
    const filter = panel.querySelector<HTMLInputElement>('.p-select-filter')!;
    expect(document.activeElement).toBe(filter);
    filter.click();
    expect(component.isOpen()).toBeTrue();
    filter.value = 'Beta';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const options =
      panel.querySelectorAll<HTMLButtonElement>('[role="option"]');
    expect(options.length).toBe(1);
    options[0].click();
    fixture.detectChanges();
    expect(component.value()).toBe(2);
    expect(component.isOpen()).toBeFalse();
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  }));

  it('dismisses capture-phase outside interactions even when bubbling is stopped', fakeAsync(() => {
    const { fixture, component } = setup();
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.addEventListener('click', (event) => event.stopPropagation());
    outside.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
    expect(panelFor(component)).toBeNull();
    outside.remove();
    fixture.destroy();
  }));

  it('supports keyboard opening, disabled-option navigation and Escape return', fakeAsync(() => {
    const { fixture, trigger, component } = setup(false);
    let active = document.activeElement as HTMLButtonElement;
    expect(active.textContent?.trim()).toBe('Alpha');
    active.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    active = document.activeElement as HTMLButtonElement;
    expect(active.textContent?.trim()).toBe('Beta');
    active.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
    expect(document.activeElement).toBe(trigger);
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    tick();
    expect(component.isOpen()).toBeTrue();
    fixture.destroy();
  }));

  it('uses a separate clear button and ignores disabled mutations', fakeAsync(() => {
    const { fixture, component } = setup();
    component.close();
    component.writeValue(1);
    fixture.componentRef.setInput('showClear', true);
    fixture.detectChanges();
    const clear: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.orc-dropdown-clear',
    );
    expect(clear.parentElement?.tagName).not.toBe('BUTTON');
    const changed = jasmine.createSpy('changed');
    component.registerOnChange(changed);
    clear.click();
    expect(component.value()).toBeNull();
    expect(changed).toHaveBeenCalledOnceWith(null);
    component.writeValue(1);
    component.setDisabledState(true);
    component.clearValue(new Event('click'));
    component.selectOption({ label: 'Beta', value: 2 }, new Event('click'));
    expect(component.value()).toBe(1);
    fixture.destroy();
  }));

  it('closes on external disabling and disposes the portal on destruction', fakeAsync(() => {
    const { fixture, component } = setup();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    fixture.destroy();
    tick();
    expect(panelFor(component)).toBeNull();
  }));

  it('keeps items with deprecated children actionable while rendering a flat menu', fakeAsync(() => {
    const fixture = TestBed.createComponent(DropdownComponent);
    const parentAction = jasmine.createSpy('parentAction');
    const parentItem = {
      label: 'More actions',
      action: parentAction,
      children: [{ label: 'Nested action', action: jasmine.createSpy() }],
    };
    const itemSelect = jasmine.createSpy('itemSelect');
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [parentItem]);
    fixture.detectChanges();
    component.itemSelect.subscribe(itemSelect);

    component.open();
    fixture.detectChanges();
    tick();

    const menu = panelFor(component)!;
    expect(menu.getAttribute('aria-label')).toBe('Actions');
    expect(menu.querySelectorAll('[role="menuitem"]').length).toBe(1);
    expect(menu.textContent).toContain('More actions');
    expect(menu.textContent).not.toContain('Nested action');

    menu.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click();
    fixture.detectChanges();

    expect(itemSelect).toHaveBeenCalledOnceWith(parentItem);
    expect(parentAction).toHaveBeenCalledTimes(1);
    expect(component.isOpen()).toBeFalse();
    fixture.destroy();
  }));

  it('maps form options, accessible labels, ids, and styles through selection', fakeAsync(() => {
    const options = [
      { key: 'alpha', title: { text: 'Alpha' }, blocked: false },
      { key: 'beta', title: { text: 'Beta' }, blocked: true },
    ];
    const { fixture, component, root } = createFormFixture({
      options,
      label: 'Region',
      placeholder: 'Choose a region',
      optionLabel: 'title.text',
      optionValue: 'key',
      optionDisabled: 'blocked',
      inputId: 'region-select',
      styleClass: 'custom-region-select',
      style: { minWidth: '18rem' },
      optionsAriaLabel: 'Available regions',
    });

    const field = root.querySelector<HTMLElement>('.orc-dropdown-field')!;
    const label = field.querySelector<HTMLLabelElement>('label')!;
    const trigger = field.querySelector<HTMLButtonElement>(
      '.orc-dropdown-trigger',
    )!;
    expect(field.classList).toContain('custom-region-select');
    expect(field.style.minWidth).toBe('18rem');
    expect(label.htmlFor).toBe('region-select');
    expect(trigger.id).toBe('region-select');
    expect(trigger.textContent).toContain('Choose a region');

    component.writeValue('alpha');
    fixture.detectChanges();
    expect(component.selectedLabel()).toBe('Alpha');
    expect(trigger.textContent).toContain('Alpha');
    component.writeValue(null);
    fixture.detectChanges();

    component.open();
    fixture.detectChanges();
    tick();
    const listbox =
      panelFor(component)!.querySelector<HTMLElement>('[role="listbox"]')!;
    const optionsInDom = Array.from(
      listbox.querySelectorAll<HTMLButtonElement>('[role="option"]'),
    );
    expect(listbox.getAttribute('aria-label')).toBe('Available regions');
    expect(optionsInDom.map((option) => option.textContent?.trim())).toEqual([
      'Alpha',
      'Beta',
    ]);
    expect(optionsInDom[1].disabled).toBeTrue();

    const changes: unknown[] = [];
    const modelChanges: unknown[] = [];
    const publicChanges: Array<{ originalEvent: Event; value: unknown }> = [];
    component.registerOnChange((value) => changes.push(value));
    component.value.subscribe((value) => modelChanges.push(value));
    component.onChange.subscribe((event) => publicChanges.push(event));
    const selectionEvent = new MouseEvent('click');
    optionsInDom[0].dispatchEvent(selectionEvent);
    fixture.detectChanges();

    expect(component.value()).toBe('alpha');
    expect(changes).toEqual(['alpha']);
    expect(modelChanges).toEqual(['alpha']);
    expect(publicChanges).toEqual([
      { originalEvent: selectionEvent, value: 'alpha' },
    ]);
    expect(component.isOpen()).toBeFalse();
    fixture.destroy();
  }));

  it('uses optionDisabled callbacks and prevents loading or disabled mutations', fakeAsync(() => {
    const options = [
      { label: 'Allowed', value: 'allowed' },
      { label: 'Policy blocked', value: 'blocked' },
    ];
    const blocked = jasmine
      .createSpy('optionDisabled')
      .and.callFake(
        (option: unknown) => (option as { value: string }).value === 'blocked',
      );
    const { fixture, component, root } = createFormFixture({
      options,
      optionDisabled: blocked,
      showClear: true,
    });
    const changes: unknown[] = [];
    component.registerOnChange((value) => changes.push(value));

    component.open();
    fixture.detectChanges();
    tick();
    const listbox =
      panelFor(component)!.querySelector<HTMLElement>('[role="listbox"]')!;
    const renderedOptions = Array.from(
      listbox.querySelectorAll<HTMLButtonElement>('[role="option"]'),
    );
    expect(renderedOptions.map((option) => option.disabled)).toEqual([
      false,
      true,
    ]);
    expect(blocked).toHaveBeenCalledWith(options[1]);

    component.selectOption(options[1], new MouseEvent('click'));
    expect(component.value()).toBeNull();
    expect(changes).toEqual([]);

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(
      Array.from(
        listbox.querySelectorAll<HTMLButtonElement>('[role="option"]'),
      ).every((option) => option.disabled),
    ).toBeTrue();
    component.selectOption(options[0], new MouseEvent('click'));
    expect(component.value()).toBeNull();
    expect(changes).toEqual([]);
    component.writeValue('allowed');
    fixture.detectChanges();
    const clear = root.querySelector<HTMLButtonElement>('.orc-dropdown-clear')!;
    expect(clear.disabled).toBeTrue();
    component.clearValue(new MouseEvent('click'));
    expect(component.value()).toBe('allowed');
    expect(changes).toEqual([]);

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(
      root.querySelector<HTMLButtonElement>('.orc-dropdown-trigger')!.disabled,
    ).toBeTrue();
    component.open();
    expect(component.isOpen()).toBeFalse();
    component.selectOption(options[0], new MouseEvent('click'));
    component.clearValue(new MouseEvent('click'));
    expect(component.value()).toBe('allowed');
    expect(changes).toEqual([]);
    component.writeValue(null);
    fixture.destroy();
  }));

  it('renders filter, loading, empty-state, and scroll inputs in the options popup', fakeAsync(() => {
    const options = [
      { label: 'Alpha', metadata: { group: 'system' } },
      { label: 'Beta', metadata: { group: 'community' } },
    ];
    const { fixture, component } = createFormFixture({
      options,
      label: 'Packages',
      filter: true,
      filterBy: 'label, metadata.group',
      filterPlaceholder: 'Search packages',
      filterAriaLabel: 'Filter package choices',
      optionsAriaLabel: 'Package choices',
      emptyMessage: 'No package matches.',
      loadingMessage: 'Loading package choices.',
      scrollHeight: '96px',
    });
    const filterChanges: string[] = [];
    component.filterChange.subscribe((value) => filterChanges.push(value));
    component.open();
    fixture.detectChanges();
    tick();

    const panel = panelFor(component)!;
    const filter = panel.querySelector<HTMLInputElement>('.p-select-filter')!;
    const listbox = panel.querySelector<HTMLElement>('[role="listbox"]')!;
    expect(panel.style.maxHeight).toBe('96px');
    expect(filter.placeholder).toBe('Search packages');
    expect(filter.getAttribute('aria-label')).toBe('Filter package choices');
    expect(listbox.getAttribute('aria-label')).toBe('Package choices');

    filter.value = 'system';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(filterChanges).toEqual(['system']);
    expect(
      Array.from(listbox.querySelectorAll('[role="option"]')).map((option) =>
        option.textContent?.trim(),
      ),
    ).toEqual(['Alpha']);

    filter.value = 'missing';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(panel.textContent).toContain('No package matches.');

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(listbox.getAttribute('aria-busy')).toBe('true');
    expect(panel.textContent).toContain('Loading package choices.');
    expect(panel.textContent).not.toContain('No package matches.');
    fixture.destroy();
  }));

  it('honors filter reset policy and the visible model for open/close transitions', fakeAsync(() => {
    const { fixture, component } = createFormFixture({
      options: [{ label: 'Alpha' }, { label: 'Beta' }],
      filter: true,
      resetFilterOnHide: false,
    });
    const shown: void[] = [];
    const hidden: void[] = [];
    const visibleChanges: boolean[] = [];
    component.onShow.subscribe((event) => shown.push(event));
    component.onHide.subscribe((event) => hidden.push(event));
    component.visible.subscribe((visible) => visibleChanges.push(visible));

    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    tick();
    expect(component.isOpen()).toBeTrue();
    expect(shown).toHaveSize(1);
    expect(visibleChanges).toEqual([]);

    const panel = panelFor(component)!;
    const filter = panel.querySelector<HTMLInputElement>('.p-select-filter')!;
    filter.value = 'Beta';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    component.close();
    fixture.detectChanges();
    expect(component.filterValue()).toBe('Beta');
    expect(component.visible()).toBeFalse();
    expect(visibleChanges).toEqual([false]);
    expect(hidden).toHaveSize(1);

    component.open();
    fixture.detectChanges();
    tick();
    expect(component.isOpen()).toBeTrue();
    expect(
      panelFor(component)?.querySelector<HTMLInputElement>('.p-select-filter')
        ?.value,
    ).toBe('Beta');
    component.close();
    expect(hidden).toHaveSize(2);
    fixture.destroy();
  }));

  it('resets the filter by default and exposes focus, blur, clear, and CVA outcomes', fakeAsync(() => {
    const { fixture, component, root } = createFormFixture({
      options: [{ label: 'Alpha', value: 'alpha' }],
      label: 'Package',
      filter: true,
      showClear: true,
      clearAriaLabel: 'Clear package',
      value: 'alpha',
    });
    const filterChanges: string[] = [];
    const focusEvents: FocusEvent[] = [];
    const blurEvents: FocusEvent[] = [];
    const clearEvents: Event[] = [];
    const cvaChanges: unknown[] = [];
    const touched = jasmine.createSpy('touched');
    component.filterChange.subscribe((value) => filterChanges.push(value));
    component.onFocus.subscribe((event) => focusEvents.push(event));
    component.onBlur.subscribe((event) => blurEvents.push(event));
    component.onClear.subscribe((event) => clearEvents.push(event));
    component.registerOnChange((value) => cvaChanges.push(value));
    component.registerOnTouched(touched);

    const trigger = root.querySelector<HTMLButtonElement>(
      '.orc-dropdown-trigger',
    )!;
    const focusEvent = new FocusEvent('focus');
    const blurEvent = new FocusEvent('blur');
    trigger.dispatchEvent(focusEvent);
    trigger.dispatchEvent(blurEvent);
    expect(focusEvents).toEqual([focusEvent]);
    expect(blurEvents).toEqual([blurEvent]);
    expect(touched).toHaveBeenCalledTimes(1);

    component.open();
    fixture.detectChanges();
    tick();
    const panel = panelFor(component)!;
    const filter = panel.querySelector<HTMLInputElement>('.p-select-filter')!;
    filter.value = 'Al';
    filter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(filterChanges).toEqual(['Al']);
    component.close();
    expect(component.filterValue()).toBe('');

    const clear = root.querySelector<HTMLButtonElement>('.orc-dropdown-clear')!;
    expect(clear.getAttribute('aria-label')).toBe('Clear package');
    const clearEvent = new MouseEvent('click');
    clear.dispatchEvent(clearEvent);
    fixture.detectChanges();
    expect(component.value()).toBeNull();
    expect(cvaChanges).toEqual([null]);
    expect(clearEvents).toEqual([clearEvent]);
    expect(touched).toHaveBeenCalledTimes(3);
    fixture.destroy();
  }));

  it('positions the overlay at all four supported edges of its anchor', fakeAsync(() => {
    const cases = [
      { placement: 'bottom-start', vertical: 'bottom', horizontal: 'start' },
      { placement: 'bottom-end', vertical: 'bottom', horizontal: 'end' },
      { placement: 'top-start', vertical: 'top', horizontal: 'start' },
      { placement: 'top-end', vertical: 'top', horizontal: 'end' },
    ] as const;

    for (const testCase of cases) {
      const { fixture, component } = createFormFixture({
        options: [{ label: 'Alpha' }],
        placement: testCase.placement,
      });
      const host = fixture.nativeElement as HTMLElement;
      host.style.position = 'fixed';
      host.style.left = '120px';
      host.style.top = '240px';
      host.style.width = '240px';
      fixture.detectChanges();
      const anchor = host.getBoundingClientRect();

      component.open();
      fixture.detectChanges();
      tick();
      const panel = panelFor(component)!;
      const bounds = panel.getBoundingClientRect();
      if (testCase.vertical === 'bottom') {
        expect(bounds.top).toBeGreaterThanOrEqual(anchor.bottom - 1);
      } else {
        expect(bounds.bottom).toBeLessThanOrEqual(anchor.top + 1);
      }
      if (testCase.horizontal === 'start') {
        expect(Math.abs(bounds.left - anchor.left)).toBeLessThan(1);
      } else {
        expect(Math.abs(bounds.right - anchor.right)).toBeLessThan(1);
      }
      fixture.destroy();
      tick();
    }
  }));

  it('renders flat menu item presentation and honors disabled actions', fakeAsync(() => {
    const action = jasmine.createSpy('action');
    const items = [
      {
        id: 'copy',
        label: 'Copy link',
        icon: '<span>copy icon</span>',
        shortcut: '⌘C',
        danger: true,
        action,
      },
      { id: 'divider', label: '', divider: true },
      { id: 'disabled', label: 'Unavailable', disabled: true },
    ];
    const fixture = TestBed.createComponent(DropdownComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('label', 'File actions');
    fixture.detectChanges();
    const selected: unknown[] = [];
    component.itemSelect.subscribe((item) => selected.push(item));

    component.open();
    fixture.detectChanges();
    tick();
    const panel = panelFor(component)!;
    expect(panel.getAttribute('aria-label')).toBe('File actions');
    const menuItems = Array.from(
      panel.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    );
    expect(menuItems).toHaveSize(2);
    expect(panel.querySelector('[role="separator"]')).not.toBeNull();
    expect(menuItems[0].classList).toContain('orc-dropdown-item--danger');
    expect(
      menuItems[0].querySelector('.orc-dropdown-item__icon')?.textContent,
    ).toContain('copy icon');
    expect(
      menuItems[0].querySelector('.orc-dropdown-item__shortcut')?.textContent,
    ).toContain('⌘C');
    expect(menuItems[1].disabled).toBeTrue();

    menuItems[1].click();
    expect(action).not.toHaveBeenCalled();
    expect(selected).toEqual([]);
    menuItems[0].click();
    fixture.detectChanges();
    expect(action).toHaveBeenCalledTimes(1);
    expect(selected).toEqual([items[0]]);
    expect(component.isOpen()).toBeFalse();
    fixture.destroy();
  }));
});
