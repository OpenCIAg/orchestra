import { Component, forwardRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CvaControl } from './cva-control';

/** Minimal concrete control exercising the base through the forms API. */
@Component({
  selector: 'test-cva-control',
  standalone: true,
  template:
    '<input [value]="value()" [disabled]="effectiveDisabled()" (input)="onInput($event)" (blur)="markTouched()" />',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TestControlComponent),
      multi: true,
    },
  ],
})
class TestControlComponent extends CvaControl {
  readonly value = signal('');
  readonly selfDisabled = signal(false);
  protected override isSelfDisabled(): boolean {
    return this.selfDisabled();
  }
  override writeValue(value: unknown): void {
    this.value.set(String(value ?? ''));
  }
  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.cvaOnChange(next);
  }
  markTouched(): void {
    this.cvaOnTouched();
  }
}

@Component({
  selector: 'test-cva-host',
  standalone: true,
  imports: [ReactiveFormsModule, TestControlComponent],
  template: '<test-cva-control [formControl]="control" />',
})
class TestHostComponent {
  readonly control = new FormControl('start', { nonNullable: true });
}

describe('CvaControl shared ControlValueAccessor base', () => {
  function setup() {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const controlComponent = fixture.debugElement.query(
      (element) => element.componentInstance instanceof TestControlComponent,
    ).componentInstance as TestControlComponent;
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    return { fixture, controlComponent, input };
  }

  it('receives values written by a bound FormControl', () => {
    const { fixture, controlComponent } = setup();
    expect(controlComponent.value()).toBe('start');
    fixture.componentInstance.control.setValue('next');
    fixture.detectChanges();
    expect(controlComponent.value()).toBe('next');
  });

  it('propagates user edits and touch to the bound FormControl', () => {
    const { fixture, input } = setup();
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    const control = fixture.componentInstance.control;
    expect(control.value).toBe('typed');
    expect(control.touched).toBe(true);
  });

  it('keeps value edits safe before Angular registers callbacks', () => {
    const controlComponent = new TestControlComponent();
    expect(() => {
      controlComponent.onInput({
        target: { value: 'early' },
      } as unknown as Event);
      controlComponent.markTouched();
    }).not.toThrow();
    expect(controlComponent.value()).toBe('early');
  });

  it('mirrors FormControl disabled state through effectiveDisabled', () => {
    const { fixture, controlComponent, input } = setup();
    expect(controlComponent.effectiveDisabled()).toBe(false);
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(controlComponent.effectiveDisabled()).toBe(true);
    expect(input.disabled).toBe(true);
    fixture.componentInstance.control.enable();
    fixture.detectChanges();
    expect(controlComponent.effectiveDisabled()).toBe(false);
    expect(input.disabled).toBe(false);
  });

  it('combines the control disabled input with the forms disabled state', () => {
    const { fixture, controlComponent } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(controlComponent.effectiveDisabled()).toBe(true);
    fixture.componentInstance.control.enable();
    controlComponent.selfDisabled.set(true);
    fixture.detectChanges();
    expect(controlComponent.effectiveDisabled()).toBe(true);
  });
});
