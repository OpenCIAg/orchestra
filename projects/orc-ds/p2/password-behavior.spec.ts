import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { PasswordComponent } from './p2-primeng-gap-components';

@Component({
  standalone: true,
  imports: [PasswordComponent, ReactiveFormsModule],
  template: `
    <orc-password
      [formControl]="control"
      [required]="required()"
      [variant]="variant()"
      [size]="size()"
      [showPasswordLabel]="showLabel()"
      [hidePasswordLabel]="hideLabel()"
      [toggleMask]="toggleMask()"
    />
  `,
})
class PasswordHost {
  readonly control = new FormControl('initial secret', { nonNullable: true });
  readonly required = signal(true);
  readonly variant = signal<'filled' | 'outlined'>('outlined');
  readonly size = signal<'small' | 'large' | undefined>('large');
  readonly showLabel = signal<string | undefined>(undefined);
  readonly hideLabel = signal<string | undefined>(undefined);
  readonly toggleMask = signal(true);
}

describe('PasswordComponent behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PasswordHost],
    }),
  );

  it('renders required, variant, and size inputs as native and wrapper contracts', () => {
    const fixture = TestBed.createComponent(PasswordHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const wrapper = root.querySelector('.orc-p2-password') as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;

    expect(input.required).toBeTrue();
    expect(wrapper.classList.contains('variant-outlined')).toBeTrue();
    expect(wrapper.classList.contains('size-large')).toBeTrue();

    fixture.componentInstance.required.set(false);
    fixture.componentInstance.variant.set('filled');
    fixture.componentInstance.size.set('small');
    fixture.detectChanges();

    expect(input.required).toBeFalse();
    expect(wrapper.classList.contains('variant-outlined')).toBeFalse();
    expect(wrapper.classList.contains('variant-filled')).toBeTrue();
    expect(wrapper.classList.contains('size-large')).toBeFalse();
    expect(wrapper.classList.contains('size-small')).toBeTrue();
  });

  it('provides accessible default toggle labels and keeps custom labels independently overridable', () => {
    const fixture = TestBed.createComponent(PasswordHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    let toggle = root.querySelector('.control button') as HTMLButtonElement;

    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    toggle = root.querySelector('.control button') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');

    fixture.componentInstance.showLabel.set('Reveal secret');
    fixture.componentInstance.hideLabel.set(undefined);
    toggle.click();
    fixture.detectChanges();
    toggle = root.querySelector('.control button') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Reveal secret');
    expect(input.type).toBe('password');
  });

  it('keeps ControlValueAccessor state synchronized in both directions and honors disabled state', () => {
    const fixture = TestBed.createComponent(PasswordHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('initial secret');
    fixture.componentInstance.control.setValue('server secret');
    fixture.detectChanges();
    expect(input.value).toBe('server secret');

    input.value = 'typed secret';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('typed secret');

    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.control.touched).toBeTrue();

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBeTrue();
    expect(
      (root.querySelector('.control button') as HTMLButtonElement).disabled,
    ).toBeTrue();
  });

  it('does not render a visibility control when toggleMask is disabled', () => {
    const fixture = TestBed.createComponent(PasswordHost);
    fixture.componentInstance.toggleMask.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.control button')).toBeNull();
  });

  it('marks the CVA touched when the clear action changes the password', () => {
    const fixture = TestBed.createComponent(PasswordComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('showClear', true);
    fixture.componentRef.setInput('clearAriaLabel', 'Clear password');
    component.writeValue('secret');
    const touched = jasmine.createSpy('touched');
    const changed = jasmine.createSpy('changed');
    component.registerOnTouched(touched);
    component.registerOnChange(changed);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector(
        '[aria-label="Clear password"]',
      ) as HTMLButtonElement
    ).click();
    expect(component.value()).toBe('');
    expect(changed).toHaveBeenCalledWith('');
    expect(touched).toHaveBeenCalledTimes(1);
  });
});
