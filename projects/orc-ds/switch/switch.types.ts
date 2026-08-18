export type SwitchSize = 'sm' | 'md' | 'lg';

export type SwitchLabelPosition = 'start' | 'end';

export interface SwitchChangeEvent<T = any> {
  originalEvent?: Event;
  checked: boolean;
  value?: T;
}
