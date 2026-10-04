import { InjectionToken } from '@angular/core';

/** Narrow parent contract used by projected options. */
export interface SelectHost {
  onOptionSelected(option: { value(): any }, event?: Event): void;
  setActiveOption(option: { value(): any }): void;
}

export const SELECT_HOST = new InjectionToken<SelectHost>('ORC_SELECT_HOST');
