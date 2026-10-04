import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe, toHaveNoViolations } from 'jasmine-axe';
import { FormComponent } from './form/form.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { InputComponent } from './input/input.component';

@Component({
  standalone: true,
  imports: [FormComponent],
  template: `<orc-form
    [novalidate]="novalidate"
    [disabled]="disabled"
    [ariaLabel]="ariaLabel"
    (formSubmit)="onSubmit($event)"
    (formReset)="onReset()"
  >
    <input name="email" value="initial" required />
    <button class="submit" type="submit">Save</button>
    <button class="skip-validation" type="submit" formnovalidate>
      Save draft
    </button>
  </orc-form>`,
})
class FormHost {
  novalidate = true;
  disabled = false;
  ariaLabel: string | undefined = 'Formulário';
  resetCount = 0;
  submitEvents: Array<{ event: SubmitEvent; valid: boolean }> = [];

  onReset(): void {
    this.resetCount += 1;
  }

  onSubmit(value: { event: SubmitEvent; valid: boolean }): void {
    this.submitEvents.push(value);
  }
}

@Component({
  standalone: true,
  imports: [FormFieldComponent],
  template: `<orc-form-field
    id="contact-details"
    [label]="label"
    [helperText]="helperText"
    [error]="error"
    [required]="required"
  >
    <label for="projected-email">Email</label>
    <input id="projected-email" />
  </orc-form-field>`,
})
class FormFieldHost {
  label = 'Contact details';
  helperText = 'Use your work address';
  error = '';
  required = true;
}

@Component({
  standalone: true,
  imports: [FormFieldComponent],
  template: `
    <orc-form-field label="Delivery method" helperText="Choose one option">
      <label for="delivery-email">Email</label>
      <input id="delivery-email" type="radio" name="delivery" />
      <label for="delivery-post">Post</label>
      <input id="delivery-post" type="radio" name="delivery" />
    </orc-form-field>
    <orc-form-field label="Billing method" helperText="Choose a billing option">
      <label for="billing-card">Card</label>
      <input id="billing-card" type="radio" name="billing" />
      <label for="billing-invoice">Invoice</label>
      <input id="billing-invoice" type="radio" name="billing" />
    </orc-form-field>
  `,
})
class FormFieldGroupsHost {}

@Component({
  standalone: true,
  imports: [FormFieldComponent, InputComponent],
  template: `<orc-form-field
    label="Project name"
    error="A project name is required"
  >
    <orc-input ariaLabel="Project name" />
  </orc-form-field>`,
})
class FormFieldLibraryControlHost {}

describe('Form and FormField contracts', () => {
  beforeEach(async () => {
    jasmine.addMatchers(toHaveNoViolations);
    await TestBed.configureTestingModule({
      imports: [
        FormHost,
        FormFieldHost,
        FormFieldGroupsHost,
        FormFieldLibraryControlHost,
      ],
    }).compileComponents();
  });

  function createFormFixture(): ComponentFixture<FormHost> {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    return fixture;
  }

  function getForm(fixture: ComponentFixture<FormHost>): HTMLFormElement {
    return fixture.nativeElement.querySelector('form') as HTMLFormElement;
  }

  function getFormComponent(
    fixture: ComponentFixture<FormHost>,
  ): FormComponent {
    return fixture.debugElement.children[0].componentInstance as FormComponent;
  }

  it('emits one reset event for the public reset method and restores native values', () => {
    const fixture = createFormFixture();
    const form = getForm(fixture);
    const input = form.querySelector('input') as HTMLInputElement;

    input.value = 'changed';
    getFormComponent(fixture).reset();
    fixture.detectChanges();

    expect(input.value).toBe('initial');
    expect(fixture.componentInstance.resetCount).toBe(1);
  });

  it('emits one reset event for a native reset event', () => {
    const fixture = createFormFixture();
    const form = getForm(fixture);
    const input = form.querySelector('input') as HTMLInputElement;

    input.value = 'changed';
    form.reset();
    fixture.detectChanges();

    expect(input.value).toBe('initial');
    expect(fixture.componentInstance.resetCount).toBe(1);
  });

  it('uses requestSubmit for programmatic submission and emits one invalid result', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.componentInstance.novalidate = false;
    fixture.detectChanges();
    const form = getForm(fixture);
    const input = form.querySelector('input') as HTMLInputElement;
    input.value = '';
    const reportValidity = spyOn(form, 'reportValidity').and.returnValue(false);

    getFormComponent(fixture).submit();

    expect(fixture.componentInstance.submitEvents).toHaveSize(1);
    expect(fixture.componentInstance.submitEvents[0].valid).toBeFalse();
    expect(
      fixture.componentInstance.submitEvents[0].event.submitter,
    ).toBeNull();
    expect(reportValidity).toHaveBeenCalledTimes(1);
  });

  it('reports invalid state on an actual submit when novalidate is true', () => {
    const fixture = createFormFixture();
    const form = getForm(fixture);
    const input = form.querySelector('input') as HTMLInputElement;
    input.value = '';
    const reportValidity = spyOn(form, 'reportValidity').and.returnValue(false);

    (form.querySelector('.submit') as HTMLButtonElement).click();

    expect(fixture.componentInstance.submitEvents).toHaveSize(1);
    expect(fixture.componentInstance.submitEvents[0].valid).toBeFalse();
    expect(reportValidity).not.toHaveBeenCalled();
    expect(form.hasAttribute('novalidate')).toBeTrue();
  });

  it('emits invalid state and reports browser feedback when novalidate is false', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.componentInstance.novalidate = false;
    fixture.detectChanges();
    const form = getForm(fixture);
    const input = form.querySelector('input') as HTMLInputElement;
    input.value = '';
    const reportValidity = spyOn(form, 'reportValidity').and.returnValue(false);

    (form.querySelector('.submit') as HTMLButtonElement).click();

    expect(input.validity.valueMissing).toBeTrue();
    expect(fixture.componentInstance.submitEvents).toHaveSize(1);
    expect(fixture.componentInstance.submitEvents[0].valid).toBeFalse();
    expect(reportValidity).toHaveBeenCalledTimes(1);
    expect(form.hasAttribute('novalidate')).toBeTrue();
  });

  it('emits a valid native submission once and preserves the submitter', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.componentInstance.novalidate = false;
    fixture.detectChanges();
    const form = getForm(fixture);
    const submitter = form.querySelector('.submit') as HTMLButtonElement;

    submitter.click();

    expect(fixture.componentInstance.submitEvents).toHaveSize(1);
    expect(fixture.componentInstance.submitEvents[0].valid).toBeTrue();
    expect(fixture.componentInstance.submitEvents[0].event.submitter).toBe(
      submitter,
    );
  });

  it('honors formnovalidate on a submitter and reports its invalid result once', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.componentInstance.novalidate = false;
    fixture.detectChanges();
    const form = getForm(fixture);
    const input = form.querySelector('input') as HTMLInputElement;
    const submitter = form.querySelector(
      '.skip-validation',
    ) as HTMLButtonElement;
    input.value = '';
    const reportValidity = spyOn(form, 'reportValidity').and.returnValue(false);

    form.requestSubmit(submitter);

    expect(fixture.componentInstance.submitEvents).toHaveSize(1);
    expect(fixture.componentInstance.submitEvents[0].valid).toBeFalse();
    expect(fixture.componentInstance.submitEvents[0].event.submitter).toBe(
      submitter,
    );
    expect(reportValidity).not.toHaveBeenCalled();
  });

  it('disables projected controls and suppresses submit output in disabled state', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    const form = getForm(fixture);
    const input = form.querySelector('input') as HTMLInputElement;
    const submitEvents = jasmine.createSpy('submitEvents');
    form.addEventListener('submit', submitEvents);

    getFormComponent(fixture).submit();

    expect(input.matches(':disabled')).toBeTrue();
    expect(input.willValidate).toBeFalse();
    expect(form.checkValidity()).toBeTrue();
    expect(submitEvents).not.toHaveBeenCalled();
    expect(fixture.componentInstance.submitEvents).toHaveSize(0);

    form.requestSubmit();

    expect(submitEvents).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.submitEvents).toHaveSize(0);

    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBeTrue();
  });

  it('provides a nonblank accessible name and honors a trimmed override', () => {
    const fixture = TestBed.createComponent(FormComponent);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    expect(form.getAttribute('aria-label')).toBe('Formulário');

    fixture.componentRef.setInput('ariaLabel', 'Project registration');
    fixture.detectChanges();

    expect(form.getAttribute('aria-label')).toBe('Project registration');

    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.detectChanges();

    expect(form.getAttribute('aria-label')).toBe('Formulário');
  });

  it('applies the native form name and inline layout input', () => {
    const fixture = TestBed.createComponent(FormComponent);
    fixture.componentRef.setInput('name', 'project-registration');
    fixture.componentRef.setInput('layout', 'inline');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    expect(form.name).toBe('project-registration');
    expect(form.classList.contains('orc-form--inline')).toBeTrue();
    expect(
      getComputedStyle(form.querySelector('fieldset') as HTMLFieldSetElement)
        .rowGap,
    ).toBe('16px');
  });

  it('associates the projected field group with its legend and helper text', () => {
    const fixture = TestBed.createComponent(FormFieldHost);
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector(
      '.orc-form-field',
    ) as HTMLFieldSetElement;
    const label = field.querySelector('.orc-form-field__label') as HTMLElement;
    const helper = field.querySelector('.orc-form-field__help') as HTMLElement;
    const input = field.querySelector('input') as HTMLInputElement;

    expect(field.tagName.toLowerCase()).toBe('fieldset');
    expect(field.id).toBe('contact-details');
    expect(label.tagName.toLowerCase()).toBe('legend');
    expect(label.id).toBe('contact-details-label');
    expect(field.getAttribute('aria-describedby')).toBe(helper.id);
    expect(helper.id).toBe('contact-details-help');
    expect(label.id).toBeTruthy();
    expect(input.labels?.[0]?.htmlFor).toBe(input.id);
    expect(field.querySelectorAll('label').length).toBe(1);
    expect(input.hasAttribute('required')).toBeFalse();
    expect(label.textContent).toContain('*');
    expect(field.textContent).toContain('Use your work address');

    const style = getComputedStyle(field);
    expect(style.borderStyle).toBe('none');
    expect(style.margin).toBe('0px');
    expect(style.padding).toBe('0px');
    expect(style.minInlineSize).toBe('0px');
  });

  it('keeps projected radio controls labeled and each group description isolated', () => {
    const fixture = TestBed.createComponent(FormFieldGroupsHost);
    fixture.detectChanges();
    const fields = Array.from(
      fixture.nativeElement.querySelectorAll('.orc-form-field'),
    ) as HTMLFieldSetElement[];
    const ids = fields.flatMap((field) =>
      Array.from(field.querySelectorAll<HTMLElement>('[id]')).map(
        (element) => element.id,
      ),
    );

    expect(fields).toHaveSize(2);
    expect(new Set(ids).size).toBe(ids.length);
    for (const field of fields) {
      const legend = field.querySelector('legend') as HTMLElement;
      const description = field.querySelector(
        '.orc-form-field__help',
      ) as HTMLElement;
      expect(field.id).toBeTruthy();
      expect(legend.id).toBe(`${field.id}-label`);
      expect(description.id).toBe(`${field.id}-help`);
      expect(field.getAttribute('aria-describedby')).toBe(description.id);
      expect(legend.id).toBeTruthy();

      const controls = Array.from(
        field.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
      );
      expect(controls).toHaveSize(2);
      expect(controls.every((control) => control.labels?.length === 1)).toBe(
        true,
      );
    }
  });

  it('has no automated accessibility violations for projected groups', async () => {
    const fixture = TestBed.createComponent(FormFieldGroupsHost);
    fixture.detectChanges();

    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });

  it('updates related field IDs when the stable ID input changes', () => {
    const fixture = TestBed.createComponent(FormFieldComponent);
    fixture.componentRef.setInput('id', 'profile-name');
    fixture.componentRef.setInput('label', 'Profile');
    fixture.componentRef.setInput('helperText', 'Shown to teammates');
    fixture.detectChanges();

    const field = fixture.nativeElement.querySelector(
      'fieldset',
    ) as HTMLFieldSetElement;
    expect(field.id).toBe('profile-name');
    expect(field.querySelector('legend')?.id).toBe('profile-name-label');
    expect(field.querySelector('.orc-form-field__help')?.id).toBe(
      'profile-name-help',
    );
    expect(field.getAttribute('aria-describedby')).toBe('profile-name-help');

    fixture.componentRef.setInput('id', 'account-name');
    fixture.detectChanges();

    expect(field.id).toBe('account-name');
    expect(field.querySelector('legend')?.id).toBe('account-name-label');
    expect(field.querySelector('.orc-form-field__help')?.id).toBe(
      'account-name-help',
    );
    expect(field.getAttribute('aria-describedby')).toBe('account-name-help');
  });

  it('switches helper description to an alert error and treats string false as not required', () => {
    const fixture = TestBed.createComponent(FormFieldHost);
    fixture.componentInstance.error = 'Email is invalid';
    fixture.componentInstance.required = false;
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector(
      '.orc-form-field',
    ) as HTMLElement;
    const error = field.querySelector('.orc-form-field__error') as HTMLElement;

    expect(field.getAttribute('aria-describedby')).toBe(error.id);
    expect(error.getAttribute('role')).toBe('alert');
    expect(field.querySelector('.orc-form-field__help')).toBeNull();
    expect(field.textContent).not.toContain('*');
  });

  it('uses the field error color for projected library controls with theme aliases', () => {
    const rootStyle = document.documentElement.style;
    const originalValues = new Map(
      ['--orc-border-default', '--border-default', '--color-error'].map(
        (name) => [name, rootStyle.getPropertyValue(name)] as const,
      ),
    );
    rootStyle.setProperty('--orc-border-default', 'rgb(20, 30, 40)');
    rootStyle.setProperty('--border-default', 'rgb(20, 30, 40)');
    rootStyle.setProperty('--color-error', 'rgb(220, 0, 0)');

    try {
      const fixture = TestBed.createComponent(FormFieldLibraryControlHost);
      fixture.detectChanges();
      const inputBox = fixture.nativeElement.querySelector(
        '.orc-input-box',
      ) as HTMLElement;
      const controlWrapper = fixture.nativeElement.querySelector(
        '.orc-form-field__control',
      ) as HTMLElement;

      expect(controlWrapper.tagName).toBe('DIV');
      expect(getComputedStyle(inputBox).borderTopColor).toBe('rgb(220, 0, 0)');
      fixture.destroy();
    } finally {
      for (const [name, value] of originalValues) {
        if (value) rootStyle.setProperty(name, value);
        else rootStyle.removeProperty(name);
      }
    }
  });

  it('transforms the public string false required input to boolean false', () => {
    const fixture = TestBed.createComponent(FormFieldComponent);
    fixture.componentRef.setInput('required', 'false');
    fixture.detectChanges();

    expect(fixture.componentInstance.required()).toBeFalse();
    expect(fixture.nativeElement.querySelector('legend')).toBeNull();
  });

  it('updates its group name, visual requirement, and described-by target live', () => {
    const fixture = TestBed.createComponent(FormFieldComponent);
    fixture.componentRef.setInput('id', 'contact-details');
    fixture.componentRef.setInput('label', 'Contact details');
    fixture.componentRef.setInput('helperText', 'Use your work address');
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector(
      '.orc-form-field',
    ) as HTMLFieldSetElement;

    expect(field.getAttribute('aria-describedby')).toBe('contact-details-help');

    fixture.componentRef.setInput('label', 'Primary contact');
    fixture.componentRef.setInput('required', false);
    fixture.componentRef.setInput('error', 'Enter a valid email address');
    fixture.detectChanges();

    expect(field.querySelector('legend')?.textContent).toContain(
      'Primary contact',
    );
    expect(field.querySelector('legend')?.textContent).not.toContain('*');
    expect(field.classList.contains('orc-form-field--invalid')).toBeTrue();
    expect(field.getAttribute('aria-describedby')).toBe(
      'contact-details-error',
    );
    expect(
      field.querySelector('.orc-form-field__error')?.textContent,
    ).toContain('Enter a valid email address');

    fixture.componentRef.setInput('error', '');
    fixture.componentRef.setInput('helperText', '');
    fixture.detectChanges();

    expect(field.classList.contains('orc-form-field--invalid')).toBeFalse();
    expect(field.hasAttribute('aria-describedby')).toBeFalse();
    expect(field.querySelector('.orc-form-field__error')).toBeNull();
    expect(field.querySelector('.orc-form-field__help')).toBeNull();
  });
});
