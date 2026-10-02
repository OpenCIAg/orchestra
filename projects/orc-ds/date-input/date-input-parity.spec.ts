import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { DateInputComponent } from '@ciag/orchestra/p2';

/**
 * Behavior-parity pins for the date input. The specs import the component
 * through the public `@ciag/orchestra/p2` surface and must pass unchanged
 * while the family moves to its canonical directory.
 */
describe('DateInput behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.detectChanges();
    return fixture;
  }

  function input(env: { nativeElement: HTMLElement }): HTMLInputElement {
    return env.nativeElement.querySelector('input') as HTMLInputElement;
  }

  it('normalizes forms values and rejects non-ISO strings', () => {
    @Component({
      imports: [ReactiveFormsModule, DateInputComponent],
      template: '<orc-date-input [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl('');
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();

    host.componentInstance.control.setValue('2026-03-10');
    host.detectChanges();
    expect(host.componentInstance.control.value).toBe('2026-03-10');

    host.componentInstance.control.setValue('not-a-date');
    host.detectChanges();
    // The control keeps the raw value; the component only normalizes its view.
    expect(host.componentInstance.control.value).toBe('not-a-date');
    expect(input(host).value).toBe('');
  });

  it('propagates typed values through CVA and marks touched on blur', () => {
    const fixture = create();
    const changes: string[] = [];
    let touched = 0;
    fixture.componentInstance.registerOnChange((value) => changes.push(value));
    fixture.componentInstance.registerOnTouched(() => {
      touched += 1;
    });
    fixture.componentInstance.writeValue('2026-01-31');
    expect(fixture.componentInstance.value()).toBe('2026-01-31');

    const native = input(fixture);
    native.value = '2026-02-15';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(changes).toEqual(['2026-02-15']);
    expect(fixture.componentInstance.value()).toBe('2026-02-15');

    native.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(touched).toBe(1);
  });

  it('renders helper text, errors, and wires the aria relationships', () => {
    const fixture = create();
    fixture.componentRef.setInput('label', 'Start date');
    fixture.componentRef.setInput('helperText', 'Format yyyy-MM-dd');
    fixture.componentRef.setInput('error', 'Required field');
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector(
      'small[role="alert"]',
    ) as HTMLElement;
    expect(error.textContent?.trim()).toBe('Required field');
    // The error replaces the helper text.
    expect(fixture.nativeElement.textContent).not.toContain(
      'Format yyyy-MM-dd',
    );

    const native = input(fixture);
    expect(native.getAttribute('aria-invalid')).toBe('true');
    expect(native.getAttribute('aria-labelledby')).toMatch(/-label$/);

    fixture.componentRef.setInput('error', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Format yyyy-MM-dd');
    expect(native.getAttribute('aria-describedby')).toMatch(/-helper$/);
    expect(native.getAttribute('aria-invalid')).toBe('false');
  });

  it('applies the forms disabled handshake to the native input', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', '2026-01-01');
    fixture.componentRef.setInput('max', '2026-12-31');
    fixture.detectChanges();

    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(input(fixture).disabled).toBeTrue();

    fixture.componentInstance.setDisabledState(false);
    fixture.detectChanges();
    expect(input(fixture).disabled).toBeFalse();
    expect(input(fixture).getAttribute('min')).toBe('2026-01-01');
    expect(input(fixture).getAttribute('max')).toBe('2026-12-31');
  });
});
