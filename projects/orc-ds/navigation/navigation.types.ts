export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  disabled?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}
