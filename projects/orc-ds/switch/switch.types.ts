export type SwitchSize = 'sm' | 'md' | 'lg';

export type SwitchLabelPosition = 'start' | 'end';

export interface SwitchChangeEvent<T = any> {
  checked: boolean;
  value?: T;
}
