import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { OverlayBadgeComponent } from '@ciag/orchestra/overlay-badge';
import { PasswordComponent } from '@ciag/orchestra/password';

@Component({
  standalone: true,
  imports: [PasswordComponent, ReactiveFormsModule],
  template: `
    <orc-password
      [formControl]="control"
      label="Account password"
      [required]="true"
      [readonly]="isReadonly()"
      [showClear]="true"
      clearAriaLabel="Clear password"
      [toggleMask]="true"
      showPasswordLabel="Show password"
      hidePasswordLabel="Hide password"
      styleClass="password-custom"
      inputStyleClass="native-password"
      [fluid]="true"
      variant="filled"
      size="large"
      weakLabel="Weak"
      mediumLabel="Medium"
      strongLabel="Strong"
      (onClear)="clearCount = clearCount + 1"
    />
  `,
})
class PasswordFormHost {
  readonly control = new FormControl('initial secret', { nonNullable: true });
  readonly isReadonly = signal(false);
  clearCount = 0;
}

describe('P2 PrimeNG gap control contracts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [OverlayBadgeComponent, PasswordComponent, ReactiveFormsModule],
    }),
  );

  it('shows numeric zero as an accessible badge instead of converting it to a dot', () => {
    const fixture = TestBed.createComponent(OverlayBadgeComponent);
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector(
      '.orc-p2-overlay-badge__value',
    ) as HTMLElement;

    expect(badge.textContent).toBe('0');
    expect(badge.classList.contains('dot')).toBeFalse();
    expect(badge.getAttribute('role')).toBe('img');
    expect(badge.getAttribute('aria-label')).toBe('0');
  });

  it('keeps an unlabeled dot decorative and allows an explicit accessible name', () => {
    const fixture = TestBed.createComponent(OverlayBadgeComponent);
    fixture.detectChanges();
    let badge = fixture.nativeElement.querySelector(
      '.orc-p2-overlay-badge__value',
    ) as HTMLElement;

    expect(badge.classList.contains('dot')).toBeTrue();
    expect(badge.getAttribute('aria-hidden')).toBe('true');

    fixture.componentRef.setInput('ariaLabel', 'Unread notifications');
    fixture.detectChanges();
    badge = fixture.nativeElement.querySelector(
      '.orc-p2-overlay-badge__value',
    ) as HTMLElement;
    expect(badge.getAttribute('role')).toBe('img');
    expect(badge.getAttribute('aria-label')).toBe('Unread notifications');
    expect(badge.hasAttribute('aria-hidden')).toBeFalse();
  });

  it('integrates Password with Reactive Forms and associates its required label', () => {
    const fixture = TestBed.createComponent(PasswordFormHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    const label = root.querySelector('label') as HTMLLabelElement;
    const wrapper = root.querySelector('.orc-p2-password') as HTMLElement;

    expect(input.value).toBe('initial secret');
    expect(input.required).toBeTrue();
    expect(input.id).toBeTruthy();
    expect(label.htmlFor).toBe(input.id);
    expect(wrapper.classList.contains('orc-p2-password')).toBeTrue();
    expect(wrapper.classList.contains('password-custom')).toBeTrue();
    expect(wrapper.classList.contains('variant-filled')).toBeTrue();
    expect(wrapper.classList.contains('size-large')).toBeTrue();
    expect(wrapper.classList.contains('fluid')).toBeTrue();
    expect(root.querySelector('.meter.weak')).not.toBeNull();

    fixture.componentInstance.control.setValue('server update');
    fixture.detectChanges();
    expect(input.value).toBe('server update');

    input.value = 'user update';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('user update');

    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.control.touched).toBeTrue();
    const clear = root.querySelector(
      '[aria-label="Clear password"]',
    ) as HTMLButtonElement;
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('');
    expect(fixture.componentInstance.clearCount).toBe(1);
  });

  it('toggles Password visibility, blocks readonly clearing, and honors form-disabled state', () => {
    const fixture = TestBed.createComponent(PasswordFormHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    const show = fixture.nativeElement.querySelector(
      '[aria-label="Show password"]',
    ) as HTMLButtonElement;
    show.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(
      fixture.nativeElement.querySelector('[aria-label="Hide password"]'),
    ).not.toBeNull();

    fixture.componentInstance.isReadonly.set(true);
    fixture.detectChanges();
    const clear = fixture.nativeElement.querySelector(
      '[aria-label="Clear password"]',
    ) as HTMLButtonElement;
    expect(input.readOnly).toBeTrue();
    expect(clear.disabled).toBeTrue();
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('initial secret');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBeTrue();
    expect(
      (
        fixture.nativeElement.querySelector(
          '[aria-label="Hide password"]',
        ) as HTMLButtonElement
      ).disabled,
    ).toBeTrue();
  });
});
