import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  InputMaskDirective,
  KeyFilterDirective,
} from './p2/p2-form-gap-components';

@Component({
  standalone: true,
  imports: [InputMaskDirective, ReactiveFormsModule],
  template: `<input
    orcInputMask
    [mask]="mask"
    [slotChar]="slotChar"
    [autoClear]="autoClear"
    [unmask]="unmask()"
    [characterPattern]="characterPattern"
    [readonly]="readonly()"
    [inputId]="inputId"
    [placeholder]="placeholder"
    [tabindex]="tabindex"
    [ariaLabel]="ariaLabel"
    [required]="required()"
    [formControl]="control"
  />`,
})
class InputMaskHost {
  mask = '99/99';
  slotChar = '_';
  autoClear = true;
  unmask = signal(false);
  characterPattern: string | RegExp = '[A-Za-z0-9]';
  readonly = signal(false);
  inputId = 'masked-input';
  placeholder = 'MM/YY';
  tabindex: string | number | undefined = 0;
  ariaLabel = 'Masked value';
  required = signal(false);
  control = new FormControl<string>('');
}

@Component({
  standalone: true,
  imports: [InputMaskDirective],
  template: `<input orcInputMask [disabled]="disabled()" />`,
})
class InputMaskDisabledInputHost {
  disabled = signal<unknown>('false');
}

@Component({
  standalone: true,
  imports: [KeyFilterDirective],
  template: `<input
    orcKeyFilter
    [pattern]="pattern"
    [pValidateOnly]="validateOnly"
  />`,
})
class KeyFilterHost {
  pattern: string | RegExp = '[0-9]';
  validateOnly = false;
}

function inputOf<T>(fixture: ComponentFixture<T>): HTMLInputElement {
  return fixture.nativeElement.querySelector('input') as HTMLInputElement;
}

function paste(input: HTMLInputElement, value: string): Event {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: { getData: () => value },
  });
  input.dispatchEvent(event);
  return event;
}

describe('KeyFilter and InputMask directive contracts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputMaskHost, KeyFilterHost],
    }).compileComponents();
  });

  it('filters keydown and paste while allowing navigation and modifiers', () => {
    const fixture = TestBed.createComponent(KeyFilterHost);
    fixture.detectChanges();
    const input = inputOf(fixture);
    const invalid = new KeyboardEvent('keydown', {
      key: 'a',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(invalid);
    expect(invalid.defaultPrevented).toBeTrue();
    const navigation = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(navigation);
    expect(navigation.defaultPrevented).toBeFalse();
    const modified = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(modified);
    expect(modified.defaultPrevented).toBeFalse();
    expect(paste(input, '12a').defaultPrevented).toBeTrue();
    expect(paste(input, '123').defaultPrevented).toBeFalse();
  });

  it('does not block composing text and emits validateOnly input values', () => {
    const fixture = TestBed.createComponent(KeyFilterHost);
    fixture.componentInstance.validateOnly = true;
    fixture.detectChanges();
    const input = inputOf(fixture);
    const directive = fixture.debugElement
      .query(By.directive(KeyFilterDirective))
      .injector.get(KeyFilterDirective);
    const values: Array<string | number> = [];
    directive.ngModelChange.subscribe((value) => values.push(value));
    const composing = new KeyboardEvent('keydown', {
      key: 'a',
      isComposing: true,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(composing);
    expect(composing.defaultPrevented).toBeFalse();
    input.value = '12a';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(values).toEqual(['12a']);
  });

  it('formats CVA values with literals and emits an unmasked value', () => {
    const fixture = TestBed.createComponent(InputMaskHost);
    fixture.detectChanges();
    const input = inputOf(fixture);
    fixture.componentInstance.control.setValue('1234');
    fixture.detectChanges();
    expect(input.value).toBe('12/34');
    fixture.componentInstance.unmask.set(true);
    fixture.componentInstance.control.setValue('5678');
    fixture.detectChanges();
    expect(input.value).toBe('56/78');
    const directive = fixture.debugElement
      .query(By.directive(InputMaskDirective))
      .injector.get(InputMaskDirective);
    expect(directive.unmask()).toBeTrue();
    input.value = '90/12';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe('9012');
  });

  it('filters rejected characters from unmask output and caret mapping', async () => {
    const fixture = TestBed.createComponent(InputMaskHost);
    fixture.componentInstance.unmask.set(true);
    fixture.detectChanges();
    const input = inputOf(fixture);
    input.value = '1x2/34';
    input.setSelectionRange(2, 2);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(input.value).toBe('12/34');
    expect(fixture.componentInstance.control.value).toBe('1234');
    expect(input.selectionStart).toBe(1);
  });

  it('accepts custom star characters and resets global regex state', () => {
    const fixture = TestBed.createComponent(InputMaskHost);
    fixture.componentInstance.mask = '**/**';
    fixture.componentInstance.characterPattern = /[A-F]/g;
    fixture.detectChanges();
    const input = inputOf(fixture);
    input.value = 'ABCD';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input.value).toBe('AB/CD');
  });

  it('clears incomplete values on blur or keeps slot characters when configured', () => {
    const fixture = TestBed.createComponent(InputMaskHost);
    fixture.detectChanges();
    const input = inputOf(fixture);
    let clears = 0;
    const directive = fixture.debugElement
      .query(By.directive(InputMaskDirective))
      .injector.get(InputMaskDirective);
    directive.onClear.subscribe(() => clears++);
    input.value = '1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur'));
    expect(input.value).toBe('');
    expect(clears).toBe(1);

    fixture.componentInstance.autoClear = false;
    fixture.detectChanges();
    input.value = '1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input.value).toBe('1_/__');
  });

  it('preserves composition text until compositionend and reports completion once per input', () => {
    const fixture = TestBed.createComponent(InputMaskHost);
    fixture.detectChanges();
    const input = inputOf(fixture);
    const directive = fixture.debugElement
      .query(By.directive(InputMaskDirective))
      .injector.get(InputMaskDirective);
    let complete = 0;
    directive.onComplete.subscribe(() => complete++);
    input.dispatchEvent(
      new CompositionEvent('compositionstart', { bubbles: true }),
    );
    input.value = 'é';
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, isComposing: true }),
    );
    expect(input.value).toBe('é');
    input.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true }),
    );
    input.value = '12/34';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(complete).toBe(1);
  });

  it('keeps the logical caret at the edited mask position and emits lifecycle outputs', async () => {
    const fixture = TestBed.createComponent(InputMaskHost);
    fixture.detectChanges();
    const input = inputOf(fixture);
    const directive = fixture.debugElement
      .query(By.directive(InputMaskDirective))
      .injector.get(InputMaskDirective);
    let inputEvents = 0;
    let keydownEvents = 0;
    let focusEvents = 0;
    let blurEvents = 0;
    directive.onInput.subscribe(() => inputEvents++);
    directive.onKeydown.subscribe(() => keydownEvents++);
    directive.onFocus.subscribe(() => focusEvents++);
    directive.onBlur.subscribe(() => blurEvents++);
    input.value = '12/34';
    input.setSelectionRange(3, 3);
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: '9', bubbles: true }),
    );
    input.value = '129/34';
    input.setSelectionRange(4, 4);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(input.value).toBe('12/93');
    expect(input.selectionStart).toBe(4);
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new Event('blur'));
    expect(inputEvents).toBe(1);
    expect(keydownEvents).toBe(1);
    expect(focusEvents).toBe(1);
    expect(blurEvents).toBe(1);
  });

  it('reflects CVA disabled, readonly, and core accessibility inputs', () => {
    const fixture = TestBed.createComponent(InputMaskHost);
    fixture.componentInstance.required.set(true);
    fixture.detectChanges();
    const input = inputOf(fixture);
    expect(input.id).toBe('masked-input');
    expect(input.placeholder).toBe('MM/YY');
    expect(input.tabIndex).toBe(0);
    expect(input.getAttribute('aria-label')).toBe('Masked value');
    expect(input.required).toBeTrue();
    fixture.componentInstance.control.disable();
    fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();
    expect(input.disabled).toBeTrue();
    expect(input.readOnly).toBeTrue();
    const previous = fixture.componentInstance.control.value;
    input.value = '12/34';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(previous);
  });

  it('boolean-coerces the disabled input without binding it to a reactive form control', () => {
    const fixture = TestBed.createComponent(InputMaskDisabledInputHost);
    fixture.detectChanges();
    const input = inputOf(fixture);
    expect(input.disabled).toBeFalse();
    fixture.componentInstance.disabled.set('');
    fixture.detectChanges();
    expect(input.disabled).toBeTrue();
    fixture.componentInstance.disabled.set('false');
    fixture.detectChanges();
    expect(input.disabled).toBeFalse();
  });
});
