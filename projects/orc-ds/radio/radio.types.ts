import { ElementRef, InjectionToken, Signal } from '@angular/core';

export interface RadioButtonItem {
  readonly value: Signal<any>;
  readonly isDisabled: Signal<boolean>;
  readonly element: ElementRef<HTMLElement>;
  focus(): void;
  onSelect(event?: Event): void;
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
  touch(event?: Event): void;
}

export const ORC_RADIO_GROUP = new InjectionToken<RadioGroupContext>(
  'ORC_RADIO_GROUP',
);
