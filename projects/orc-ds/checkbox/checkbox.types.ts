export interface CheckboxChangeEvent<T = any> {
  checked: boolean;
  indeterminate: boolean;
  value?: T;
}

export type CheckboxAriaChecked = 'true' | 'false' | 'mixed';
