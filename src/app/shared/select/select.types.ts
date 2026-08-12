// src/app/shared/select/select.types.ts

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectStatus = 'default' | 'error' | 'success';

export interface SelectOptionItem<T = any> {
  label: string;
  value: T;
  description?: string;
  icon?: string;
  avatarUrl?: string;
  group?: string;
  disabled?: boolean;
}
