import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { MultiSelectComponent } from '@ciag/orchestra/multi-select';
import type { OrcOption } from '@ciag/orchestra/internal';

/**
 * Behavior-parity pins for the multi-select. The specs import the component
 * through the family entry point and must pass unchanged
 * while the family moves to its canonical directory.
 */
describe('MultiSelect behavior parity', () => {
  const OPTIONS: OrcOption<string>[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta', disabled: true },
    { value: 'c', label: 'Gamma' },
  ];

  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(MultiSelectComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    return fixture;
  }

  function openPanel(fixture: ReturnType<typeof create>): HTMLElement[] {
    fixture.componentInstance.toggleOpen();
    fixture.detectChanges();
    // The panel renders detached from the host view; its options live in
    // the document, scoped by the panel's identity.
    return Array.from(
      document.querySelectorAll<HTMLElement>(
        `#${fixture.componentInstance.effectiveId()}-panel li[role="option"]`,
      ),
    ) as HTMLElement[];
  }

  function keyOn(fixture: ReturnType<typeof create>, key: string): void {
    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLElement;
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
  }

  it('renders the trigger, keeps the panel closed until toggled, and reports show/hide', () => {
    const fixture = create();
    const shown: number[] = [];
    const hidden: number[] = [];
    fixture.componentInstance.onPanelShow.subscribe(() => shown.push(1));
    fixture.componentInstance.onPanelHide.subscribe(() => hidden.push(1));

    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
    const trigger = fixture.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();
    expect(shown.length).toBe(1);

    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(hidden.length).toBe(1);
  });

  it('roves the active option over enabled entries with wrap-around and skips disabled ones', () => {
    const fixture = create();
    openPanel(fixture);
    expect(fixture.componentInstance.activeIndex()).toBe(-1);

    keyOn(fixture, 'ArrowDown');
    expect(fixture.componentInstance.activeIndex()).toBe(0);

    keyOn(fixture, 'ArrowDown');
    // Beta is disabled; the roving index jumps past it.
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    keyOn(fixture, 'ArrowDown');
    expect(fixture.componentInstance.activeIndex()).toBe(0);

    keyOn(fixture, 'ArrowUp');
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    keyOn(fixture, 'Home');
    // Home is not handled; the active option stays.
    expect(fixture.componentInstance.activeIndex()).toBe(2);
  });

  it('selects with Enter, emits both option and remove events, and honors the selection limit', () => {
    const fixture = create();
    fixture.componentRef.setInput('selectionLimit', 1);
    const changes: string[][] = [];
    fixture.componentInstance.onChange.subscribe((event) =>
      changes.push(event.value),
    );
    const selected: string[] = [];
    const removed: string[] = [];
    fixture.componentInstance.optionSelected.subscribe((option) =>
      selected.push(option.value),
    );
    fixture.componentInstance.onRemove.subscribe((event) =>
      removed.push(event.value),
    );

    const options = openPanel(fixture);
    keyOn(fixture, 'ArrowDown');
    keyOn(fixture, 'Enter');
    fixture.detectChanges();
    expect(changes).toEqual([['a']]);
    expect(selected).toEqual(['a']);
    expect(options[0].getAttribute('aria-selected')).toBe('true');

    // Gamma would exceed the selection limit and stays out.
    keyOn(fixture, 'ArrowDown');
    keyOn(fixture, 'Enter');
    fixture.detectChanges();
    expect(changes).toEqual([['a']]);

    // Deselecting Alpha emits the compatibility remove event.
    keyOn(fixture, 'ArrowUp');
    keyOn(fixture, 'Enter');
    fixture.detectChanges();
    expect(removed).toEqual(['a']);
    expect(changes).toEqual([['a'], []]);
  });

  it('toggles all selectable options through the toggle-all action', () => {
    const fixture = create();
    const allChanges: { checked: boolean }[] = [];
    fixture.componentInstance.onSelectAllChange.subscribe((event) =>
      allChanges.push({ checked: event.checked }),
    );
    fixture.componentRef.setInput('selectAllLabel', 'Select all');
    fixture.componentRef.setInput('clearAllLabel', 'Clear all');
    openPanel(fixture);
    // The detached panel renders its header actions in the document.
    const panelRoot = document.querySelector(
      '.orc-p2-multi-select-panel',
    ) as HTMLElement;
    const toggleAll = Array.from(panelRoot.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Select all',
    );
    expect(toggleAll).toBeDefined();
    toggleAll!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['a', 'c']);
    expect(allChanges).toEqual([{ checked: true }]);

    const clearAll = Array.from(panelRoot.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Clear all',
    );
    clearAll!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([]);
    expect(allChanges).toEqual([{ checked: true }, { checked: false }]);
  });

  it('filters options, resets the filter when the panel hides, and emits the filter event', () => {
    const fixture = create();
    const filters: string[] = [];
    fixture.componentInstance.onFilter.subscribe((event) =>
      filters.push(event.filter),
    );
    fixture.componentRef.setInput('filter', true);
    openPanel(fixture);

    const filterInput = document.querySelector(
      '.orc-p2-multi-select-panel input',
    ) as HTMLInputElement;
    filterInput.value = 'alp';
    filterInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(filters).toEqual(['alp']);
    expect(fixture.componentInstance.filteredOptions().length).toBe(1);

    fixture.componentInstance.toggleOpen();
    fixture.detectChanges();
    expect(fixture.componentInstance.filterValue()).toBe('');
  });

  it('registers through the forms API and marks touched through the selection flow', () => {
    @Component({
      imports: [ReactiveFormsModule, MultiSelectComponent],
      template:
        '<orc-multi-select [formControl]="control" [options]="options" />',
    })
    class Host {
      readonly control = new FormControl(['a']);
      readonly options = OPTIONS;
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    expect(host.componentInstance.control.value).toEqual(['a']);

    host.componentInstance.control.setValue(['c']);
    host.detectChanges();
    // Open the panel through the trigger button and add Alpha on top of Gamma.
    const trigger = host.nativeElement.querySelector(
      'button[role="combobox"]',
    ) as HTMLElement;
    trigger.click();
    host.detectChanges();
    const options = Array.from(
      document.querySelectorAll(
        '.orc-p2-multi-select-panel li[role="option"]',
      ) as NodeListOf<HTMLElement>,
    );
    const alpha = options.find(
      (option) => option.textContent?.trim() === 'Alpha',
    ) as HTMLElement;
    alpha.click();
    host.detectChanges();
    expect(host.componentInstance.control.value).toEqual(['c', 'a']);
    expect(host.componentInstance.control.touched).toBeTrue();
  });

  it('clears the selection through the clear action when enabled', () => {
    const fixture = create();
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('clearAriaLabel', 'Clear selection');
    const cleared: number[] = [];
    fixture.componentInstance.onClear.subscribe(() => cleared.push(1));
    fixture.componentInstance.writeValue(['a']);
    fixture.detectChanges();

    const clear = fixture.nativeElement.querySelector(
      'button[aria-label="Clear selection"]',
    ) as HTMLButtonElement;
    expect(clear).not.toBeNull();
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual([]);
    expect(cleared.length).toBe(1);
  });

  it('dismisses the open panel with Escape', () => {
    const fixture = create();
    openPanel(fixture);
    keyOn(fixture, 'Escape');
    expect(fixture.componentInstance.open()).toBeFalse();
  });
});
