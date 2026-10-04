import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { RadioGroupComponent } from './radio/radio-group.component';
import { SwitchComponent } from './switch/switch.component';
import { RatingComponent } from './rating/rating.component';
import { OtpInputComponent } from './otp-input/otp-input.component';
import { FormFieldComponent } from './form-field/form-field.component';

@Component({
  standalone: true,
  imports: [CheckboxComponent],
  template: `<orc-checkbox inputId="terms" label="Terms" />`,
})
class CheckboxHost {}

describe('Control accessibility and CVA repairs', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        CheckboxComponent,
        RadioGroupComponent,
        SwitchComponent,
        RatingComponent,
        OtpInputComponent,
        FormFieldComponent,
        CheckboxHost,
      ],
    }).compileComponents();
  });

  it('syncs native indeterminate state and custom input label association', () => {
    const fixture = TestBed.createComponent(CheckboxHost);
    fixture.detectChanges();
    const component = fixture.debugElement.children[0]
      .componentInstance as CheckboxComponent;
    component.indeterminate.set(true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.indeterminate).toBeTrue();
    expect(
      fixture.nativeElement.querySelector('label').getAttribute('for'),
    ).toBe('terms');
  });

  it('treats a radio group error message as invalid', () => {
    const fixture: ComponentFixture<RadioGroupComponent> =
      TestBed.createComponent(RadioGroupComponent);
    fixture.componentRef.setInput('errorMessage', 'Required');
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('[role="radiogroup"]')
        .getAttribute('aria-invalid'),
    ).toBe('true');
  });

  it('exposes required switch semantics and custom CVA values', () => {
    const fixture: ComponentFixture<SwitchComponent> =
      TestBed.createComponent(SwitchComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('trueValue', 'yes');
    fixture.componentRef.setInput('falseValue', 'no');
    fixture.componentRef.setInput('required', true);
    let value: unknown;
    component.registerOnChange((next) => (value = next));
    fixture.detectChanges();
    (
      fixture.nativeElement.querySelector('button') as HTMLButtonElement
    ).click();
    expect(value).toBe('yes');
    expect(
      fixture.nativeElement
        .querySelector('[role="switch"]')
        .getAttribute('aria-required'),
    ).toBe('true');
  });

  it('keeps a readonly switch focusable while preventing activation', () => {
    const fixture: ComponentFixture<SwitchComponent> =
      TestBed.createComponent(SwitchComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('readonly', true);
    component.writeValue(false);
    const changed = jasmine.createSpy('changed');
    const emitted = jasmine.createSpy('emitted');
    component.registerOnChange(changed);
    component.onChange.subscribe(emitted);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.disabled).toBeFalse();
    expect(button.getAttribute('aria-readonly')).toBe('true');
    button.focus();
    expect(document.activeElement).toBe(button);

    button.click();
    component.toggle();
    fixture.detectChanges();
    expect(component.checked()).toBeFalse();
    expect(changed).not.toHaveBeenCalled();
    expect(emitted).not.toHaveBeenCalled();
  });

  it('falls back from whitespace-only naming overrides to its visible label', () => {
    const fixture: ComponentFixture<SwitchComponent> =
      TestBed.createComponent(SwitchComponent);
    fixture.componentRef.setInput('label', 'Live state');
    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.componentRef.setInput('ariaLabelledby', '  ');
    fixture.componentRef.setInput('ariaLabelledBy', ' ');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      '[role="switch"]',
    ) as HTMLButtonElement;
    expect(button.hasAttribute('aria-label')).toBeFalse();
    expect(button.getAttribute('aria-labelledby')).toBe(
      `${fixture.componentInstance.effectiveId()}-label`,
    );
    expect(
      fixture.nativeElement
        .querySelector('span.orc-switch__label')
        ?.textContent?.trim(),
    ).toBe('Live state');
  });

  it('clamps CVA ratings and treats Home as the minimum', () => {
    const fixture: ComponentFixture<RatingComponent> =
      TestBed.createComponent(RatingComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('max', 5);
    component.writeValue(99);
    expect(component.value()).toBe(5);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(component.value()).toBe(0);
  });

  it('renders named OTP slots and clamps an invalid length', () => {
    const fixture: ComponentFixture<OtpInputComponent> =
      TestBed.createComponent(OtpInputComponent);
    fixture.componentRef.setInput('length', 0);
    fixture.detectChanges();
    expect(componentLength(fixture)).toBe(1);
    const container = fixture.nativeElement.querySelector(
      '.otp-container',
    ) as HTMLElement;
    expect(container.getAttribute('role')).toBe('group');
    expect(container.getAttribute('aria-label')).toBe('One-time password');
    expect(
      fixture.nativeElement.querySelector('input').getAttribute('aria-label'),
    ).toBe('OTP digit 1');
    expect(
      fixture.nativeElement
        .querySelector('orc-otp-separator .otp-separator')
        .getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('pastes numeric codes across named OTP slots and announces the complete value', () => {
    const fixture: ComponentFixture<OtpInputComponent> =
      TestBed.createComponent(OtpInputComponent);
    fixture.componentRef.setInput('length', 4);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const groups = fixture.nativeElement.querySelectorAll('orc-otp-group');
    expect(groups.length).toBe(2);
    expect(groups[0].querySelectorAll('orc-otp-slot').length).toBe(2);
    expect(groups[1].querySelectorAll('orc-otp-slot').length).toBe(2);
    const changed = jasmine.createSpy('changed');
    const completed = jasmine.createSpy('completed');
    component.registerOnChange(changed);
    component.completed.subscribe(completed);
    const first = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const clipboardData = { getData: () => '1a23 4' };
    const event = new Event('paste', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;
    Object.defineProperty(event, 'clipboardData', { value: clipboardData });
    first.dispatchEvent(event);
    fixture.detectChanges();
    expect(event.defaultPrevented).toBeTrue();
    expect(component.value()).toBe('1234');
    expect(changed).toHaveBeenCalledOnceWith('1234');
    expect(completed).toHaveBeenCalledOnceWith('1234');
    expect(
      (
        Array.from(
          fixture.nativeElement.querySelectorAll('input'),
        ) as HTMLInputElement[]
      ).map((input) => input.value),
    ).toEqual(['1', '2', '3', '4']);
  });

  it('does not treat the string false as required in a form field', () => {
    const fixture: ComponentFixture<FormFieldComponent> =
      TestBed.createComponent(FormFieldComponent);
    fixture.componentRef.setInput('required', 'false');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('*');
  });
});

function componentLength(fixture: ComponentFixture<OtpInputComponent>): number {
  return fixture.nativeElement.querySelectorAll('input').length;
}
