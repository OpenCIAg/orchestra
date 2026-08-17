export interface SelectOption<T = any> {
  label: string;
  value: T;
  description?: string;
  icon?: string;
  avatarUrl?: string;
  group?: string;
  disabled?: boolean;
}
