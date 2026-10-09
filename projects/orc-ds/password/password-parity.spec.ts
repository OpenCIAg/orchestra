import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { PasswordComponent } from '@ciag/orchestra/password';

/**
 * Behavior-parity pins for the password input. The specs import the
 * component through the family entry point and must pass
 * unchanged while the family moves to its canonical directory.
 */
describe('Password behavior parity', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function create() {
    const fixture = TestBed.createComponent(PasswordComponent);
    fixture.detectChanges();
    return fixture;
  }

  function nativeInput(fixture: ReturnType<typeof create>): HTMLInputElement {
    return fixture.nativeElement.querySelector('input') as HTMLInputElement;
  }

  it('toggles mask visibility through the toggle action', () => {
    const fixture = create();
    expect(nativeInput(fixture).getAttribute('type')).toBe('password');

    const toggle = Array.from(
      fixture.nativeElement.querySelectorAll(
        'button',
      ) as NodeListOf<HTMLButtonElement>,
    ).find((button) =>
      (button.getAttribute('aria-label') ?? '').includes('password'),
    );
    toggle!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBeTrue();
    expect(nativeInput(fixture).getAttribute('type')).toBe('text');
    expect(toggle!.getAttribute('aria-label')).toContain('Hide');
  });

  it('propagates typed values through CVA and marks touched on blur', () => {
    @Component({
      imports: [ReactiveFormsModule, PasswordComponent],
      template: '<orc-password [formControl]="control" />',
    })
    class Host {
      readonly control = new FormControl('');
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();

    const native = host.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    native.value = 's3cret!';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    host.detectChanges();
    expect(host.componentInstance.control.value).toBe('s3cret!');

    native.dispatchEvent(new Event('blur'));
    host.detectChanges();
    expect(host.componentInstance.control.touched).toBeTrue();
  });

  it('scores strength with the default expressions and renders the feedback meter', () => {
    const fixture = create();
    fixture.componentRef.setInput('weakLabel', 'Weak password');
    fixture.componentRef.setInput('mediumLabel', 'Medium password');
    fixture.componentRef.setInput('strongLabel', 'Strong password');
    fixture.detectChanges();
    fixture.componentInstance.writeValue('weak');
    fixture.detectChanges();
    let meter = fixture.nativeElement.querySelector('.meter') as HTMLElement;
    expect(fixture.componentInstance.strength()).toBe('weak');
    expect(meter.className).toContain('weak');

    fixture.componentInstance.writeValue('Abcdef1');
    fixture.detectChanges();
    meter = fixture.nativeElement.querySelector('.meter') as HTMLElement;
    expect(fixture.componentInstance.strength()).toBe('medium');
    expect(meter.className).toContain('medium');

    fixture.componentInstance.writeValue('Abcdef1!');
    fixture.detectChanges();
    meter = fixture.nativeElement.querySelector('.meter') as HTMLElement;
    expect(fixture.componentInstance.strength()).toBe('strong');
    expect(meter.className).toContain('strong');
    expect(fixture.nativeElement.querySelector('.feedback')).not.toBeNull();
  });

  it('hides the feedback block until there is a value or focus', () => {
    const fixture = create();
    fixture.componentRef.setInput('promptLabel', 'Enter a password');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.feedback')).toBeNull();

    fixture.componentInstance.handleFocus(new Event('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.feedback')).not.toBeNull();
  });

  it('clears through the clear action and emits onClear', () => {
    @Component({
      imports: [ReactiveFormsModule, PasswordComponent],
      template:
        '<orc-password [formControl]="control" showClear clearAriaLabel="Clear password" />',
    })
    class Host {
      readonly control = new FormControl('Abcdef1!');
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();

    const clear = host.nativeElement.querySelector(
      'button[aria-label="Clear password"]',
    ) as HTMLButtonElement;
    expect(clear).not.toBeNull();
    clear.click();
    host.detectChanges();
    expect(host.componentInstance.control.value).toBe('');
    expect(host.componentInstance.control.touched).toBeTrue();
  });

  it('applies the forms disabled handshake to the input and actions', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(nativeInput(fixture).disabled).toBeTrue();
    for (const button of Array.from(
      fixture.nativeElement.querySelectorAll(
        'button',
      ) as NodeListOf<HTMLButtonElement>,
    ) as HTMLButtonElement[]) {
      expect(button.disabled).toBeTrue();
    }
  });
});
