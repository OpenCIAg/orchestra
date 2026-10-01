import { TestBed } from '@angular/core/testing';
import { ComboboxComponent as LegacyComboboxComponent } from './p2-form-components';
import { ComboboxComponent } from './p2-combobox-component';
import { P2Option } from './p2-shared';

describe('ComboboxComponent behavior', () => {
  const options: P2Option<string>[] = [
    { value: 'sp', label: 'São Paulo' },
    { value: 'disabled', label: 'Disabled city', disabled: true },
    { value: 'rj', label: 'Rio de Janeiro' },
  ];

  function create(optionsValue: P2Option<string>[] = options) {
    const fixture = TestBed.createComponent(ComboboxComponent<string>);
    fixture.componentRef.setInput('options', optionsValue);
    fixture.componentRef.setInput('label', 'City');
    fixture.componentRef.setInput('clearAriaLabel', 'Clear city');
    fixture.detectChanges();
    return fixture;
  }

  function inputValue(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function key(input: HTMLInputElement, name: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key: name,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    return event;
  }

  it('preserves class identity through the legacy form-components export', () => {
    expect(LegacyComboboxComponent).toBe(ComboboxComponent);
  });

  it('reconciles CVA writes to option labels, including options supplied later, without echoing a change', () => {
    const fixture = TestBed.createComponent(ComboboxComponent<string>);
    const component = fixture.componentInstance;
    const changed = jasmine.createSpy('changed');
    const selected = jasmine.createSpy('selected');
    const touched = jasmine.createSpy('touched');
    component.registerOnChange(changed);
    component.registerOnTouched(touched);
    component.optionSelected.subscribe(selected);

    component.writeValue('sp');
    fixture.detectChanges();
    expect(component.value()).toBe('sp');
    expect(component.query()).toBe('');

    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
    expect(component.query()).toBe('São Paulo');
    expect(fixture.nativeElement.querySelector('input').value).toBe(
      'São Paulo',
    );
    expect(changed).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
    expect(touched).not.toHaveBeenCalled();

    component.writeValue(null);
    fixture.detectChanges();
    expect(component.query()).toBe('');
  });

  it('clears a committed value when the user edits the query and reports that model change once', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const changed = jasmine.createSpy('changed');
    component.registerOnChange(changed);
    component.writeValue('sp');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    inputValue(input, 'Rio');
    fixture.detectChanges();
    expect(component.value()).toBeNull();
    expect(component.query()).toBe('Rio');
    expect(changed).toHaveBeenCalledOnceWith(null);

    inputValue(input, 'Rio de Janeiro');
    fixture.detectChanges();
    expect(component.query()).toBe('Rio de Janeiro');
    expect(changed).toHaveBeenCalledOnceWith(null);
  });

  it('moves through enabled options, clamps at both ends, and never activates a disabled option', () => {
    const fixture = create([
      { value: 'a', label: 'A', disabled: true },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C', disabled: true },
      { value: 'd', label: 'D' },
    ]);
    const component = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const changed = jasmine.createSpy('changed');
    const selected = jasmine.createSpy('selected');
    component.registerOnChange(changed);
    component.optionSelected.subscribe(selected);

    expect(key(input, 'ArrowDown').defaultPrevented).toBeTrue();
    expect(component.activeOptionIndex()).toBe(1);
    key(input, 'ArrowDown');
    expect(component.activeOptionIndex()).toBe(3);
    key(input, 'ArrowDown');
    expect(component.activeOptionIndex()).toBe(3);
    key(input, 'ArrowUp');
    expect(component.activeOptionIndex()).toBe(1);
    key(input, 'ArrowUp');
    expect(component.activeOptionIndex()).toBe(1);
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toBe(
      component.optionId(1),
    );

    component.activeIndex.set(0);
    fixture.detectChanges();
    expect(component.activeOptionIndex()).toBe(-1);
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
    const enter = key(input, 'Enter');
    expect(enter.defaultPrevented).toBeFalse();
    expect(component.value()).toBeNull();
    expect(changed).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
  });

  it('starts ArrowUp at the last enabled option when the popup opens', () => {
    const fixture = create([
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ]);
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    key(input, 'ArrowUp');
    expect(fixture.componentInstance.open()).toBeTrue();
    expect(fixture.componentInstance.activeOptionIndex()).toBe(2);
  });

  it('dismisses on Escape while retaining input focus, and marks touched only on actual blur', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const touched = jasmine.createSpy('touched');
    component.registerOnTouched(touched);
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.focus();
    fixture.detectChanges();
    expect(component.open()).toBeTrue();

    const escape = key(input, 'Escape');
    fixture.detectChanges();
    expect(escape.defaultPrevented).toBeTrue();
    expect(component.open()).toBeFalse();
    expect(document.activeElement).toBe(input);
    expect(touched).not.toHaveBeenCalled();

    input.blur();
    fixture.detectChanges();
    expect(component.open()).toBeFalse();
    expect(touched).toHaveBeenCalledTimes(1);
    component.onBlur();
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('emits one CVA change and one selection output without touching until blur', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const changed = jasmine.createSpy('changed');
    const touched = jasmine.createSpy('touched');
    const selected = jasmine.createSpy('selected');
    component.registerOnChange(changed);
    component.registerOnTouched(touched);
    component.optionSelected.subscribe(selected);

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.focus();
    fixture.detectChanges();
    component.select(options[0]);
    fixture.detectChanges();
    expect(component.value()).toBe('sp');
    expect(component.query()).toBe('São Paulo');
    expect(component.open()).toBeFalse();
    expect(changed).toHaveBeenCalledOnceWith('sp');
    expect(selected).toHaveBeenCalledOnceWith(options[0]);
    expect(touched).not.toHaveBeenCalled();

    input.blur();
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('blocks input, keyboard, selection, and clear while disabled through either API', () => {
    for (const disable of [
      (component: ComboboxComponent<string>) =>
        component.setDisabledState(true),
      (
        component: ComboboxComponent<string>,
        fixture: ReturnType<typeof create>,
      ) => fixture.componentRef.setInput('disabled', true),
    ]) {
      const fixture = create();
      const component = fixture.componentInstance;
      const changed = jasmine.createSpy('changed');
      const selected = jasmine.createSpy('selected');
      component.registerOnChange(changed);
      component.optionSelected.subscribe(selected);
      component.writeValue('sp');
      fixture.detectChanges();
      disable(component, fixture);
      fixture.detectChanges();

      component.onInput({ target: { value: 'Rio' } } as unknown as Event);
      component.onKeydown(
        new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
      );
      component.select(options[2]);
      component.clear();
      fixture.detectChanges();

      expect(component.value()).toBe('sp');
      expect(component.query()).toBe('São Paulo');
      expect(component.open()).toBeFalse();
      expect(changed).not.toHaveBeenCalled();
      expect(selected).not.toHaveBeenCalled();
      expect(
        (fixture.nativeElement.querySelector('input') as HTMLInputElement)
          .disabled,
      ).toBeTrue();
      expect(
        (fixture.nativeElement.querySelector('button') as HTMLButtonElement)
          .disabled,
      ).toBeTrue();
    }
  });
});
