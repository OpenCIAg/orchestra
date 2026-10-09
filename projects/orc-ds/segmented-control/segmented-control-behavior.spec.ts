import { TestBed } from '@angular/core/testing';
import { SegmentedControlComponent } from './segmented-control.component';
import {
  blurElement,
  focusElement,
} from '../../../tools/quality/test-focus-events';

const options = [
  { label: 'Grid', value: 'grid' },
  { label: 'Disabled', value: 'disabled', disabled: true },
  { label: 'List', value: 'list' },
];

describe('Segmented control selection contract', () => {
  function setup() {
    const fixture = TestBed.createComponent(SegmentedControlComponent<string>);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('label', 'Layout');
    fixture.detectChanges();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    return { fixture, component: fixture.componentInstance, buttons };
  }

  it('shares one implementation between import paths and supports both output contracts', () => {
    const { component, buttons } = setup();
    const change = jasmine.createSpy('change');
    const compatibility = jasmine.createSpy('compatibility');
    component.change.subscribe(change);
    component.valueChangeEvent.subscribe(compatibility);
    buttons[2].click();
    expect(change).toHaveBeenCalledOnceWith('list');
    expect(compatibility).toHaveBeenCalledOnceWith('list');
  });

  it('moves focus and selection together, skips disabled options and wraps', () => {
    const { fixture, component, buttons } = setup();
    focusElement(buttons[0]);
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[2]);
    expect(component.value()).toBe('list');
    expect(buttons.map((button) => button.tabIndex)).toEqual([-1, -1, 0]);
    buttons[2].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(buttons[0]);
    expect(component.value()).toBe('grid');
  });

  it('keeps an enabled tab stop when the selected option becomes disabled or disappears', () => {
    const { fixture, component, buttons } = setup();
    component.writeValue('disabled');
    fixture.detectChanges();
    expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1, -1]);
    component.writeValue('missing');
    fixture.detectChanges();
    expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1, -1]);
  });

  it('leaves readonly options focusable without permitting value changes', () => {
    const { fixture, component, buttons } = setup();
    fixture.componentRef.setInput('readonly', true);
    component.writeValue('grid');
    fixture.detectChanges();
    expect(buttons[0].disabled).toBeFalse();
    focusElement(buttons[0]);
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    focusElement(buttons[2]);
    expect(document.activeElement).toBe(buttons[2]);
    buttons[2].click();
    fixture.detectChanges();
    expect(buttons.map((button) => button.tabIndex)).toEqual([-1, -1, 0]);
    expect(component.value()).toBe('grid');
  });

  it('does not emit user changes during form writes or repeated selection', () => {
    const { fixture, component, buttons } = setup();
    const changed = jasmine.createSpy('changed');
    component.registerOnChange(changed);
    component.writeValue('list');
    fixture.detectChanges();
    expect(changed).not.toHaveBeenCalled();
    buttons[2].click();
    expect(changed).not.toHaveBeenCalled();
    buttons[0].click();
    expect(changed).toHaveBeenCalledOnceWith('grid');
  });

  it('honors form disabling and marks touched when focus leaves', () => {
    const { fixture, component, buttons } = setup();
    const touched = jasmine.createSpy('touched');
    component.registerOnTouched(touched);
    focusElement(buttons[0]);
    blurElement(buttons[0]);
    expect(touched).toHaveBeenCalled();
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(buttons.every((button) => button.disabled)).toBeTrue();
    component.select(options[2]);
    expect(component.value()).toBeNull();
  });

  it('reverses horizontal arrows for right-to-left layouts', () => {
    const { fixture, component, buttons } = setup();
    fixture.nativeElement.style.direction = 'rtl';
    focusElement(buttons[0]);
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(component.value()).toBe('list');
    expect(document.activeElement).toBe(buttons[2]);
  });
});
