/**
 * Compatibility surface: the data/display families live in their canonical
 * directories; these re-exports keep every p2 entry symbol unchanged.
 */
export { CodeComponent } from '@ciag/orchestra/code';
export { HoverCardComponent } from '@ciag/orchestra/hover-card';
export { VirtualScrollerComponent } from '@ciag/orchestra/virtual-scroller';

export { MenubarComponent } from './p2-menubar-component';
export type { MenubarItem } from './p2-menubar-component';

export { TagComponent } from '@ciag/orchestra/tag';
export type { TagVariant } from '@ciag/orchestra/tag';

export { DataTableComponent } from './p2-data-table-component';
export type { DataTableColumn } from './p2-data-table-component';

export { EmptyStateComponent } from '@ciag/orchestra/empty-state';
