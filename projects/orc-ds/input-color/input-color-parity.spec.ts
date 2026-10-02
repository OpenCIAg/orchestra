import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AutoFocusDirective, InputColorComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the input color and the autofocus directive. The
 * specs import through the public `@ciag/orchestra/p2` surface and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('InputColor and AutoFocus behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(InputColorComponent);
    fixture.detectChanges();
    return fixture;
  }

  function colorInput(fixture: ReturnType<typeof create>): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      'input[type="color"]',
    ) as HTMLInputElement;
  }

  function textInput(fixture: ReturnType<typeof create>): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      'input.text',
    ) as HTMLInputElement;
  }

  it('normalizes short hex forms and falls back to the default color', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('#abc');
    expect(fixture.componentInstance.value()).toBe('#aabbcc');

    fixture.componentInstance.writeValue('#A1B2C3');
    expect(fixture.componentInstance.value()).toBe('#a1b2c3');

    fixture.componentInstance.writeValue('not-a-color');
    // An invalid forms value falls back to the default color.
    expect(fixture.componentInstance.value()).toBe('#3b82f6');

    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.value()).toBe('#3b82f6');
  });

  it('keeps the previous color when a typed value is invalid', () => {
    const fixture = create();
    const changes: string[] = [];
    fixture.componentInstance.registerOnChange((value) => changes.push(value));

    const text = textInput(fixture);
    text.value = '#112233';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(changes).toEqual(['#112233']);

    text.value = 'nope';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    // update() ignores values it cannot normalize; the change is not emitted.
    expect(fixture.componentInstance.value()).toBe('#112233');
    expect(changes).toEqual(['#112233']);
  });

  it('emits valueChangeEvent and the forms change from either editor', () => {
    const fixture = create();
    const changes: string[] = [];
    const emitted: string[] = [];
    fixture.componentInstance.registerOnChange((value) => changes.push(value));
    fixture.componentInstance.valueChangeEvent.subscribe((value) =>
      emitted.push(value),
    );

    const native = colorInput(fixture);
    native.value = '#112233';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('#112233');
    expect(changes).toEqual(['#112233']);
    expect(emitted).toEqual(['#112233']);

    const text = textInput(fixture);
    text.value = '#aabbcc';
    text.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(changes).toEqual(['#112233', '#aabbcc']);
    expect(emitted).toEqual(['#112233', '#aabbcc']);
  });

  it('marks touched once when focus leaves the composite', () => {
    const fixture = create();
    let touched = 0;
    fixture.componentInstance.registerOnTouched(() => {
      touched += 1;
    });

    fixture.componentInstance.onFocusOut(
      new FocusEvent('focusout', { relatedTarget: null }),
    );
    expect(touched).toBe(1);

    fixture.componentInstance.onFocusOut(
      new FocusEvent('focusout', { relatedTarget: null }),
    );
    expect(touched).toBe(1);
  });

  it('stops updating while disabled through the input or the forms API', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.isDisabled()).toBeTrue();

    const changes: string[] = [];
    fixture.componentInstance.registerOnChange((value) => changes.push(value));
    const native = colorInput(fixture);
    native.value = '#112233';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(changes).toEqual([]);
    expect(fixture.componentInstance.value()).toBe('#3b82f6');

    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(colorInput(fixture).disabled).toBeTrue();
    expect(textInput(fixture).disabled).toBeTrue();
  });

  it('focuses the host after initialization unless disabled', async () => {
    @Component({
      imports: [AutoFocusDirective],
      template: '<input #first orcAutoFocus [disabled]="enabled()" />',
    })
    class Host {
      readonly enabled = signal(false);
      readonly model =
        viewChild.required<ElementRef<HTMLInputElement>>('first');
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(
      host.componentInstance.model().nativeElement,
    );

    @Component({
      imports: [AutoFocusDirective],
      template: '<input #second orcAutoFocus [disabled]="true" />',
    })
    class DisabledHost {
      readonly model =
        viewChild.required<ElementRef<HTMLInputElement>>('second');
    }
    const disabledHost = TestBed.createComponent(DisabledHost);
    disabledHost.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).not.toBe(
      disabledHost.componentInstance.model().nativeElement,
    );
  });

  it('stops Escape propagation while the autofocus directive is disabled', () => {
    @Component({
      imports: [AutoFocusDirective],
      template: '<input orcAutoFocus [disabled]="true" />',
    })
    class Host {}
    const host = TestBed.createComponent(Host);
    host.detectChanges();

    let bubbled = 0;
    host.nativeElement.addEventListener('keydown', () => {
      bubbled += 1;
    });
    const input = host.nativeElement.querySelector('input') as HTMLElement;
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(bubbled).toBe(0);
  });
});
