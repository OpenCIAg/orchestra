import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectButtonComponent } from '@ciag/orchestra/select-button';
import { ToggleButtonComponent } from '@ciag/orchestra/toggle-button';

/**
 * Behavior-parity pins for the select-button and toggle-button. The specs
 * import the components through the family entry point and
 * must pass unchanged while the family moves to its canonical directory.
 */
describe('SelectButton and ToggleButton behavior parity', () => {
  const OPTIONS = [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
    { label: 'Off', value: 'off', disabled: true },
  ];

  beforeEach(() => TestBed.configureTestingModule({}));

  function createSelect() {
    const fixture = TestBed.createComponent(SelectButtonComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('optionLabel', 'label');
    fixture.componentRef.setInput('optionValue', 'value');
    fixture.detectChanges();
    return fixture;
  }

  function buttons(env: { nativeElement: HTMLElement }): HTMLButtonElement[] {
    return Array.from(
      env.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
  }

  it('renders enabled and disabled options and manages pressed state', () => {
    const fixture = createSelect();
    expect(buttons(fixture).length).toBe(3);
    expect(buttons(fixture)[2].disabled).toBeTrue();

    buttons(fixture)[0].click();
    fixture.detectChanges();
    expect(buttons(fixture)[0].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.componentInstance.isSelected(OPTIONS[0])).toBeTrue();
  });

  it('emits valueChangeEvent, onOptionClick and onChange for a single selection', () => {
    const fixture = createSelect();
    const values: unknown[] = [];
    const clicks: string[] = [];
    const changes: unknown[] = [];
    fixture.componentInstance.valueChangeEvent.subscribe((value) =>
      values.push(value),
    );
    fixture.componentInstance.onOptionClick.subscribe((event) =>
      clicks.push(event.option.value),
    );
    fixture.componentInstance.onChange.subscribe((event) =>
      changes.push(event.value),
    );

    buttons(fixture)[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('two');
    expect(values).toEqual(['two']);
    expect(clicks).toEqual(['two']);
    expect(changes).toEqual(['two']);

    // Selecting the active option clears it (allowEmpty default).
    buttons(fixture)[1].click();
    fixture.detectChanges();
    expect(values).toEqual(['two', null]);
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('supports multiple selection with unselectable and allowEmpty guards', () => {
    const fixture = createSelect();
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('unselectable', false);
    fixture.componentRef.setInput('allowEmpty', false);
    fixture.detectChanges();

    buttons(fixture)[0].click();
    buttons(fixture)[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['one', 'two']);

    // Removing a non-last item works even with allowEmpty=false...
    buttons(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['two']);

    // ...but the last item cannot leave while allowEmpty is false.
    buttons(fixture)[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['two']);

    // unselectable=true also keeps a selected item in place.
    fixture.componentRef.setInput('allowEmpty', true);
    fixture.componentRef.setInput('unselectable', true);
    fixture.detectChanges();
    buttons(fixture)[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual(['two']);
  });

  it('registers through the forms API and marks touched when focus leaves the group', () => {
    @Component({
      imports: [ReactiveFormsModule, SelectButtonComponent],
      template:
        '<orc-select-button [formControl]="control" [options]="options" [optionLabel]="\'label\'" [optionValue]="\'value\'" />',
    })
    class Host {
      readonly control = new FormControl('two');
      readonly options = OPTIONS;
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    expect(buttons(host)[1].getAttribute('aria-pressed')).toBe('true');

    buttons(host)[0].click();
    host.detectChanges();
    expect(host.componentInstance.control.value).toBe('one');

    const group = host.nativeElement.querySelector('[role="group"]');
    group.dispatchEvent(
      new FocusEvent('focusout', { relatedTarget: null, bubbles: true }),
    );
    host.detectChanges();
    expect(host.componentInstance.control.touched).toBeTrue();
  });

  it('blocks selection when the forms API disables the control', () => {
    const fixture = createSelect();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    buttons(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
    expect(buttons(fixture)[0].disabled).toBeTrue();
  });

  it('toggles the toggle-button and honors allowEmpty plus both output names', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    fixture.detectChanges();
    const changes: boolean[] = [];
    const domChanges: { checked: boolean }[] = [];
    fixture.componentInstance.change.subscribe((checked) =>
      changes.push(checked),
    );
    fixture.componentInstance.onChange.subscribe((event) =>
      domChanges.push({ checked: event.checked }),
    );
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBeTrue();
    expect(changes).toEqual([true]);
    expect(domChanges).toEqual([{ checked: true }]);
    expect(button.getAttribute('aria-pressed')).toBe('true');

    // allowEmpty=false keeps the button pressed.
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBeTrue();
    expect(changes).toEqual([true]);

    fixture.componentRef.setInput('allowEmpty', true);
    fixture.detectChanges();
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBeFalse();
    expect(changes).toEqual([true, false]);
  });

  it('registers the toggle-button through the forms API with the disabled handshake', () => {
    @Component({
      imports: [ReactiveFormsModule, ToggleButtonComponent],
      template: '<orc-toggle-button [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl(false);
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    const button = host.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    button.click();
    host.detectChanges();
    expect(host.componentInstance.control.value).toBeTrue();

    host.componentInstance.control.setValue(false);
    host.componentInstance.control.disable();
    host.detectChanges();
    expect(button.disabled).toBeTrue();
  });
});
