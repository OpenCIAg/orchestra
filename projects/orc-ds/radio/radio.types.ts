import { InjectionToken, Signal } from '@angular/core';

export interface RadioButtonItem {
  readonly value: Signal<any>;
  readonly isDisabled: Signal<boolean>;
  focus(): void;
}

export interface RadioGroupContext {
  readonly name: Signal<string>;
  readonly value: Signal<any>;
  readonly isDisabled: Signal<boolean>;
  readonly isError: Signal<boolean>;
  registerRadio(radio: RadioButtonItem): void;
  unregisterRadio(radio: RadioButtonItem): void;
  select(value: any, event?: Event): void;
  hasSelectedRadio(): boolean;
  isFirstEnabled(radio: RadioButtonItem): boolean;
  handleKeydown(event: KeyboardEvent, currentRadio: RadioButtonItem): void;
}

export const ORC_RADIO_GROUP = new InjectionToken<RadioGroupContext>('ORC_RADIO_GROUP');
