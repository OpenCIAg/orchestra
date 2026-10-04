/**
 * Shared menu item model for the menu family (Menu, TieredMenu,
 * PanelMenu, MegaMenu). Lives on the internal entry point so canonical
 * menu directories can share it without importing the p2 monolith; the
 * p2 surface keeps re-exporting it.
 */
export interface PrimeMenuItem {
  /** Menu destinations apply to leaf items; items with children remain disclosure buttons. */
  label: string;
  value?: string;
  icon?: string;
  disabled?: boolean;
  visible?: boolean;
  url?: string;
  target?: string;
  badge?: string;
  separator?: boolean;
  items?: PrimeMenuItem[];
  command?: () => void;
}
