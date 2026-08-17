export interface DropdownItem {
  id?: string;
  label: string;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  action?: () => void;
  children?: DropdownItem[];
}
