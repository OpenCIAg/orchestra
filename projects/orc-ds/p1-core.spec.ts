import { TestBed } from '@angular/core/testing';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { CarouselComponent } from './carousel/carousel.component';
import { ChipComponent } from './chip/chip.component';
import { CollapsibleComponent } from './collapsible/collapsible.component';
import { NumberInputComponent } from './number-input/number-input.component';

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
