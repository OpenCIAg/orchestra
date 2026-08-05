export type BreadcrumbSeparator = 'chevron' | 'slash' | 'arrow';

export type BreadcrumbVariant = 'default' | 'underlined';

export interface BreadcrumbItemData {
  label: string;
  url?: string;
  routerLink?: string | any[];
  icon?: string;
  disabled?: boolean;
}
