import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { ComboboxComponent } from '@ciag/orchestra/p2';
import type { P2Option } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the combobox. The specs import the component
 * through the public `@ciag/orchestra/p2` surface and must pass unchanged
 * while the family moves to its canonical directory.
 */
describe('Combobox behavior parity', () => {
  const OPTIONS: P2Option<string>[] = [
    { value: 'sp', label: 'São Paulo' },
    { value: 'blocked', label: 'Blocked city', disabled: true },
    { value: 'rj', label: 'Rio de Janeiro' },
  ];

  beforeEach(() => TestBed.configureTestingModule({}));

  function create(options: P2Option<string>[] = OPTIONS) {
    const fixture = TestBed.createComponent(ComboboxComponent<string>);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('clearAriaLabel', 'Clear city');
    fixture.detectChanges();
    return fixture;
  }

  function inputValue(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function key(input: HTMLInputElement, name: string): void {
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: name,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  it('renders enabled and disabled options and hides the panel while closed', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    // The panel renders detached from the host view; it is located in the
    // document by the listbox id the input points at.
    const options = Array.from(
      document
        .getElementById(fixture.componentInstance.listId)!
        .querySelectorAll('li[role="option"]') as NodeListOf<HTMLElement>,
    );
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'São Paulo',
      'Blocked city',
      'Rio de Janeiro',
    ]);
    expect(options[1].getAttribute('aria-disabled')).toBe('true');
    expect(options[1].className).toContain('is-disabled');
  });

  it('registers through the forms API, reflects the model into the query, and marks touched on blur', () => {
    @Component({
      imports: [ReactiveFormsModule, ComboboxComponent],
      template: '<orc-combobox [formControl]="control" [options]="options" />',
    })
    class Host {
      readonly control = new FormControl('rj');
      readonly options = OPTIONS;
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();

    const input = host.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Rio de Janeiro');

    host.componentInstance.control.setValue('sp');
    host.detectChanges();
    expect(input.value).toBe('São Paulo');

    input.dispatchEvent(new Event('focus'));
    host.detectChanges();
    input.dispatchEvent(new Event('blur'));
    host.detectChanges();
    expect(host.componentInstance.control.touched).toBeTrue();
  });

  it('types to open the panel and emits a null model change while the query is unresolved', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('rj');
    fixture.detectChanges();
    const changes: (string | null)[] = [];
    fixture.componentInstance.value.subscribe((value) => changes.push(value));
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    inputValue(input, 'Rio');
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();
    expect(changes).toEqual([null]);
  });

  it('roves the active option with arrows over enabled entries, clamps at the edges, and selects with Enter', () => {
    const fixture = create();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const selected: string[] = [];
    fixture.componentInstance.optionSelected.subscribe((option) =>
      selected.push(option.value),
    );

    inputValue(input, '');
    expect(fixture.componentInstance.activeIndex()).toBe(0);

    key(input, 'ArrowDown');
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    // Clamped at the last enabled entry; no wrap-around.
    key(input, 'ArrowDown');
    expect(fixture.componentInstance.activeIndex()).toBe(2);

    key(input, 'ArrowUp');
    expect(fixture.componentInstance.activeIndex()).toBe(0);

    key(input, 'ArrowUp');
    expect(fixture.componentInstance.activeIndex()).toBe(0);

    key(input, 'Enter');
    fixture.detectChanges();
    expect(selected).toEqual(['sp']);
    expect(fixture.componentInstance.open()).toBeFalse();
    expect(input.value).toBe('São Paulo');
  });

  it('dismisses with Escape only while open', () => {
    const fixture = create();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    key(input, 'Escape');
    expect(fixture.componentInstance.open()).toBeFalse();

    inputValue(input, 'Rio');
    key(input, 'Escape');
    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('selects by click, keeps aria-activedescendant aligned, and clears through the clear action', () => {
    const fixture = create();
    const changes: (string | null)[] = [];
    fixture.componentInstance.value.subscribe((value) => changes.push(value));
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    // The panel renders detached from the host view; it is located in the
    // document by the listbox id the input points at.
    const options = Array.from(
      document
        .getElementById(fixture.componentInstance.listId)!
        .querySelectorAll('li[role="option"]') as NodeListOf<HTMLElement>,
    ) as HTMLElement[];
    (options[2] as HTMLElement).click();
    fixture.detectChanges();
    expect(changes).toEqual(['rj']);
    expect(fixture.componentInstance.open()).toBeFalse();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.getAttribute('aria-controls')).toBe(
      fixture.componentInstance.listId,
    );
    const clear = fixture.nativeElement.querySelector(
      'button[aria-label="Clear city"]',
    ) as HTMLButtonElement;
    expect(clear).not.toBeNull();
    clear.click();
    fixture.detectChanges();
    expect(changes).toEqual(['rj', null]);
    expect(input.value).toBe('');
  });

  it('does not emit a second change when the same option is reselected', () => {
    const fixture = create();
    const changes: (string | null)[] = [];
    fixture.componentInstance.value.subscribe((value) => changes.push(value));
    const emitted: string[] = [];
    fixture.componentInstance.optionSelected.subscribe((option) =>
      emitted.push(option.value),
    );
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    // The panel renders detached from the host view; it is located in the
    // document by the listbox id the input points at.
    const options = Array.from(
      document
        .getElementById(fixture.componentInstance.listId)!
        .querySelectorAll('li[role="option"]') as NodeListOf<HTMLElement>,
    ) as HTMLElement[];
    options[0].click();
    options[0].click();
    fixture.detectChanges();
    expect(changes).toEqual(['sp']);
    // optionSelected still reports the interaction for both clicks.
    expect(emitted).toEqual(['sp', 'sp']);
  });
});
