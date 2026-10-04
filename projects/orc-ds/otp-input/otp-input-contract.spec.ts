import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OtpInputComponent } from './otp-input.component';

@Component({
  standalone: true,
  imports: [OtpInputComponent, ReactiveFormsModule],
  template: '<orc-otp-input [length]="4" [formControl]="control" />',
})
class OtpFormHostComponent {
  readonly control = new FormControl('', { updateOn: 'blur' });
}

describe('OtpInput interaction and accessibility contracts', () => {
  let fixture: ComponentFixture<OtpInputComponent>;

  function createOtp(inputs: Record<string, unknown> = {}): HTMLInputElement[] {
    fixture = TestBed.createComponent(OtpInputComponent);
    for (const [name, value] of Object.entries(inputs))
      fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return Array.from(
      fixture.nativeElement.querySelectorAll('input'),
    ) as HTMLInputElement[];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpInputComponent, OtpFormHostComponent],
    }).compileComponents();
  });

  it('keeps the group accessible and hides the visual separator from assistive technology', () => {
    const inputs = createOtp({ length: 4, ariaLabel: 'Verification code' });
    const group = fixture.nativeElement.querySelector(
      '[role="group"]',
    ) as HTMLElement;
    const separator = fixture.nativeElement.querySelector(
      'orc-otp-separator [aria-hidden="true"]',
    ) as HTMLElement;

    expect(group.getAttribute('aria-label')).toBe('Verification code');
    expect(inputs.map((input) => input.getAttribute('aria-label'))).toEqual([
      'Verification code 1',
      'Verification code 2',
      'Verification code 3',
      'Verification code 4',
    ]);
    expect(separator).not.toBeNull();
    expect(separator.getAttribute('aria-hidden')).toBe('true');
  });

  it('marks the CVA touched only after focus leaves the whole slot group', () => {
    const inputs = createOtp({ length: 3 });
    const touched = jasmine.createSpy('touched');
    const focused = jasmine.createSpy('focused');
    const blurred = jasmine.createSpy('blurred');
    fixture.componentInstance.registerOnTouched(touched);
    fixture.componentInstance.onFocus.subscribe(focused);
    fixture.componentInstance.onBlur.subscribe(blurred);

    inputs[0].dispatchEvent(new FocusEvent('focus'));
    inputs[0].dispatchEvent(
      new FocusEvent('blur', { relatedTarget: inputs[1] }),
    );
    inputs[1].dispatchEvent(
      new FocusEvent('focus', { relatedTarget: inputs[0] }),
    );
    expect(touched).not.toHaveBeenCalled();
    expect(focused).toHaveBeenCalledTimes(2);
    expect(blurred).toHaveBeenCalledTimes(1);

    inputs[1].dispatchEvent(
      new FocusEvent('blur', { relatedTarget: document.body }),
    );
    expect(touched).toHaveBeenCalledTimes(1);
    expect(blurred).toHaveBeenCalledTimes(2);
  });

  it('keeps focus movement inside a same-origin iframe slot group untouched', () => {
    createOtp({ length: 3 });
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const frameDocument = iframe.contentDocument;
    if (!frameDocument)
      throw new Error('same-origin iframe document unavailable');
    const frameHost = frameDocument.createElement('div');
    const first = frameDocument.createElement('input');
    const second = frameDocument.createElement('input');
    frameHost.append(first, second);
    frameDocument.body.appendChild(frameHost);
    (
      fixture.componentInstance as unknown as {
        hostElement: ElementRef<HTMLElement>;
      }
    ).hostElement = new ElementRef(frameHost);
    const touched = jasmine.createSpy('touched');
    fixture.componentInstance.registerOnTouched(touched);

    fixture.componentInstance.onSlotBlur(
      new FocusEvent('blur', { relatedTarget: second }),
    );

    expect(touched).not.toHaveBeenCalled();
    iframe.remove();
  });

  it('does not commit updateOn blur values during an internal focus move', () => {
    const hostFixture = TestBed.createComponent(OtpFormHostComponent);
    hostFixture.detectChanges();
    const inputs = Array.from(
      hostFixture.nativeElement.querySelectorAll('input'),
    ) as HTMLInputElement[];
    const first = inputs[0];
    first.value = '7';
    first.dispatchEvent(new Event('input', { bubbles: true }));
    expect(hostFixture.componentInstance.control.value).toBe('');

    first.dispatchEvent(new FocusEvent('blur', { relatedTarget: inputs[1] }));
    expect(hostFixture.componentInstance.control.value).toBe('');
    inputs[1].dispatchEvent(new FocusEvent('focus', { relatedTarget: first }));
    inputs[1].dispatchEvent(
      new FocusEvent('blur', { relatedTarget: document.body }),
    );
    expect(hostFixture.componentInstance.control.value).toBe('7');
  });

  it('blocks input, paste, and Backspace mutations while readonly', () => {
    const inputs = createOtp({ length: 3, readonly: true });
    fixture.componentInstance.writeValue('123');
    fixture.detectChanges();
    const changed = jasmine.createSpy('changed');
    fixture.componentInstance.registerOnChange(changed);

    inputs[1].value = '9';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    const paste = new Event('paste', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => '987' },
    });
    inputs[1].dispatchEvent(paste);
    const backspace = new KeyboardEvent('keydown', {
      key: 'Backspace',
      bubbles: true,
      cancelable: true,
    });
    inputs[1].dispatchEvent(backspace);

    expect(fixture.componentInstance.value()).toBe('123');
    expect(fixture.componentInstance.inputValues()).toEqual(['1', '2', '3']);
    expect(changed).not.toHaveBeenCalled();
    expect(paste.defaultPrevented).toBeTrue();
    expect(backspace.defaultPrevented).toBeTrue();
  });

  it('blocks input, paste, and Backspace mutations while disabled', () => {
    const inputs = createOtp({ length: 3, disabled: true });
    fixture.componentInstance.writeValue('123');
    fixture.detectChanges();
    const changed = jasmine.createSpy('changed');
    fixture.componentInstance.registerOnChange(changed);

    inputs[1].value = '9';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    const paste = new Event('paste', {
      bubbles: true,
      cancelable: true,
    }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => '987' },
    });
    inputs[1].dispatchEvent(paste);
    const backspace = new KeyboardEvent('keydown', {
      key: 'Backspace',
      bubbles: true,
      cancelable: true,
    });
    inputs[1].dispatchEvent(backspace);

    expect(fixture.componentInstance.value()).toBe('123');
    expect(changed).not.toHaveBeenCalled();
    expect(inputs.every((input) => input.disabled)).toBeTrue();
    expect(paste.defaultPrevented).toBeTrue();
    expect(backspace.defaultPrevented).toBeTrue();
  });

  it('waits for IME composition to finish before updating and advancing a text slot', () => {
    const inputs = createOtp({ length: 3, inputMode: 'text' });
    inputs[0].focus();
    inputs[0].value = 'あ';
    inputs[0].dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        data: 'あ',
        isComposing: true,
      }),
    );

    expect(fixture.componentInstance.value()).toBe('');
    expect(inputs[0].value).toBe('あ');
    expect(document.activeElement).toBe(inputs[0]);

    inputs[0].dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        data: 'あ',
        isComposing: false,
      }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('あ');
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('accepts numeric slot input, filters non-digits, and advances focus', () => {
    const inputs = createOtp({ length: 3, inputMode: 'numeric' });
    const changes: string[] = [];
    fixture.componentInstance.registerOnChange((value) => changes.push(value));
    inputs[0].focus();
    inputs[0].value = '7x';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('7');
    expect(fixture.componentInstance.inputValues()).toEqual(['7', '', '']);
    expect(inputs[0].value).toBe('7');
    expect(document.activeElement).toBe(inputs[1]);
    expect(changes).toEqual(['7']);
  });

  it('moves between OTP slots with arrow keys and leaves edge keys unhandled', () => {
    const inputs = createOtp({ length: 3 });
    inputs[1].focus();

    const moveLeft = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    inputs[1].dispatchEvent(moveLeft);
    expect(document.activeElement).toBe(inputs[0]);
    expect(moveLeft.defaultPrevented).toBeTrue();

    const moveRight = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    inputs[0].dispatchEvent(moveRight);
    expect(document.activeElement).toBe(inputs[1]);
    expect(moveRight.defaultPrevented).toBeTrue();

    const leftAtStart = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    });
    inputs[0].dispatchEvent(leftAtStart);
    expect(leftAtStart.defaultPrevented).toBeFalse();

    const rightAtEnd = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    inputs[2].dispatchEvent(rightAtEnd);
    expect(rightAtEnd.defaultPrevented).toBeFalse();
  });

  it('prevents the native Backspace after clearing a populated slot once', () => {
    const inputs = createOtp({ length: 3 });
    fixture.componentInstance.writeValue('123');
    fixture.detectChanges();
    const changes: string[] = [];
    fixture.componentInstance.registerOnChange((value) => changes.push(value));

    const backspace = new KeyboardEvent('keydown', {
      key: 'Backspace',
      bubbles: true,
      cancelable: true,
    });
    inputs[1].dispatchEvent(backspace);
    fixture.detectChanges();

    expect(backspace.defaultPrevented).toBeTrue();
    expect(fixture.componentInstance.value()).toBe('13');
    expect(changes).toEqual(['13']);
  });
});
