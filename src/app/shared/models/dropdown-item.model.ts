// src/app/shared/models/dropdown-item.model.ts

export interface DropdownItem {
  /** Display label */
  label: string;
  /** Optional icon class or name */
  icon?: string;
  /** Optional keyboard shortcut text (e.g. "Ctrl+S") */
  shortcut?: string;
  /** If true, renders with danger styling */
  danger?: boolean;
  /** If true, item is disabled */
  disabled?: boolean;
  /** Action callback when item is selected */
  action?: () => void;
  /** Nested submenu items */
  children?: DropdownItem[];
}
