import { TestBed } from '@angular/core/testing';
import { focusElement } from '../../tools/quality/test-focus-events';
import { SelectButtonComponent } from './p2/p2-form-gap-components';

type Choice = { id: string; text: string; disabled?: boolean };

const choices: Choice[] = [
  { id: 'one', text: 'One' },
  { id: 'two', text: 'Two' },
  { id: 'blocked', text: 'Blocked', disabled: true },
];

describe('SelectButton browser contract', () => {
  function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(SelectButtonComponent<string>);
    fixture.componentRef.setInput('options', choices);
    fixture.componentRef.setInput('optionLabel', 'text');
    fixture.componentRef.setInput('optionValue', 'id');
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  function buttons(fixture: ReturnType<typeof create>): HTMLButtonElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    );
  }

  it('exposes a labelled group with native pressed-option semantics in single mode', () => {
    const fixture = create({ label: 'View mode', value: 'one' });
    const host = fixture.nativeElement as HTMLElement;
    const group = host.querySelector('[role="group"]')!;
    const options = buttons(fixture);

    expect(group.getAttribute('aria-label')).toBe('View mode');
    expect(options.map((option) => option.type)).toEqual([
      'button',
      'button',
      'button',
    ]);
    expect(
      options.map((option) => option.getAttribute('aria-pressed')),
    ).toEqual(['true', 'false', 'false']);
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'One',
      'Two',
      'Blocked',
    ]);
    fixture.destroy();
  });

  it('selects and toggles values in multiple mode while preserving controlled writes', () => {
    const fixture = create({ multiple: true, value: ['one'] });
    const component = fixture.componentInstance;
    const options = buttons(fixture);
    const changes: Array<string | string[] | null> = [];
    const modelChanges: Array<string | string[] | null> = [];
    component.valueChangeEvent.subscribe((value) => changes.push(value));
    component.onChange.subscribe(({ value }) => modelChanges.push(value));

    expect(
      options.map((option) => option.getAttribute('aria-pressed')),
    ).toEqual(['true', 'false', 'false']);
    options[1].click();
    options[0].click();
    fixture.detectChanges();

    expect(component.value()).toEqual(['two']);
    expect(changes).toEqual([['one', 'two'], ['two']]);
    expect(modelChanges).toEqual([['one', 'two'], ['two']]);
    expect(options[0].getAttribute('aria-pressed')).toBe('false');
    expect(options[1].getAttribute('aria-pressed')).toBe('true');
    fixture.destroy();
  });

  it('skips disabled options and ignores component and option-disabled interactions', () => {
    const fixture = create({ optionDisabled: 'disabled' });
    const component = fixture.componentInstance;
    const options = buttons(fixture);
    const changed = jasmine.createSpy('changed');
    component.onChange.subscribe(({ value }) => changed(value));

    expect(options[2].disabled).toBeTrue();
    options[2].click();
    expect(component.value()).toBeNull();
    expect(changed).not.toHaveBeenCalled();

    component.setDisabledState(true);
    fixture.detectChanges();
    expect(options.every((option) => option.disabled)).toBeTrue();
    options[0].click();
    expect(component.value()).toBeNull();
    expect(changed).not.toHaveBeenCalled();

    component.setDisabledState(false);
    fixture.detectChanges();
    options[0].click();
    expect(component.value()).toBe('one');
    expect(changed).toHaveBeenCalledOnceWith('one');
    fixture.destroy();
  });

  it('keeps every native option keyboard reachable and activates focused choices', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const options = buttons(fixture);
    const focused = jasmine.createSpy('focused');
    component.onFocus.subscribe(focused);

    focusElement(options[0]);
    expect(document.activeElement).toBe(options[0]);
    expect(focused).toHaveBeenCalled();
    options[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    options[0].click();
    fixture.detectChanges();
    expect(component.value()).toBe('one');
    expect(options[0].getAttribute('aria-pressed')).toBe('true');

    focusElement(options[1]);
    expect(document.activeElement).toBe(options[1]);
    options[1].dispatchEvent(
      new KeyboardEvent('keyup', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    );
    options[1].click();
    expect(component.value()).toBe('two');
    fixture.destroy();
  });

  it('keeps form writes silent and reports touch only after the composite blurs', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const changed = jasmine.createSpy('changed');
    const touched = jasmine.createSpy('touched');
    component.registerOnChange(changed);
    component.registerOnTouched(touched);
    component.writeValue('two');
    fixture.detectChanges();
    expect(component.value()).toBe('two');
    expect(changed).not.toHaveBeenCalled();

    const options = buttons(fixture);
    focusElement(options[1]);
    expect(touched).not.toHaveBeenCalled();
    const outside = document.createElement('button');
    document.body.append(outside);
    focusElement(outside);
    expect(touched).toHaveBeenCalledTimes(1);
    outside.remove();
    fixture.destroy();
  });
});
