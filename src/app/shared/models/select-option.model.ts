// src/app/shared/models/select-option.model.ts

export interface SelectOption<T = any> {
  /** Display label for the option */
  label: string;
  /** Underlying value */
  value: T;
  /** Optional icon class or name */
  icon?: string;
  /** Optional avatar image url */
  avatarUrl?: string;
  /** Optional group identifier for optgroup support */
  group?: string;
  /** Disable this option */
  disabled?: boolean;
}
