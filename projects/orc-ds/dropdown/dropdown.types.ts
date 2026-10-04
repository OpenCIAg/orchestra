export interface DropdownItem {
  id?: string;
  label: string;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  action?: () => void;
  /**
   * @deprecated Dropdown renders a flat action menu and ignores this collection.
   * Use `TieredMenuComponent` with its `items` model for supported submenu
   * behavior (root items and one child level). The owning item remains an
   * ordinary actionable Dropdown item.
   */
  children?: DropdownItem[];
}
