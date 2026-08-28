import { InjectionToken, Signal } from '@angular/core';

export interface OtpInputContext {
  readonly length: Signal<number>;
  readonly inputMode: Signal<'numeric' | 'text'>;
  readonly placeholder: Signal<string>;
  readonly ariaLabel: Signal<string | undefined>;
  readonly readonly: Signal<boolean>;
  readonly tabindex: Signal<number | null>;
  readonly mask: Signal<boolean>;
  readonly autofocus: Signal<boolean>;
  readonly isDisabled: Signal<boolean>;
  readonly inputValues: Signal<string[]>;
  onSlotInput(event: Event, index: number): void;
  onSlotKeyDown(event: KeyboardEvent, index: number): void;
  onSlotPaste(event: ClipboardEvent, index: number): void;
  onSlotFocus(index: number): void;
  onSlotFocusEvent(event: Event): void;
  onSlotBlur(event: Event): void;
}

export const ORC_OTP_INPUT = new InjectionToken<OtpInputContext>('ORC_OTP_INPUT');
