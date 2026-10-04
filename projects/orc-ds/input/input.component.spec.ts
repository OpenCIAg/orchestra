import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';
import { axe, toHaveNoViolations } from 'jasmine-axe';

@Component({
  standalone: true,
  imports: [InputComponent],
  template: `<orc-input
    type="number"
    clearable
    [(value)]="value"
    (inputChange)="inputEvents.push($event)"
    (focus)="focusEvents.push($event)"
    (blur)="blurEvents.push($event)"
    (clear)="onClear()"
  />`,
})
class NumericInputEventHost {
  value: string | number = 1;
  readonly inputEvents: Array<string | number> = [];
  readonly focusEvents: FocusEvent[] = [];
  readonly blurEvents: FocusEvent[] = [];
  clearCount = 0;

  onClear(): void {
    this.clearCount += 1;
  }
}

describe('InputComponent', () => {
  beforeEach(() => {
    jasmine.addMatchers(toHaveNoViolations);
  });

  describe('ControlValueAccessor & Signals Unit Tests', () => {
    let component: InputComponent;
    let fixture: ComponentFixture<InputComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [InputComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(InputComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create the input component', () => {
      expect(component).toBeTruthy();
    });

    it('should not impose optional native constraints when they are omitted', () => {
      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');

      expect(inputEl.maxLength).toBe(-1);
      expect(inputEl.minLength).toBe(-1);
      expect(inputEl.getAttribute('min')).toBeNull();
      expect(inputEl.getAttribute('max')).toBeNull();
      expect(inputEl.getAttribute('step')).toBeNull();
    });

    it('should write value via writeValue', () => {
      component.writeValue('Teste Orchestra');
      expect(component.value()).toBe('Teste Orchestra');
    });

    it('should update disabled state via setDisabledState', () => {
      expect(component.effectiveDisabled()).toBeFalse();
      component.setDisabledState(true);
      expect(component.effectiveDisabled()).toBeTrue();
    });

    it('should calculate char count correctly', () => {
      component.writeValue('12345');
      expect(component.charCount()).toBe(5);
    });

    it('should retain text entered into an uncontrolled native input', () => {
      const inputEl: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      inputEl.value = 'typed value';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(inputEl.value).toBe('typed value');
      expect(component.value()).toBe('typed value');
    });

    it('should pass basic accessibility audit with label', async () => {
      fixture.componentRef.setInput('label', 'Nome completo');
      fixture.detectChanges();
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Template-driven Forms Integration', () => {
    @Component({
      standalone: true,
      imports: [FormsModule, InputComponent],
      template: `<orc-input [(ngModel)]="value" name="email" label="Email" />`,
    })
    class TemplateHostComponent {
      value = '';
    }

    it('should retain typed text and update ngModel', async () => {
      const hostFixture = TestBed.createComponent(TemplateHostComponent);
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      const inputEl: HTMLInputElement =
        hostFixture.nativeElement.querySelector('input');
      inputEl.value = 'template@ciag.com';
      inputEl.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(inputEl.value).toBe('template@ciag.com');
      expect(hostFixture.componentInstance.value).toBe('template@ciag.com');
    });
  });

  describe('Reactive Forms Integration', () => {
    @Component({
      standalone: true,
      imports: [InputComponent, ReactiveFormsModule],
      template: `
        <orc-input
          [formControl]="control"
          label="Email do Usuário"
          placeholder="email@dominio.com"
        />
      `,
    })
    class ReactiveHostComponent {
      readonly control = new FormControl('admin@ciag.com');
    }

    let hostFixture: ComponentFixture<ReactiveHostComponent>;
    let hostComponent: ReactiveHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ReactiveHostComponent],
      }).compileComponents();

      hostFixture = TestBed.createComponent(ReactiveHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it('should initialize input with form control value', () => {
      const inputEl = hostFixture.nativeElement.querySelector('input');
      expect(inputEl.value).toBe('admin@ciag.com');
    });

    it('should update form control when input value changes', () => {
      const inputEl = hostFixture.nativeElement.querySelector('input');
      inputEl.value = 'novo@ciag.com';
      inputEl.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();

      expect(hostComponent.control.value).toBe('novo@ciag.com');
    });

    it('should mark the control touched on blur and apply reactive disabled state', () => {
      const inputEl = hostFixture.nativeElement.querySelector(
        'input',
      ) as HTMLInputElement;
      inputEl.focus();
      inputEl.blur();
      hostFixture.detectChanges();
      expect(hostComponent.control.touched).toBeTrue();

      hostComponent.control.disable();
      hostFixture.detectChanges();
      expect(inputEl.disabled).toBeTrue();

      hostComponent.control.enable();
      hostFixture.detectChanges();
      expect(inputEl.disabled).toBeFalse();
    });
  });
});

describe('InputComponent public binding and CVA contracts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, NumericInputEventHost],
    }).compileComponents();
  });

  it('maps identity, native constraints, styling, affixes, and status inputs', () => {
    const fixture = TestBed.createComponent(InputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'fallback-id');
    fixture.componentRef.setInput('inputId', 'primary-id');
    fixture.componentRef.setInput('name', 'account');
    fixture.componentRef.setInput('type', 'number');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('status', 'error');
    fixture.componentRef.setInput('placeholder', 'Enter an amount');
    fixture.componentRef.setInput('label', '  Account amount  ');
    fixture.componentRef.setInput('helperText', 'Helper guidance');
    fixture.componentRef.setInput('errorMessage', 'Invalid amount');
    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('readonly', false);
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('mask', '');
    fixture.componentRef.setInput('unmaskValue', false);
    fixture.componentRef.setInput('maxLength', 8);
    fixture.componentRef.setInput('minLength', 2);
    fixture.componentRef.setInput('min', '1');
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('step', '0.5');
    fixture.componentRef.setInput('showCharCount', true);
    fixture.componentRef.setInput('prefixText', '$');
    fixture.componentRef.setInput('suffixText', 'USD');
    fixture.componentRef.setInput('autocomplete', 'off');
    fixture.componentRef.setInput('autofocus', true);
    fixture.componentRef.setInput('styleClass', 'account-field');
    fixture.componentRef.setInput('style', { marginTop: '2px' });
    fixture.componentRef.setInput('variant', 'filled');
    fixture.componentRef.setInput('fluid', true);
    fixture.componentRef.setInput('ariaLabel', '  Account amount field  ');
    fixture.componentRef.setInput('clearAriaLabel', '  Clear amount  ');
    fixture.componentRef.setInput('ariaLabelledBy', ' amount-heading ');
    fixture.componentRef.setInput('ariaDescribedby', ' external-note ');
    component.writeValue(12345678);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector(
      '.orc-input-container',
    ) as HTMLElement;
    const box = fixture.nativeElement.querySelector(
      '.orc-input-box',
    ) as HTMLElement;
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const label = fixture.nativeElement.querySelector(
      '.orc-input__label',
    ) as HTMLLabelElement;

    expect(input.id).toBe('primary-id');
    expect(input.name).toBe('account');
    expect(input.type).toBe('number');
    expect(input.placeholder).toBe('Enter an amount');
    expect(input.required).toBeTrue();
    expect(input.disabled).toBeFalse();
    expect(input.readOnly).toBeFalse();
    expect(input.maxLength).toBe(8);
    expect(input.minLength).toBe(2);
    expect(input.min).toBe('1');
    expect(input.max).toBe('100');
    expect(input.step).toBe('0.5');
    expect(input.autocomplete).toBe('off');
    expect(input.autofocus).toBeTrue();
    expect(input.getAttribute('aria-label')).toBe('Account amount field');
    expect(input.getAttribute('aria-labelledby')).toBe('amount-heading');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(
      'external-note primary-id-error',
    );
    expect(label.htmlFor).toBe('primary-id');
    expect(label.textContent).toContain('Account amount');
    expect(
      fixture.nativeElement.querySelector('.orc-input__required-marker'),
    ).not.toBeNull();
    expect(box.classList).toContain('orc-input-box--lg');
    expect(box.classList).toContain('orc-input-box--error');
    expect(root.classList).toContain('account-field');
    expect(root.classList).toContain('p-input-filled');
    expect(root.classList).toContain('p-input-fluid');
    expect(root.style.marginTop).toBe('2px');
    expect(fixture.nativeElement.textContent).toContain('$');
    expect(fixture.nativeElement.textContent).toContain('USD');
    expect(
      fixture.nativeElement.querySelector('.orc-input__message--error'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement
        .querySelector('.orc-input__message-icon')
        .getAttribute('aria-hidden'),
    ).toBe('true');
    expect(
      fixture.nativeElement
        .querySelector('.orc-input__char-count')
        .textContent?.replace(/\s+/g, ' ')
        .trim(),
    ).toBe('8 / 8');
    expect(
      (
        fixture.nativeElement.querySelector(
          '.orc-input__clear-btn',
        ) as HTMLButtonElement
      ).getAttribute('aria-label'),
    ).toBe('Clear amount');
    expect(
      (
        fixture.nativeElement.querySelector(
          '.orc-input__clear-btn',
        ) as HTMLButtonElement
      ).tabIndex,
    ).toBe(0);

    fixture.componentRef.setInput('inputId', '   ');
    fixture.componentRef.setInput('id', ' fallback-only ');
    fixture.componentRef.setInput('errorMessage', '');
    fixture.componentRef.setInput('status', 'success');
    fixture.detectChanges();
    expect(input.id).toBe('fallback-only');
    expect(input.getAttribute('aria-describedby')).toBe(
      'external-note fallback-only-helper',
    );
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(box.classList).toContain('orc-input-box--success');
    expect(
      fixture.nativeElement.querySelector('.orc-input__message--helper')
        .textContent,
    ).toContain('Helper guidance');
    fixture.destroy();
  });

  it('trims labels and ARIA references, suppressing blank messages and names', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('id', '   ');
    fixture.componentRef.setInput('inputId', '  generated-from-input-id  ');
    fixture.componentRef.setInput('label', '  Member email  ');
    fixture.componentRef.setInput('ariaLabel', '  Member address  ');
    fixture.componentRef.setInput('ariaLabelledBy', ' member-heading ');
    fixture.componentRef.setInput(
      'ariaDescribedby',
      ' external-description   member-heading external-description ',
    );
    fixture.componentRef.setInput('helperText', '  Use your work email.  ');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.id).toBe('generated-from-input-id');
    expect(input.getAttribute('aria-label')).toBe('Member address');
    expect(input.getAttribute('aria-labelledby')).toBe('member-heading');
    expect(input.getAttribute('aria-describedby')).toBe(
      'external-description member-heading generated-from-input-id-helper',
    );
    expect(
      fixture.nativeElement.querySelector('.orc-input__label').textContent,
    ).toContain('Member email');
    expect(
      fixture.nativeElement.querySelector('.orc-input__message--helper')
        .textContent,
    ).toContain('Use your work email.');

    fixture.componentRef.setInput('ariaLabel', '   ');
    fixture.componentRef.setInput('ariaLabelledBy', '   ');
    fixture.componentRef.setInput('ariaDescribedby', '   ');
    fixture.componentRef.setInput('helperText', '   ');
    fixture.componentRef.setInput('errorMessage', '   ');
    fixture.componentRef.setInput('label', '   ');
    fixture.detectChanges();
    expect(input.getAttribute('aria-label')).toBeNull();
    expect(input.getAttribute('aria-labelledby')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(fixture.nativeElement.querySelector('.orc-input__label')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.orc-input__footer'),
    ).toBeNull();
    expect(input.id).toBe('generated-from-input-id');

    fixture.componentRef.setInput('inputId', '   ');
    fixture.componentRef.setInput('id', '  ');
    fixture.detectChanges();
    expect(input.id).toMatch(/^orc-input-\d+$/);
    fixture.destroy();
  });

  it('formats masked values, emits unmasked values, and counts the enforced mask length', () => {
    const fixture = TestBed.createComponent(InputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('mask', '000-00');
    fixture.componentRef.setInput('unmaskValue', true);
    fixture.componentRef.setInput('maxLength', 30);
    fixture.componentRef.setInput('showCharCount', true);
    component.writeValue('12345');
    const emitted: Array<string | number> = [];
    component.inputChange.subscribe((value) => emitted.push(value));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(input.value).toBe('123-45');
    expect(input.maxLength).toBe(6);
    expect(component.value()).toBe('12345');
    expect(
      fixture.nativeElement
        .querySelector('.orc-input__char-count')
        .textContent?.replace(/\s+/g, ' ')
        .trim(),
    ).toBe('6 / 6');
    expect(
      fixture.nativeElement
        .querySelector('.orc-input__char-count')
        .classList.contains('orc-input__char-count--limit'),
    ).toBeTrue();

    input.value = '98765';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(input.value).toBe('987-65');
    expect(component.value()).toBe('98765');
    expect(emitted).toEqual(['98765']);

    fixture.componentRef.setInput('mask', '');
    fixture.componentRef.setInput('maxLength', 0);
    component.writeValue('');
    fixture.detectChanges();
    expect(input.maxLength).toBe(0);
    expect(
      fixture.nativeElement
        .querySelector('.orc-input__char-count')
        .textContent?.replace(/\s+/g, ' ')
        .trim(),
    ).toBe('0 / 0');
    expect(
      fixture.nativeElement
        .querySelector('.orc-input__char-count')
        .classList.contains('orc-input__char-count--limit'),
    ).toBeTrue();
    fixture.destroy();
  });

  it('keeps the logical caret position when editing a masked value in the middle', async () => {
    const fixture = TestBed.createComponent(InputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('mask', '000-00');
    component.writeValue('12345');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    input.value = '1923-45';
    input.setSelectionRange(2, 2);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input.value).toBe('192-34');
    expect(input.selectionStart).toBe(2);
    fixture.destroy();
  });

  it('preserves numeric zero through the model output and exposes focus, blur, and clear events', () => {
    const fixture = TestBed.createComponent(NumericInputEventHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    input.value = '0';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host.value).toBe(0);
    expect(typeof host.value).toBe('number');
    expect(host.inputEvents).toEqual([0]);

    input.focus();
    input.blur();
    fixture.detectChanges();
    expect(host.focusEvents).toHaveSize(1);
    expect(host.focusEvents[0].target).toBe(input);
    expect(host.blurEvents).toHaveSize(1);
    expect(host.blurEvents[0].target).toBe(input);

    (
      fixture.nativeElement.querySelector(
        '.orc-input__clear-btn',
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(host.value).toBe('');
    expect(host.inputEvents).toEqual([0, '']);
    expect(host.clearCount).toBe(1);
    expect(document.activeElement).toBe(input);
    fixture.destroy();
  });

  it('toggles password visibility with trimmed accessible action names and disabled guards', () => {
    const fixture = TestBed.createComponent(InputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'password');
    fixture.componentRef.setInput('showPasswordAriaLabel', '  Reveal secret  ');
    fixture.componentRef.setInput('hidePasswordAriaLabel', '   ');
    component.writeValue('secret');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const button = fixture.nativeElement.querySelector(
      '.orc-input__password-btn',
    ) as HTMLButtonElement;
    expect(input.type).toBe('password');
    expect(button.tabIndex).toBe(0);
    expect(button.getAttribute('aria-label')).toBe('Reveal secret');
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(button.getAttribute('aria-label')).toBe('Hide password');
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('password');
    expect(button.getAttribute('aria-label')).toBe('Reveal secret');

    fixture.componentRef.setInput('showPasswordAriaLabel', '   ');
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('clearAriaLabel', '   ');
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Show password');
    expect(
      (
        fixture.nativeElement.querySelector(
          '.orc-input__clear-btn',
        ) as HTMLButtonElement
      ).getAttribute('aria-label'),
    ).toBe('Clear input');

    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(input.readOnly).toBeTrue();
    expect(
      fixture.nativeElement.querySelector('.orc-input__clear-btn'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.orc-input__password-btn'),
    ).not.toBeNull();

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.orc-input__password-btn'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.orc-input__clear-btn'),
    ).toBeNull();
    fixture.destroy();
  });
});
