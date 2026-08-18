import { TestBed } from '@angular/core/testing';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { CarouselComponent } from './carousel/carousel.component';
import { ChipComponent } from './chip/chip.component';
import { CollapsibleComponent } from './collapsible/collapsible.component';
import { NumberInputComponent } from './number-input/number-input.component';
import { InputComponent } from './input/input.component';
import { TextareaComponent } from './input/textarea.component';

describe('P1 core components', () => {
  it('clamps number input values and increments by step', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('min', 1);
    fixture.componentRef.setInput('max', 10);
    fixture.componentRef.setInput('step', 2);
    fixture.componentInstance.writeValue(99);
    expect(fixture.componentInstance.value()).toBe(10);
    fixture.componentInstance.decrement();
    expect(fixture.componentInstance.value()).toBe(8);
  });

  it('formats InputNumber values with PrimeNG currency options', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('mode', 'currency');
    fixture.componentRef.setInput('currency', 'USD');
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.componentInstance.writeValue(12.5);
    expect(fixture.componentInstance.displayValue()).toContain('$12.50');
  });

  it('parses localized decimal input and defaults the input tabindex', () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    const component = fixture.componentInstance;
    component.handleInput({ target: { value: '1,5' } } as unknown as Event);
    expect(component.value()).toBe(1.5);
    expect(component.tabindex()).toBe(0);
  });

  it('treats error messages as invalid input state', () => {
    const input = TestBed.createComponent(InputComponent);
    input.componentRef.setInput('errorMessage', 'Required');
    input.detectChanges();
    expect(input.nativeElement.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    expect(input.nativeElement.textContent).toContain('Required');

    const textarea = TestBed.createComponent(TextareaComponent);
    textarea.componentRef.setInput('errorMessage', 'Required');
    textarea.detectChanges();
    expect(textarea.nativeElement.querySelector('textarea')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('selects an autocomplete option and emits its value', () => {
    const fixture = TestBed.createComponent(AutocompleteComponent);
    const option = { value: 'sp', label: 'São Paulo' };
    fixture.componentRef.setInput('options', [option]);
    let selected = '';
    fixture.componentInstance.optionSelected.subscribe(item => selected = item.value);
    fixture.componentInstance.select(option);
    expect(fixture.componentInstance.value()).toBe('sp');
    expect(selected).toBe('sp');
  });

  it('enforces forceSelection and closeOnEscape contracts', () => {
    const fixture = TestBed.createComponent(AutocompleteComponent);
    const option = { value: 'sp', label: 'São Paulo' };
    fixture.componentRef.setInput('options', [option]);
    fixture.componentRef.setInput('forceSelection', true);
    fixture.componentInstance.onInput({ target: { value: 'unknown' } } as unknown as Event);
    fixture.componentInstance.onBlur();
    expect(fixture.componentInstance.value()).toBeNull();

    fixture.componentInstance.isOpen.set(true);
    fixture.componentRef.setInput('closeOnEscape', false);
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fixture.componentInstance.isOpen()).toBeTrue();
  });

  it('moves a carousel to the next enabled item', () => {
    const fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('items', [{ label: 'A' }, { label: 'B' }, { label: 'C', disabled: true }]);
    fixture.componentInstance.next();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
    fixture.componentInstance.next();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it('toggles collapsible state and chip removal', () => {
    const collapsible = TestBed.createComponent(CollapsibleComponent);
    collapsible.componentInstance.toggle();
    expect(collapsible.componentInstance.open()).toBeTrue();

    const chip = TestBed.createComponent(ChipComponent);
    chip.componentRef.setInput('label', 'Angular');
    let removed = '';
    chip.componentInstance.removed.subscribe(value => removed = String(value));
    chip.componentInstance.remove(new Event('click'));
    expect(removed).toBe('Angular');
  });
});
