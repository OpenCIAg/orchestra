// src/app/shared/select/select.types.ts

/**
 * Select size on the canonical `sm | md | lg` scale (`md` renders as the
 * default middle size). During the compatibility window the PrimeNG-era
 * `small | large` aliases are also accepted and normalize onto `sm | lg`.
 * Deprecated legacy values (removed at the 23.0.0 gate): `small` → `sm`,
 * `large` → `lg`.
 */
export type SelectSize = 'sm' | 'md' | 'lg' | 'small' | 'large';
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
