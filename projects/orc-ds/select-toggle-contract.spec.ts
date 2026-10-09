import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectButtonComponent } from '@ciag/orchestra/select-button';
import { ToggleButtonComponent } from '@ciag/orchestra/toggle-button';

type Choice = { value: string; label: string; disabled?: boolean };

const choices: Choice[] = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
  { value: 'blocked', label: 'Blocked', disabled: true },
];

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SelectButtonComponent],
  template: `<orc-select-button
      [formControl]="control"
      [options]="options"
      optionLabel="label"
      optionValue="value"
      label="Choices"
    />
    <button #outside type="button">Outside</button>`,
})
class SelectBlurHost {
  readonly options = choices;
  readonly control = new FormControl<string | null>('one', {
    updateOn: 'blur',
  });
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ToggleButtonComponent],
  template: `<orc-toggle-button
      [formControl]="control"
      onLabel="On"
      offLabel="Off"
      ariaLabel="Enabled"
    />
    <button #outside type="button">Outside</button>`,
})
class ToggleBlurHost {
  readonly control = new FormControl(false, { updateOn: 'blur' });
}

describe('SelectButton and ToggleButton DOM/CVA contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectBlurHost, ToggleBlurHost],
    }).compileComponents();
  });

  function createSelect(): {
    fixture: ComponentFixture<SelectButtonComponent<string>>;
    component: SelectButtonComponent<string>;
    buttons: () => HTMLButtonElement[];
  } {
    const fixture = TestBed.createComponent(SelectButtonComponent<string>);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('options', choices);
    fixture.componentRef.setInput('optionLabel', 'label');
    fixture.componentRef.setInput('optionValue', 'value');
    fixture.detectChanges();
    return {
      fixture,
      component,
      buttons: () =>
        Array.from(fixture.nativeElement.querySelectorAll('button')),
    };
  }

  it('renders native button semantics and emits one change per real single selection', () => {
    const { fixture, component, buttons } = createSelect();
    const group = fixture.nativeElement.querySelector('[role="group"]');
    const changed: unknown[] = [];
    const optionClicks: unknown[] = [];
    component.onChange.subscribe((event) => changed.push(event));
    component.onOptionClick.subscribe((event) => optionClicks.push(event));

    expect(group.getAttribute('aria-label')).toBeNull();
    expect(buttons().every((button) => button.type === 'button')).toBeTrue();
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');

    fixture.componentRef.setInput('label', 'Choices');
    fixture.componentRef.setInput('allowEmpty', false);
    fixture.detectChanges();
    expect(group.getAttribute('aria-label')).toBe('Choices');

    buttons()[0].click();
    fixture.detectChanges();
    expect(component.value()).toBe('one');
    expect(changed).toHaveSize(1);
    expect(optionClicks).toHaveSize(1);
    expect(buttons()[0].getAttribute('aria-pressed')).toBe('true');

    // Re-selecting an active option with allowEmpty=false is a no-op.
    buttons()[0].click();
    expect(changed).toHaveSize(1);
    expect(optionClicks).toHaveSize(2);

    buttons()[2].click();
    expect(component.value()).toBe('one');
    expect(changed).toHaveSize(1);
    expect(optionClicks).toHaveSize(2);
  });

  it('supports multiple selection, clear, unselectable and disabled options', () => {
    const { fixture, component, buttons } = createSelect();
    const changes: unknown[] = [];
    const optionClicks: unknown[] = [];
    component.onChange.subscribe((event) => changes.push(event));
    component.onOptionClick.subscribe((event) => optionClicks.push(event));
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    buttons()[0].click();
    buttons()[1].click();
    expect(component.value()).toEqual(['one', 'two']);
    buttons()[0].click();
    expect(component.value()).toEqual(['two']);
    expect(changes).toHaveSize(3);
    expect(optionClicks).toHaveSize(3);

    fixture.componentRef.setInput('unselectable', true);
    fixture.detectChanges();
    buttons()[1].click();
    expect(component.value()).toEqual(['two']);
    expect(changes).toHaveSize(3);
    expect(optionClicks).toHaveSize(4);
    buttons()[2].click();
    expect(changes).toHaveSize(3);
    expect(optionClicks).toHaveSize(4);
  });

  it('keeps multiple selection non-empty when allowEmpty is false', () => {
    const { fixture, component, buttons } = createSelect();
    const changes: unknown[] = [];
    component.onChange.subscribe((event) => changes.push(event));
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('allowEmpty', false);
    fixture.detectChanges();

    buttons()[0].click();
    buttons()[1].click();
    expect(component.value()).toEqual(['one', 'two']);
    expect(changes).toHaveSize(2);

    // A non-final selected item can be removed while the array stays non-empty.
    buttons()[0].click();
    expect(component.value()).toEqual(['two']);
    expect(changes).toHaveSize(3);

    // Removing the final selected item is blocked by allowEmpty=false.
    buttons()[1].click();
    expect(component.value()).toEqual(['two']);
    expect(changes).toHaveSize(3);
  });

  it('holds SelectButton updateOn blur changes until the composite actually blurs', () => {
    const fixture = TestBed.createComponent(SelectBlurHost);
    fixture.detectChanges();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll(
        'orc-select-button button',
      ) as NodeListOf<HTMLButtonElement>,
    );
    const outside = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ).at(-1) as HTMLButtonElement;

    buttons[1].focus();
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('one');
    expect(fixture.componentInstance.control.touched).toBeFalse();

    outside.focus();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('two');
    expect(fixture.componentInstance.control.touched).toBeTrue();
  });

  it('supports ToggleButton allowEmpty, disabled state, pressed state and output cardinality', () => {
    const fixture = TestBed.createComponent(ToggleButtonComponent);
    const component = fixture.componentInstance;
    const changes: boolean[] = [];
    const outputs: boolean[] = [];
    component.change.subscribe((value) => changes.push(value));
    component.onChange.subscribe((event) => outputs.push(event.checked));
    fixture.componentRef.setInput('onLabel', 'On');
    fixture.componentRef.setInput('offLabel', 'Off');
    fixture.componentRef.setInput('size', 'large');
    fixture.componentRef.setInput('fluid', true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;

    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.classList).toContain('orc-toggle-button--large');
    expect(button.classList).toContain('orc-toggle-button--fluid');
    button.click();
    expect(component.checked()).toBeTrue();
    expect(changes).toEqual([true]);
    expect(outputs).toEqual([true]);
    button.click();
    expect(changes).toEqual([true]);

    fixture.componentRef.setInput('allowEmpty', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    button.click();
    expect(component.checked()).toBeTrue();
    expect(changes).toEqual([true]);
    expect(button.disabled).toBeTrue();
  });

  it('holds ToggleButton updateOn blur changes until the native button blurs', () => {
    const fixture = TestBed.createComponent(ToggleBlurHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'orc-toggle-button button',
    ) as HTMLButtonElement;
    const outside = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ).at(-1) as HTMLButtonElement;

    button.focus();
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBeFalse();
    expect(fixture.componentInstance.control.touched).toBeFalse();

    outside.focus();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBeTrue();
    expect(fixture.componentInstance.control.touched).toBeTrue();
  });
});
