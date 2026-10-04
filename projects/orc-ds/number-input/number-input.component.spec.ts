import { TestBed } from '@angular/core/testing';
import { NumberInputComponent } from './number-input.component';

describe('NumberInputComponent accessibility contract', () => {
  it('provides a fallback name for an otherwise unnamed spinbutton', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('input')
        ?.getAttribute('aria-label'),
    ).toBe('Number input');
    fixture.destroy();
  });

  it('gives unlabeled spinbutton controls accessible default names', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentInstance.writeValue(4);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>('button'),
    );
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Decrease value',
      'Clear value',
      'Increase value',
    ]);
  });

  it('preserves caller-provided control names', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('decrementButtonAriaLabel', 'Subtrair');
    fixture.componentRef.setInput('clearAriaLabel', 'Limpar quantidade');
    fixture.componentRef.setInput('incrementButtonAriaLabel', 'Somar');
    fixture.componentInstance.writeValue(4);
    fixture.detectChanges();

    expect(
      Array.from(
        (
          fixture.nativeElement as HTMLElement
        ).querySelectorAll<HTMLButtonElement>('button'),
      ).map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Subtrair', 'Limpar quantidade', 'Somar']);
    fixture.destroy();
  });

  it('uses a visible label or explicit ARIA name instead of the fallback', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('label', 'Quantity');
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    )!;
    expect(input.getAttribute('aria-label')).toBeNull();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('label')?.htmlFor,
    ).toBe(input.id);

    fixture.componentRef.setInput('label', '');
    fixture.componentRef.setInput('ariaLabelledBy', 'external-name');
    fixture.detectChanges();
    expect(input.getAttribute('aria-label')).toBeNull();
    expect(input.getAttribute('aria-labelledby')).toBe('external-name');
    fixture.componentRef.setInput('ariaLabelledBy', '');
    fixture.componentRef.setInput('ariaLabel', 'Amount');
    fixture.detectChanges();
    expect(input.getAttribute('aria-label')).toBe('Amount');
    fixture.destroy();
  });
});

describe('NumberInputComponent public input behavior', () => {
  it('applies id, native attributes, form state, and ARIA associations', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'quantity');
    fixture.componentRef.setInput('inputId', 'quantity-control');
    fixture.componentRef.setInput('name', 'quantity');
    fixture.componentRef.setInput('placeholder', 'Enter a quantity');
    fixture.componentRef.setInput('helperText', 'Whole units');
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('ariaRequired', false);
    fixture.componentRef.setInput('ariaDescribedBy', 'external-help');
    fixture.componentRef.setInput('title', 'Quantity');
    fixture.componentRef.setInput('maxlength', 8);
    fixture.componentRef.setInput('autocomplete', 'off');
    fixture.componentRef.setInput('tabindex', 3);
    fixture.componentRef.setInput('autofocus', true);
    component.writeValue(12);
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    )!;
    expect(input.id).toBe('quantity-control');
    expect(input.name).toBe('quantity');
    expect(input.placeholder).toBe('Enter a quantity');
    expect(input.required).toBeTrue();
    expect(input.getAttribute('aria-required')).toBe('false');
    expect(input.getAttribute('aria-describedby')).toBe('external-help');
    expect(input.title).toBe('Quantity');
    expect(input.maxLength).toBe(8);
    expect(input.autocomplete).toBe('off');
    expect(input.tabIndex).toBe(3);
    expect(input.autofocus).toBeTrue();
    expect(input.getAttribute('aria-valuenow')).toBe('12');
    fixture.destroy();
  });

  it('formats locale, currency, grouping, and fraction digit inputs', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('locale', 'de-DE');
    fixture.componentRef.setInput('mode', 'currency');
    fixture.componentRef.setInput('currency', 'EUR');
    fixture.componentRef.setInput('currencyDisplay', 'code');
    fixture.componentRef.setInput('useGrouping', false);
    fixture.componentRef.setInput('minFractionDigits', 2);
    fixture.componentRef.setInput('maxFractionDigits', 2);
    component.writeValue(1234.5);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('input')?.value,
    ).toContain('EUR');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('input')?.value,
    ).toContain('1234,50');
    fixture.destroy();

    const decimalFixture = TestBed.createComponent(NumberInputComponent);
    decimalFixture.componentRef.setInput('format', false);
    decimalFixture.componentRef.setInput('precision', 2);
    decimalFixture.componentInstance.writeValue(3.456);
    decimalFixture.detectChanges();
    expect(
      (decimalFixture.nativeElement as HTMLElement).querySelector('input')
        ?.value,
    ).toBe('3.46');
    decimalFixture.destroy();
  });

  it('forwards localeMatcher to the Intl number formatter', () => {
    const numberFormatSpy = spyOn(Intl, 'NumberFormat').and.callThrough();
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentRef.setInput('localeMatcher', 'lookup');
    fixture.componentInstance.writeValue(1234.5);
    fixture.detectChanges();

    expect(numberFormatSpy).toHaveBeenCalledWith(
      'en-US',
      jasmine.objectContaining({ localeMatcher: 'lookup' }),
    );
    fixture.destroy();
  });

  it('clamps writes and user edits and honors step, bounds, precision, and empty input', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 5);
    fixture.componentRef.setInput('step', 0.25);
    fixture.componentRef.setInput('precision', 1);
    component.writeValue(9);
    expect(component.value()).toBe(5);

    const input = { value: '2.36' } as HTMLInputElement;
    component.handleInput({ target: input } as unknown as Event);
    expect(component.value()).toBe(2.4);
    component.increment();
    expect(component.value()).toBe(2.7);
    component.decrement();
    expect(component.value()).toBe(2.5);

    fixture.componentRef.setInput('allowEmpty', false);
    component.handleInput({
      target: { value: '  ' } as HTMLInputElement,
    } as unknown as Event);
    expect(component.value()).toBe(2.5);
    fixture.componentRef.setInput('allowEmpty', true);
    component.handleInput({
      target: { value: '' } as HTMLInputElement,
    } as unknown as Event);
    expect(component.value()).toBeNull();
    fixture.destroy();
  });

  it('emits model and input events, marks blur touched, and blocks readonly or disabled changes', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    const component = fixture.componentInstance;
    const inputEvents: Array<number | null> = [];
    const cvaEvents: Array<number | null> = [];
    let touched = 0;
    component.onInput.subscribe((event) => inputEvents.push(event.value));
    component.registerOnChange((value) => cvaEvents.push(value));
    component.registerOnTouched(() => touched++);
    component.handleInput({
      target: { value: '2' } as HTMLInputElement,
    } as unknown as Event);
    component.handleBlur({
      target: { value: '2' } as HTMLInputElement,
    } as unknown as FocusEvent);
    expect(inputEvents).toEqual([2]);
    expect(cvaEvents).toEqual([2]);
    expect(touched).toBe(1);

    fixture.componentRef.setInput('readonly', true);
    component.increment();
    expect(component.value()).toBe(2);
    fixture.componentRef.setInput('readonly', false);
    fixture.componentRef.setInput('disabled', true);
    component.increment();
    expect(component.value()).toBe(2);
    component.setDisabledState(false);
    fixture.componentRef.setInput('disabled', false);
    component.setDisabledState(true);
    component.increment();
    expect(component.value()).toBe(2);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('input')?.disabled,
    ).toBeTrue();
    fixture.destroy();
  });

  it('hides the step controls when either visibility input is false', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('showControls', false);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '.p-inputnumber-button',
      ).length,
    ).toBe(0);
    fixture.componentRef.setInput('showControls', true);
    fixture.componentRef.setInput('showButtons', false);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '.p-inputnumber-button',
      ).length,
    ).toBe(0);
    fixture.destroy();
  });

  it('wires status, sizing, layout, variants, clear, and customization inputs', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('styleClass', 'custom-root');
    fixture.componentRef.setInput('style', { width: '240px' });
    fixture.componentRef.setInput('inputStyle', { color: 'red' });
    fixture.componentRef.setInput('inputStyleClass', 'custom-input');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('buttonLayout', 'vertical');
    fixture.componentRef.setInput('variant', 'filled');
    fixture.componentRef.setInput('fluid', true);
    fixture.componentRef.setInput('status', 'error');
    fixture.componentRef.setInput('errorMessage', 'Invalid amount');
    fixture.componentRef.setInput('prefix', '$');
    fixture.componentRef.setInput('suffix', 'USD');
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('incrementButtonClass', 'custom-up');
    fixture.componentRef.setInput('decrementButtonClass', 'custom-down');
    fixture.componentRef.setInput('incrementButtonIcon', 'UP');
    fixture.componentRef.setInput('decrementButtonIcon', 'DOWN');
    fixture.componentInstance.writeValue(1);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.custom-root')?.getAttribute('style')).toContain(
      'width: 240px',
    );
    expect(root.querySelector('.orc-number-input')).toHaveClass(
      'orc-number-input--size-lg',
    );
    expect(root.querySelector('.orc-number-input')).toHaveClass(
      'orc-number-input--layout-vertical',
    );
    expect(root.querySelector('.orc-number-input')).toHaveClass(
      'orc-number-input--variant-filled',
    );
    expect(root.querySelector('.orc-number-input')).toHaveClass(
      'orc-inputnumber-fluid',
    );
    expect(root.querySelector('.orc-number-input__box')).toHaveClass(
      'orc-number-input__box--error',
    );
    expect(
      root.querySelector('.orc-number-input__message')?.textContent,
    ).toContain('Invalid amount');
    expect(root.querySelector('.orc-number-input__affix')?.textContent).toBe(
      '$',
    );
    expect(
      root.querySelector('.orc-number-input__affix:last-of-type')?.textContent,
    ).toBe('USD');
    expect(root.querySelector('input')).toHaveClass('custom-input');
    expect((root.querySelector('input') as HTMLInputElement).style.color).toBe(
      'red',
    );
    expect(root.querySelector('.custom-up')?.textContent).toContain('UP');
    expect(root.querySelector('.custom-down')?.textContent).toContain('DOWN');
    expect(
      root.querySelector('button[aria-label="Clear value"]'),
    ).not.toBeNull();
    fixture.destroy();
  });

  it('honors explicit labels, errors, helper text, and status ARIA state', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('id', 'hours');
    fixture.componentRef.setInput('label', 'Hours');
    fixture.componentRef.setInput('helperText', 'Use decimal hours');
    fixture.componentRef.setInput('status', 'success');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    let input = root.querySelector('input')!;
    expect(root.querySelector('label')?.htmlFor).toBe('hours');
    expect(input.getAttribute('aria-describedby')).toBe('hours-helper');

    fixture.componentRef.setInput('errorMessage', 'Must be positive');
    fixture.detectChanges();
    input = root.querySelector('input')!;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('hours-error');
    expect(root.querySelector('.orc-number-input__box')).toHaveClass(
      'orc-number-input__box--success',
    );
    fixture.destroy();
  });
});
