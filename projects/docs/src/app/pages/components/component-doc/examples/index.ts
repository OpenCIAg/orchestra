import { Type } from '@angular/core';

/**
 * Registry of authored live examples for the generic documentation page.
 * Each entry lazy-loads a dedicated example component that dogfoods the real
 * packaged library components; families without an entry fall back to the
 * renderer's empty state.
 */
export interface ComponentExample {
  readonly type: Type<unknown>;
  readonly inputs?: Readonly<Record<string, unknown>>;
}

export type ComponentExampleLoader = () => Promise<ComponentExample>;

function example<T>(type: Type<T>, inputs?: Readonly<Record<string, unknown>>) {
  return async (): Promise<ComponentExample> => ({ type, inputs });
}

export const COMPONENT_EXAMPLES: Readonly<
  Record<string, ComponentExampleLoader>
> = {
  'aspect-ratio': () =>
    import('./aspect-ratio-example.component').then((m) =>
      example(m.AspectRatioExampleComponent)(),
    ),
  autocomplete: () =>
    import('./autocomplete-example.component').then((m) =>
      example(m.AutocompleteExampleComponent)(),
    ),
  box: () =>
    import('./box-example.component').then((m) =>
      example(m.BoxExampleComponent)(),
    ),
  'button-group': () =>
    import('./button-group-example.component').then((m) =>
      example(m.ButtonGroupExampleComponent)(),
    ),
  calendar: () =>
    import('./calendar-example.component').then((m) =>
      example(m.CalendarExampleComponent)(),
    ),
  carousel: () =>
    import('./carousel-example.component').then((m) =>
      example(m.CarouselExampleComponent)(),
    ),
  'cascade-select': () =>
    import('./cascade-select-example.component').then((m) =>
      example(m.CascadeSelectExampleComponent)(),
    ),
  chart: () =>
    import('./chart-example.component').then((m) =>
      example(m.ChartExampleComponent)(),
    ),
  chip: () =>
    import('./chip-example.component').then((m) =>
      example(m.ChipExampleComponent)(),
    ),
  'close-button': () =>
    import('./close-button-example.component').then((m) =>
      example(m.CloseButtonExampleComponent)(),
    ),
  code: () =>
    import('./code-example.component').then((m) =>
      example(m.CodeExampleComponent)(),
    ),
  collapsible: () =>
    import('./collapsible-example.component').then((m) =>
      example(m.CollapsibleExampleComponent)(),
    ),
  combobox: () =>
    import('./combobox-example.component').then((m) =>
      example(m.ComboboxExampleComponent)(),
    ),
  'command-menu': () =>
    import('../menu-family-preview.component').then((m) =>
      example(m.MenuFamilyPreviewComponent, { componentId: 'command-menu' })(),
    ),
  container: () =>
    import('./container-example.component').then((m) =>
      example(m.ContainerExampleComponent)(),
    ),
  'context-menu': () =>
    import('./context-menu-example.component').then((m) =>
      example(m.ContextMenuExampleComponent)(),
    ),
  'data-table': () =>
    import('./data-table-example.component').then((m) =>
      example(m.DataTableExampleComponent)(),
    ),
  'data-view': () =>
    import('./data-view-example.component').then((m) =>
      example(m.DataViewExampleComponent)(),
    ),
  'date-input': () =>
    import('./date-input-example.component').then((m) =>
      example(m.DateInputExampleComponent)(),
    ),
  'color-picker': () =>
    import('./color-picker-example.component').then((m) =>
      example(m.ColorPickerExampleComponent)(),
    ),
  'date-picker': () =>
    import('./date-picker-example.component').then((m) =>
      example(m.DatePickerExampleComponent)(),
    ),
  divider: () =>
    import('./divider-example.component').then((m) =>
      example(m.DividerExampleComponent)(),
    ),
  drawer: () =>
    import('./drawer-example.component').then((m) =>
      example(m.DrawerExampleComponent)(),
    ),
  dropdown: () =>
    import('./dropdown-example.component').then((m) =>
      example(m.DropdownExampleComponent)(),
    ),
  editor: () =>
    import('./editor-example.component').then((m) =>
      example(m.EditorExampleComponent)(),
    ),
  'empty-state': () =>
    import('./empty-state-example.component').then((m) =>
      example(m.EmptyStateExampleComponent)(),
    ),
  'file-upload': () =>
    import('./file-upload-example.component').then((m) =>
      example(m.FileUploadExampleComponent)(),
    ),
  flex: () =>
    import('./flex-example.component').then((m) =>
      example(m.FlexExampleComponent)(),
    ),
  'floating-action-button': () =>
    import('./floating-action-button-example.component').then((m) =>
      example(m.FloatingActionButtonExampleComponent)(),
    ),
  form: () =>
    import('./form-example.component').then((m) =>
      example(m.FormExampleComponent)(),
    ),
  'form-field': () =>
    import('./form-field-example.component').then((m) =>
      example(m.FormFieldExampleComponent)(),
    ),
  grid: () =>
    import('./grid-example.component').then((m) =>
      example(m.GridExampleComponent)(),
    ),
  'hover-card': () =>
    import('./hover-card-example.component').then((m) =>
      example(m.HoverCardExampleComponent)(),
    ),
  icon: () =>
    import('../icon-catalog-preview.component').then((m) =>
      example(m.IconCatalogPreviewComponent)(),
    ),
  image: () =>
    import('./image-example.component').then((m) =>
      example(m.ImageExampleComponent)(),
    ),
  'input-group': () =>
    import('./input-group-example.component').then((m) =>
      example(m.InputGroupExampleComponent)(),
    ),
  kbd: () =>
    import('./kbd-example.component').then((m) =>
      example(m.KbdExampleComponent)(),
    ),
  link: () =>
    import('./link-example.component').then((m) =>
      example(m.LinkExampleComponent)(),
    ),
  list: () =>
    import('./list-example.component').then((m) =>
      example(m.ListExampleComponent)(),
    ),
  listbox: () =>
    import('./listbox-example.component').then((m) =>
      example(m.ListboxExampleComponent)(),
    ),
  'mega-menu': () =>
    import('../menu-family-preview.component').then((m) =>
      example(m.MenuFamilyPreviewComponent, { componentId: 'mega-menu' })(),
    ),
  menu: () =>
    import('./menu-example.component').then((m) =>
      example(m.MenuExampleComponent)(),
    ),
  menubar: () =>
    import('./menubar-example.component').then((m) =>
      example(m.MenubarExampleComponent)(),
    ),
  'multi-select': () =>
    import('./multi-select-example.component').then((m) =>
      example(m.MultiSelectExampleComponent)(),
    ),
  navigation: () =>
    import('./navigation-example.component').then((m) =>
      example(m.NavigationExampleComponent)(),
    ),
  'number-input': () =>
    import('./number-input-example.component').then((m) =>
      example(m.NumberInputExampleComponent)(),
    ),
  'panel-menu': () =>
    import('../menu-family-preview.component').then((m) =>
      example(m.MenuFamilyPreviewComponent, { componentId: 'panel-menu' })(),
    ),
  popover: () =>
    import('./popover-example.component').then((m) =>
      example(m.PopoverExampleComponent)(),
    ),
  portal: () =>
    import('./portal-example.component').then((m) =>
      example(m.PortalExampleComponent)(),
    ),
  'scroll-area': () =>
    import('./scroll-area-example.component').then((m) =>
      example(m.ScrollAreaExampleComponent)(),
    ),
  'segmented-control': () =>
    import('./segmented-control-example.component').then((m) =>
      example(m.SegmentedControlExampleComponent)(),
    ),
  separator: () =>
    import('./separator-example.component').then((m) =>
      example(m.SeparatorExampleComponent)(),
    ),
  space: () =>
    import('./space-example.component').then((m) =>
      example(m.SpaceExampleComponent)(),
    ),
  'speed-dial': () =>
    import('./speed-dial-example.component').then((m) =>
      example(m.SpeedDialExampleComponent)(),
    ),
  splitter: () =>
    import('./splitter-example.component').then((m) =>
      example(m.SplitterExampleComponent)(),
    ),
  stack: () =>
    import('./stack-example.component').then((m) =>
      example(m.StackExampleComponent)(),
    ),
  'tab-menu': () =>
    import('./tab-menu-example.component').then((m) =>
      example(m.TabMenuExampleComponent)(),
    ),
  tag: () =>
    import('./tag-example.component').then((m) =>
      example(m.TagExampleComponent)(),
    ),
  'tags-input': () =>
    import('./tags-input-example.component').then((m) =>
      example(m.TagsInputExampleComponent)(),
    ),
  terminal: () =>
    import('./terminal-example.component').then((m) =>
      example(m.TerminalExampleComponent)(),
    ),
  text: () =>
    import('./text-example.component').then((m) =>
      example(m.TextExampleComponent)(),
    ),
  timeline: () =>
    import('./timeline-example.component').then((m) =>
      example(m.TimelineExampleComponent)(),
    ),
  toolbar: () =>
    import('./toolbar-example.component').then((m) =>
      example(m.ToolbarExampleComponent)(),
    ),
  tree: () =>
    import('./tree-example.component').then((m) =>
      example(m.TreeExampleComponent)(),
    ),
  'tree-select': () =>
    import('./tree-select-example.component').then((m) =>
      example(m.TreeSelectExampleComponent)(),
    ),
  'tree-table': () =>
    import('./tree-table-example.component').then((m) =>
      example(m.TreeTableExampleComponent)(),
    ),
  'tree-view': () =>
    import('./tree-view-example.component').then((m) =>
      example(m.TreeViewExampleComponent)(),
    ),
  typography: () =>
    import('./typography-example.component').then((m) =>
      example(m.TypographyExampleComponent)(),
    ),
  'tiered-menu': () =>
    import('../menu-family-preview.component').then((m) =>
      example(m.MenuFamilyPreviewComponent, {
        componentId: 'tiered-menu',
      })(),
    ),
  'virtual-scroller': () =>
    import('./virtual-scroller-example.component').then((m) =>
      example(m.VirtualScrollerExampleComponent)(),
    ),
  'visually-hidden': () =>
    import('./visually-hidden-example.component').then((m) =>
      example(m.VisuallyHiddenExampleComponent)(),
    ),
};
