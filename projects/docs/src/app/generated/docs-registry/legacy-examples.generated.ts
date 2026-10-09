// GERADO — não edite. Fonte: projects/docs/src/app/content/components/
// (formato novo) e os arquivos legacy de catalog/ e pages/components/.
// Regenere com `npm run docs:generate-registry` (tools/docs/generate-registry.mjs).

import type { ComponentExampleLoader } from '../../models/component-doc.model';

/** Exemplo ao vivo da página genérica antiga, por id de família. */
export const COMPONENT_EXAMPLES: Readonly<
  Record<string, ComponentExampleLoader>
> = {
  autocomplete: () =>
    import('../../pages/components/component-doc/examples/autocomplete-example.component').then(
      (m) => ({ type: m.AutocompleteExampleComponent }),
    ),
  'button-group': () =>
    import('../../pages/components/component-doc/examples/button-group-example.component').then(
      (m) => ({ type: m.ButtonGroupExampleComponent }),
    ),
  calendar: () =>
    import('../../pages/components/component-doc/examples/calendar-example.component').then(
      (m) => ({ type: m.CalendarExampleComponent }),
    ),
  carousel: () =>
    import('../../pages/components/component-doc/examples/carousel-example.component').then(
      (m) => ({ type: m.CarouselExampleComponent }),
    ),
  chart: () =>
    import('../../pages/components/component-doc/examples/chart-example.component').then(
      (m) => ({ type: m.ChartExampleComponent }),
    ),
  chip: () =>
    import('../../pages/components/component-doc/examples/chip-example.component').then(
      (m) => ({ type: m.ChipExampleComponent }),
    ),
  'close-button': () =>
    import('../../pages/components/component-doc/examples/close-button-example.component').then(
      (m) => ({ type: m.CloseButtonExampleComponent }),
    ),
  code: () =>
    import('../../pages/components/component-doc/examples/code-example.component').then(
      (m) => ({ type: m.CodeExampleComponent }),
    ),
  collapsible: () =>
    import('../../pages/components/component-doc/examples/collapsible-example.component').then(
      (m) => ({ type: m.CollapsibleExampleComponent }),
    ),
  'color-picker': () =>
    import('../../pages/components/component-doc/examples/color-picker-example.component').then(
      (m) => ({ type: m.ColorPickerExampleComponent }),
    ),
  combobox: () =>
    import('../../pages/components/component-doc/examples/combobox-example.component').then(
      (m) => ({ type: m.ComboboxExampleComponent }),
    ),
  'command-menu': () =>
    import('../../pages/components/component-doc/examples/command-menu-example.component').then(
      (m) => ({ type: m.CommandMenuExampleComponent }),
    ),
  'context-menu': () =>
    import('../../pages/components/component-doc/examples/context-menu-example.component').then(
      (m) => ({ type: m.ContextMenuExampleComponent }),
    ),
  'data-table': () =>
    import('../../pages/components/component-doc/examples/data-table-example.component').then(
      (m) => ({ type: m.DataTableExampleComponent }),
    ),
  'date-input': () =>
    import('../../pages/components/component-doc/examples/date-input-example.component').then(
      (m) => ({ type: m.DateInputExampleComponent }),
    ),
  'date-picker': () =>
    import('../../pages/components/component-doc/examples/date-picker-example.component').then(
      (m) => ({ type: m.DatePickerExampleComponent }),
    ),
  divider: () =>
    import('../../pages/components/component-doc/examples/divider-example.component').then(
      (m) => ({ type: m.DividerExampleComponent }),
    ),
  drawer: () =>
    import('../../pages/components/component-doc/examples/drawer-example.component').then(
      (m) => ({ type: m.DrawerExampleComponent }),
    ),
  dropdown: () =>
    import('../../pages/components/component-doc/examples/dropdown-example.component').then(
      (m) => ({ type: m.DropdownExampleComponent }),
    ),
  editor: () =>
    import('../../pages/components/component-doc/examples/editor-example.component').then(
      (m) => ({ type: m.EditorExampleComponent }),
    ),
  'empty-state': () =>
    import('../../pages/components/component-doc/examples/empty-state-example.component').then(
      (m) => ({ type: m.EmptyStateExampleComponent }),
    ),
  'form-field': () =>
    import('../../pages/components/component-doc/examples/form-field-example.component').then(
      (m) => ({ type: m.FormFieldExampleComponent }),
    ),
  'hover-card': () =>
    import('../../pages/components/component-doc/examples/hover-card-example.component').then(
      (m) => ({ type: m.HoverCardExampleComponent }),
    ),
  icon: () =>
    import('../../pages/components/component-doc/examples/icon-example.component').then(
      (m) => ({ type: m.IconExampleComponent }),
    ),
  image: () =>
    import('../../pages/components/component-doc/examples/image-example.component').then(
      (m) => ({ type: m.ImageExampleComponent }),
    ),
  'input-group': () =>
    import('../../pages/components/component-doc/examples/input-group-example.component').then(
      (m) => ({ type: m.InputGroupExampleComponent }),
    ),
  kbd: () =>
    import('../../pages/components/component-doc/examples/kbd-example.component').then(
      (m) => ({ type: m.KbdExampleComponent }),
    ),
  link: () =>
    import('../../pages/components/component-doc/examples/link-example.component').then(
      (m) => ({ type: m.LinkExampleComponent }),
    ),
  list: () =>
    import('../../pages/components/component-doc/examples/list-example.component').then(
      (m) => ({ type: m.ListExampleComponent }),
    ),
  listbox: () =>
    import('../../pages/components/component-doc/examples/listbox-example.component').then(
      (m) => ({ type: m.ListboxExampleComponent }),
    ),
  menu: () =>
    import('../../pages/components/component-doc/examples/menu-example.component').then(
      (m) => ({ type: m.MenuExampleComponent }),
    ),
  menubar: () =>
    import('../../pages/components/component-doc/examples/menubar-example.component').then(
      (m) => ({ type: m.MenubarExampleComponent }),
    ),
  'multi-select': () =>
    import('../../pages/components/component-doc/examples/multi-select-example.component').then(
      (m) => ({ type: m.MultiSelectExampleComponent }),
    ),
  navigation: () =>
    import('../../pages/components/component-doc/examples/navigation-example.component').then(
      (m) => ({ type: m.NavigationExampleComponent }),
    ),
  'number-input': () =>
    import('../../pages/components/component-doc/examples/number-input-example.component').then(
      (m) => ({ type: m.NumberInputExampleComponent }),
    ),
  'panel-menu': () =>
    import('../../pages/components/component-doc/examples/panel-menu-example.component').then(
      (m) => ({ type: m.PanelMenuExampleComponent }),
    ),
  popover: () =>
    import('../../pages/components/component-doc/examples/popover-example.component').then(
      (m) => ({ type: m.PopoverExampleComponent }),
    ),
  'scroll-area': () =>
    import('../../pages/components/component-doc/examples/scroll-area-example.component').then(
      (m) => ({ type: m.ScrollAreaExampleComponent }),
    ),
  'segmented-control': () =>
    import('../../pages/components/component-doc/examples/segmented-control-example.component').then(
      (m) => ({ type: m.SegmentedControlExampleComponent }),
    ),
  separator: () =>
    import('../../pages/components/component-doc/examples/separator-example.component').then(
      (m) => ({ type: m.SeparatorExampleComponent }),
    ),
  'speed-dial': () =>
    import('../../pages/components/component-doc/examples/speed-dial-example.component').then(
      (m) => ({ type: m.SpeedDialExampleComponent }),
    ),
  splitter: () =>
    import('../../pages/components/component-doc/examples/splitter-example.component').then(
      (m) => ({ type: m.SplitterExampleComponent }),
    ),
  'tab-menu': () =>
    import('../../pages/components/component-doc/examples/tab-menu-example.component').then(
      (m) => ({ type: m.TabMenuExampleComponent }),
    ),
  tag: () =>
    import('../../pages/components/component-doc/examples/tag-example.component').then(
      (m) => ({ type: m.TagExampleComponent }),
    ),
  'tags-input': () =>
    import('../../pages/components/component-doc/examples/tags-input-example.component').then(
      (m) => ({ type: m.TagsInputExampleComponent }),
    ),
  terminal: () =>
    import('../../pages/components/component-doc/examples/terminal-example.component').then(
      (m) => ({ type: m.TerminalExampleComponent }),
    ),
  text: () =>
    import('../../pages/components/component-doc/examples/text-example.component').then(
      (m) => ({ type: m.TextExampleComponent }),
    ),
  'tiered-menu': () =>
    import('../../pages/components/component-doc/examples/tiered-menu-example.component').then(
      (m) => ({ type: m.TieredMenuExampleComponent }),
    ),
  timeline: () =>
    import('../../pages/components/component-doc/examples/timeline-example.component').then(
      (m) => ({ type: m.TimelineExampleComponent }),
    ),
  toolbar: () =>
    import('../../pages/components/component-doc/examples/toolbar-example.component').then(
      (m) => ({ type: m.ToolbarExampleComponent }),
    ),
  tree: () =>
    import('../../pages/components/component-doc/examples/tree-example.component').then(
      (m) => ({ type: m.TreeExampleComponent }),
    ),
  'tree-select': () =>
    import('../../pages/components/component-doc/examples/tree-select-example.component').then(
      (m) => ({ type: m.TreeSelectExampleComponent }),
    ),
  'tree-table': () =>
    import('../../pages/components/component-doc/examples/tree-table-example.component').then(
      (m) => ({ type: m.TreeTableExampleComponent }),
    ),
  'tree-view': () =>
    import('../../pages/components/component-doc/examples/tree-view-example.component').then(
      (m) => ({ type: m.TreeViewExampleComponent }),
    ),
  typography: () =>
    import('../../pages/components/component-doc/examples/typography-example.component').then(
      (m) => ({ type: m.TypographyExampleComponent }),
    ),
  'visually-hidden': () =>
    import('../../pages/components/component-doc/examples/visually-hidden-example.component').then(
      (m) => ({ type: m.VisuallyHiddenExampleComponent }),
    ),
};
