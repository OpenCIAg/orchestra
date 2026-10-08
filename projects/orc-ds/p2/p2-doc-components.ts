/**
 * Narrow docs-only P2 facade. It preserves component identity with the docs'
 * secondary-entrypoint imports while leaving menu-family modules to the
 * deferred preview.
 */
export {
  CalendarComponent,
  ComboboxComponent,
  DateInputComponent,
  InputGroupComponent,
  ListboxComponent,
  TagsInputComponent,
} from './p2-form-components';
export { MultiSelectComponent } from './p2-multi-select-component';
export {
  AspectRatioComponent,
  BoxComponent,
  ButtonGroupComponent,
  ContainerComponent,
  FlexComponent,
  GridComponent,
  KbdComponent,
  LinkComponent,
  SpaceComponent,
  StackComponent,
  TextComponent,
  TypographyComponent,
  VisuallyHiddenComponent,
} from './p2-layout-components';
export {
  CodeComponent,
  EmptyStateComponent,
  HoverCardComponent,
  MenubarComponent,
  TagComponent,
  VirtualScrollerComponent,
} from './p2-data-components';
export { DataTableComponent } from './p2-data-table-component';
export {
  ContextMenuComponent,
  FloatingActionButtonComponent,
} from './p2-overlay-components';
export { PortalComponent } from './p2-portal-component';
export { SplitterComponent } from './p2-splitter-component';
export { DataViewComponent } from './p2-data-view-component';
export { SegmentedControlComponent } from './p2-selection-components';
export { TreeSelectComponent } from './p2-tree-select-component';
export { SpeedDialComponent } from './p2-speed-dial-component';
export { TreeComponent } from './p2-tree-component';
export { TreeTableComponent } from './p2-tree-table-component';
export {
  GalleriaComponent,
  OrderListComponent,
  PickListComponent,
} from './p2-list-gallery-components';
export { CascadeSelectComponent } from './p2-cascade-select-component';
export { EditorComponent } from './p2-editor-component';
export { MenuComponent } from './p2-advanced-components';
export { ScrollTopComponent } from './p2-primeng-gap-components';

export type { ContextMenuItem } from './p2-overlay-components';
export type { SplitterPanel } from './p2-splitter-component';
export type { DataTableColumn } from './p2-data-table-component';
export type { MenubarItem } from './p2-data-components';
export type { HierarchyNode } from './p2-tree-component';
export type { TreeTableColumn } from './p2-tree-table-component';
export type { TreeSelectNode } from './p2-tree-select-component';
export type { P2Option } from './p2-shared';
export type { SpeedDialAction } from './p2-speed-dial-component';
export type { GalleryImage } from './p2-galleria-component';
export type { PrimeMenuItem } from './p2-advanced-components';
