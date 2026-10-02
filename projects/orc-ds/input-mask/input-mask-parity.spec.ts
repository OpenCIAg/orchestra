import { Component, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { InputMaskDirective, KeyFilterDirective } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the input-mask and key-filter directives. The
 * specs import the directives through the public `@ciag/orchestra/p2`
 * surface and must pass unchanged while the family moves to its canonical
 * directory.
 */
describe('InputMask and KeyFilter behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  @Component({
    imports: [InputMaskDirective],
    template: `<input
      orcInputMask
      mask="999-999"
      [unmask]="unmask()"
      [autoClear]="autoClear()"
      [placeholder]="placeholder()"
    />`,
  })
  class MaskHost {
    readonly unmask = signal(false);
    readonly autoClear = signal(true);
    readonly placeholder = signal<string | undefined>(undefined);
    readonly model = viewChild.required(InputMaskDirective);
  }

  function createMask() {
    const fixture = TestBed.createComponent(MaskHost);
    fixture.detectChanges();
    const native = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    return { fixture, native, directive: fixture.componentInstance.model() };
  }

  function type(native: HTMLInputElement, value: string): void {
    native.value = value;
    native.dispatchEvent(new Event('input', { bubbles: true }));
  }

  it('formats a forms-registered value with mask literals', () => {
    @Component({
      imports: [ReactiveFormsModule, InputMaskDirective],
      template: '<input orcInputMask mask="999-999" [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl('555123');
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    const native = host.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    expect(native.value).toBe('555-123');
  });

  it('emits the raw value when unmask is set and the formatted value otherwise', () => {
    const { fixture, native, directive } = createMask();
    const changes: string[] = [];
    directive.registerOnChange((value) => changes.push(value));

    type(native, '555');
    fixture.detectChanges();
    expect(changes).toEqual(['555']);

    fixture.componentInstance.unmask.set(true);
    fixture.detectChanges();
    type(native, '555-123');
    fixture.detectChanges();
    expect(changes).toEqual(['555', '555123']);
    expect(native.value).toBe('555-123');
  });

  it('emits onComplete when the mask becomes complete', () => {
    const { fixture, native, directive } = createMask();
    const completed: string[] = [];
    directive.onComplete.subscribe((value) => completed.push(value));
    type(native, '555-123');
    fixture.detectChanges();
    expect(completed.length).toBe(1);
  });

  it('clears incomplete values on blur and reports onClear', () => {
    const { fixture, native, directive } = createMask();
    const cleared: number[] = [];
    directive.onClear.subscribe(() => cleared.push(1));
    type(native, '55');
    native.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(native.value).toBe('');
    expect(cleared.length).toBe(1);

    fixture.componentInstance.autoClear.set(false);
    fixture.detectChanges();
    type(native, '55');
    native.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    // With slot retention the incomplete value keeps placeholders on blur.
    expect(native.value).toBe('55_-___');
  });

  it('rejects characters that do not match the token under the caret', () => {
    const { fixture, native } = createMask();
    const blocked = new KeyboardEvent('keydown', {
      key: 'a',
      bubbles: true,
      cancelable: true,
    });
    native.dispatchEvent(blocked);
    expect(blocked.defaultPrevented).toBeTrue();

    const digit = new KeyboardEvent('keydown', {
      key: '5',
      bubbles: true,
      cancelable: true,
    });
    native.dispatchEvent(digit);
    expect(digit.defaultPrevented).toBeFalse();
    expect(fixture).toBeDefined();
  });

  it('keeps a custom characterPattern working for star tokens', () => {
    @Component({
      imports: [InputMaskDirective],
      template: '<input orcInputMask mask="***" characterPattern="[A-C]" />',
    })
    class Host {}
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    const native = host.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const blocked = new KeyboardEvent('keydown', {
      key: 'D',
      bubbles: true,
      cancelable: true,
    });
    native.dispatchEvent(blocked);
    expect(blocked.defaultPrevented).toBeTrue();
    const allowed = new KeyboardEvent('keydown', {
      key: 'B',
      bubbles: true,
      cancelable: true,
    });
    native.dispatchEvent(allowed);
    expect(allowed.defaultPrevented).toBeFalse();
  });

  @Component({
    imports: [KeyFilterDirective],
    template: `<input
      orcKeyFilter
      [pattern]="pattern()"
      [pValidateOnly]="validateOnly()"
    />`,
  })
  class FilterHost {
    readonly pattern = signal<string | RegExp>('[0-9]');
    readonly validateOnly = signal(false);
    readonly model = viewChild.required(KeyFilterDirective);
  }

  it('blocks keypresses and pastes that do not match the pattern', () => {
    const fixture = TestBed.createComponent(FilterHost);
    fixture.detectChanges();
    const native = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    const blocked = new KeyboardEvent('keydown', {
      key: 'a',
      bubbles: true,
      cancelable: true,
    });
    native.dispatchEvent(blocked);
    expect(blocked.defaultPrevented).toBeTrue();

    const digit = new KeyboardEvent('keydown', {
      key: '7',
      bubbles: true,
      cancelable: true,
    });
    native.dispatchEvent(digit);
    expect(digit.defaultPrevented).toBeFalse();

    const paste = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: new DataTransfer(),
    });
    (paste.clipboardData as DataTransfer).setData('text', 'abc');
    native.dispatchEvent(paste);
    expect(paste.defaultPrevented).toBeTrue();
  });

  it('reports validated values through ngModelChange in validate-only mode', () => {
    const fixture = TestBed.createComponent(FilterHost);
    fixture.componentInstance.validateOnly.set(true);
    fixture.detectChanges();
    const native = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const reported: string[] = [];
    fixture.componentInstance
      .model()
      .ngModelChange.subscribe((value) => reported.push(String(value)));

    native.value = 'abc';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(reported).toEqual(['abc']);

    const letter = new KeyboardEvent('keydown', {
      key: 'a',
      bubbles: true,
      cancelable: true,
    });
    native.dispatchEvent(letter);
    // validate-only never blocks typing.
    expect(letter.defaultPrevented).toBeFalse();
  });
});
