/**
 * Aggregated component catalog. Each family is documented in a colocated
 * `<id>.catalog.ts` module; this index is the single loader surface.
 * Coverage is enforced by tools/quality/check-docs-coverage.mjs.
 */
import type { ComponentEntry } from '../models/component-entry.model';
import type { ComponentUsageDoc } from '../models/component-doc.model';

import { ACCORDION_CATALOG_ENTRY } from './accordion.catalog';
import { ALERT_CATALOG_ENTRY } from './alert.catalog';
import { ASPECT_RATIO_CATALOG_ENTRY } from './aspect-ratio.catalog';
import { AUTOCOMPLETE_CATALOG_ENTRY } from './autocomplete.catalog';
import { AVATAR_CATALOG_ENTRY } from './avatar.catalog';
import { BADGE_CATALOG_ENTRY } from './badge.catalog';
import { BLOCK_UI_CATALOG_ENTRY } from './block-ui.catalog';
import { BOX_CATALOG_ENTRY } from './box.catalog';
import { BREADCRUMB_CATALOG_ENTRY } from './breadcrumb.catalog';
import { BUTTON_GROUP_CATALOG_ENTRY } from './button-group.catalog';
import { BUTTON_CATALOG_ENTRY } from './button.catalog';
import { CALENDAR_CATALOG_ENTRY } from './calendar.catalog';
import { CARD_CATALOG_ENTRY } from './card.catalog';
import { CAROUSEL_CATALOG_ENTRY } from './carousel.catalog';
import { CASCADE_SELECT_CATALOG_ENTRY } from './cascade-select.catalog';
import { CHART_CATALOG_ENTRY } from './chart.catalog';
import { CHECKBOX_CATALOG_ENTRY } from './checkbox.catalog';
import { CHIP_INPUT_CATALOG_ENTRY } from './chip-input.catalog';
import { CHIP_CATALOG_ENTRY } from './chip.catalog';
import { CLOSE_BUTTON_CATALOG_ENTRY } from './close-button.catalog';
import { CODE_CATALOG_ENTRY } from './code.catalog';
import { COLLAPSIBLE_CATALOG_ENTRY } from './collapsible.catalog';
import { COLOR_PICKER_CATALOG_ENTRY } from './color-picker.catalog';
import { COMBOBOX_CATALOG_ENTRY } from './combobox.catalog';
import { COMMAND_MENU_CATALOG_ENTRY } from './command-menu.catalog';
import { CONFIRM_DIALOG_CATALOG_ENTRY } from './confirm-dialog.catalog';
import { CONFIRM_POPUP_CATALOG_ENTRY } from './confirm-popup.catalog';
import { CONTAINER_CATALOG_ENTRY } from './container.catalog';
import { CONTEXT_MENU_CATALOG_ENTRY } from './context-menu.catalog';
import { DATA_TABLE_CATALOG_ENTRY } from './data-table.catalog';
import { DATA_VIEW_CATALOG_ENTRY } from './data-view.catalog';
import { DATE_INPUT_CATALOG_ENTRY } from './date-input.catalog';
import { DATE_PICKER_CATALOG_ENTRY } from './date-picker.catalog';
import { DIVIDER_CATALOG_ENTRY } from './divider.catalog';
import { DOCK_CATALOG_ENTRY } from './dock.catalog';
import { DRAWER_CATALOG_ENTRY } from './drawer.catalog';
import { DROPDOWN_CATALOG_ENTRY } from './dropdown.catalog';
import { EDITOR_CATALOG_ENTRY } from './editor.catalog';
import { EMPTY_STATE_CATALOG_ENTRY } from './empty-state.catalog';
import { FIELDSET_CATALOG_ENTRY } from './fieldset.catalog';
import { FILE_UPLOAD_CATALOG_ENTRY } from './file-upload.catalog';
import { FILE_UPLOADER_CATALOG_ENTRY } from './file-uploader.catalog';
import { FLEX_CATALOG_ENTRY } from './flex.catalog';
import { FLOAT_LABEL_CATALOG_ENTRY } from './float-label.catalog';
import { FLOATING_ACTION_BUTTON_CATALOG_ENTRY } from './floating-action-button.catalog';
import { FLUID_CATALOG_ENTRY } from './fluid.catalog';
import { FORM_FIELD_CATALOG_ENTRY } from './form-field.catalog';
import { FORM_CATALOG_ENTRY } from './form.catalog';
import { GALLERIA_CATALOG_ENTRY } from './galleria.catalog';
import { GRID_CATALOG_ENTRY } from './grid.catalog';
import { HOVER_CARD_CATALOG_ENTRY } from './hover-card.catalog';
import { ICON_FIELD_CATALOG_ENTRY } from './icon-field.catalog';
import { ICON_CATALOG_ENTRY } from './icon.catalog';
import { IFTA_LABEL_CATALOG_ENTRY } from './ifta-label.catalog';
import { IMAGE_COMPARE_CATALOG_ENTRY } from './image-compare.catalog';
import { IMAGE_CATALOG_ENTRY } from './image.catalog';
import { INPLACE_CATALOG_ENTRY } from './inplace.catalog';
import { INPUT_COLOR_CATALOG_ENTRY } from './input-color.catalog';
import { INPUT_GROUP_CATALOG_ENTRY } from './input-group.catalog';
import { INPUT_CATALOG_ENTRY } from './input.catalog';
import { KBD_CATALOG_ENTRY } from './kbd.catalog';
import { KNOB_CATALOG_ENTRY } from './knob.catalog';
import { LINK_CATALOG_ENTRY } from './link.catalog';
import { LIST_CATALOG_ENTRY } from './list.catalog';
import { LISTBOX_CATALOG_ENTRY } from './listbox.catalog';
import { MEGA_MENU_CATALOG_ENTRY } from './mega-menu.catalog';
import { MENU_CATALOG_ENTRY } from './menu.catalog';
import { MENUBAR_CATALOG_ENTRY } from './menubar.catalog';
import { MESSAGES_CATALOG_ENTRY } from './messages.catalog';
import { METER_GROUP_CATALOG_ENTRY } from './meter-group.catalog';
import { MODAL_CATALOG_ENTRY } from './modal.catalog';
import { MULTI_SELECT_CATALOG_ENTRY } from './multi-select.catalog';
import { NAVIGATION_CATALOG_ENTRY } from './navigation.catalog';
import { NUMBER_INPUT_CATALOG_ENTRY } from './number-input.catalog';
import { ORDER_LIST_CATALOG_ENTRY } from './order-list.catalog';
import { ORGANIZATION_CHART_CATALOG_ENTRY } from './organization-chart.catalog';
import { OTP_INPUT_CATALOG_ENTRY } from './otp-input.catalog';
import { OVERLAY_BADGE_CATALOG_ENTRY } from './overlay-badge.catalog';
import { OVERLAY_PANEL_CATALOG_ENTRY } from './overlay-panel.catalog';
import { OVERLAY_CATALOG_ENTRY } from './overlay.catalog';
import { PAGINATOR_CATALOG_ENTRY } from './paginator.catalog';
import { PANEL_MENU_CATALOG_ENTRY } from './panel-menu.catalog';
import { PANEL_CATALOG_ENTRY } from './panel.catalog';
import { PASSWORD_CATALOG_ENTRY } from './password.catalog';
import { PICK_LIST_CATALOG_ENTRY } from './pick-list.catalog';
import { POPOVER_CATALOG_ENTRY } from './popover.catalog';
import { PORTAL_CATALOG_ENTRY } from './portal.catalog';
import { PROGRESS_CATALOG_ENTRY } from './progress.catalog';
import { RADIO_CATALOG_ENTRY } from './radio.catalog';
import { RATING_CATALOG_ENTRY } from './rating.catalog';
import { SCROLL_AREA_CATALOG_ENTRY } from './scroll-area.catalog';
import { SCROLL_PANEL_CATALOG_ENTRY } from './scroll-panel.catalog';
import { SCROLL_TOP_CATALOG_ENTRY } from './scroll-top.catalog';
import { SEGMENTED_CONTROL_CATALOG_ENTRY } from './segmented-control.catalog';
import { SELECT_BUTTON_CATALOG_ENTRY } from './select-button.catalog';
import { SELECT_CATALOG_ENTRY } from './select.catalog';
import { SEPARATOR_CATALOG_ENTRY } from './separator.catalog';
import { SKELETON_CATALOG_ENTRY } from './skeleton.catalog';
import { SLIDER_CATALOG_ENTRY } from './slider.catalog';
import { SPACE_CATALOG_ENTRY } from './space.catalog';
import { SPEED_DIAL_CATALOG_ENTRY } from './speed-dial.catalog';
import { SPINNER_CATALOG_ENTRY } from './spinner.catalog';
import { SPLIT_BUTTON_CATALOG_ENTRY } from './split-button.catalog';
import { SPLITTER_CATALOG_ENTRY } from './splitter.catalog';
import { STACK_CATALOG_ENTRY } from './stack.catalog';
import { STEPPER_CATALOG_ENTRY } from './stepper.catalog';
import { SWITCH_CATALOG_ENTRY } from './switch.catalog';
import { TAB_MENU_CATALOG_ENTRY } from './tab-menu.catalog';
import { TABLE_CATALOG_ENTRY } from './table.catalog';
import { TABS_CATALOG_ENTRY } from './tabs.catalog';
import { TAG_CATALOG_ENTRY } from './tag.catalog';
import { TAGS_INPUT_CATALOG_ENTRY } from './tags-input.catalog';
import { TERMINAL_CATALOG_ENTRY } from './terminal.catalog';
import { TEXT_CATALOG_ENTRY } from './text.catalog';
import { TIERED_MENU_CATALOG_ENTRY } from './tiered-menu.catalog';
import { TIMELINE_CATALOG_ENTRY } from './timeline.catalog';
import { TOAST_CATALOG_ENTRY } from './toast.catalog';
import { TOGGLE_BUTTON_CATALOG_ENTRY } from './toggle-button.catalog';
import { TOOLBAR_CATALOG_ENTRY } from './toolbar.catalog';
import { TOOLTIP_CATALOG_ENTRY } from './tooltip.catalog';
import { TREE_SELECT_CATALOG_ENTRY } from './tree-select.catalog';
import { TREE_TABLE_CATALOG_ENTRY } from './tree-table.catalog';
import { TREE_VIEW_CATALOG_ENTRY } from './tree-view.catalog';
import { TREE_CATALOG_ENTRY } from './tree.catalog';
import { TYPOGRAPHY_CATALOG_ENTRY } from './typography.catalog';
import { VIRTUAL_SCROLLER_CATALOG_ENTRY } from './virtual-scroller.catalog';
import { VISUALLY_HIDDEN_CATALOG_ENTRY } from './visually-hidden.catalog';
import { AUTOCOMPLETE_USAGE_DOC } from './autocomplete.catalog';
import { CAROUSEL_USAGE_DOC } from './carousel.catalog';
import { CASCADE_SELECT_USAGE_DOC } from './cascade-select.catalog';
import { CHART_USAGE_DOC } from './chart.catalog';
import { CHIP_USAGE_DOC } from './chip.catalog';
import { COLLAPSIBLE_USAGE_DOC } from './collapsible.catalog';
import { COLOR_PICKER_USAGE_DOC } from './color-picker.catalog';
import { COMMAND_MENU_USAGE_DOC } from './command-menu.catalog';
import { DATA_VIEW_USAGE_DOC } from './data-view.catalog';
import { DATE_PICKER_USAGE_DOC } from './date-picker.catalog';
import { DIVIDER_USAGE_DOC } from './divider.catalog';
import { DRAWER_USAGE_DOC } from './drawer.catalog';
import { EDITOR_USAGE_DOC } from './editor.catalog';
import { FORM_FIELD_USAGE_DOC } from './form-field.catalog';
import { FORM_USAGE_DOC } from './form.catalog';
import { ICON_USAGE_DOC } from './icon.catalog';
import { IMAGE_USAGE_DOC } from './image.catalog';
import { KBD_USAGE_DOC } from './kbd.catalog';
import { LIST_USAGE_DOC } from './list.catalog';
import { MEGA_MENU_USAGE_DOC } from './mega-menu.catalog';
import { MENU_USAGE_DOC } from './menu.catalog';
import { NAVIGATION_USAGE_DOC } from './navigation.catalog';
import { NUMBER_INPUT_USAGE_DOC } from './number-input.catalog';
import { PANEL_MENU_USAGE_DOC } from './panel-menu.catalog';
import { POPOVER_USAGE_DOC } from './popover.catalog';
import { SCROLL_AREA_USAGE_DOC } from './scroll-area.catalog';
import { TAB_MENU_USAGE_DOC } from './tab-menu.catalog';
import { TAGS_INPUT_USAGE_DOC } from './tags-input.catalog';
import { TERMINAL_USAGE_DOC } from './terminal.catalog';
import { TIERED_MENU_USAGE_DOC } from './tiered-menu.catalog';
import { TIMELINE_USAGE_DOC } from './timeline.catalog';
import { TOOLBAR_USAGE_DOC } from './toolbar.catalog';
import { TREE_TABLE_USAGE_DOC } from './tree-table.catalog';
import { TREE_VIEW_USAGE_DOC } from './tree-view.catalog';
import { TREE_USAGE_DOC } from './tree.catalog';

export const CATALOG_ENTRIES: readonly ComponentEntry[] = [
  ACCORDION_CATALOG_ENTRY,
  ALERT_CATALOG_ENTRY,
  ASPECT_RATIO_CATALOG_ENTRY,
  AUTOCOMPLETE_CATALOG_ENTRY,
  AVATAR_CATALOG_ENTRY,
  BADGE_CATALOG_ENTRY,
  BLOCK_UI_CATALOG_ENTRY,
  BOX_CATALOG_ENTRY,
  BREADCRUMB_CATALOG_ENTRY,
  BUTTON_GROUP_CATALOG_ENTRY,
  BUTTON_CATALOG_ENTRY,
  CALENDAR_CATALOG_ENTRY,
  CARD_CATALOG_ENTRY,
  CAROUSEL_CATALOG_ENTRY,
  CASCADE_SELECT_CATALOG_ENTRY,
  CHART_CATALOG_ENTRY,
  CHECKBOX_CATALOG_ENTRY,
  CHIP_INPUT_CATALOG_ENTRY,
  CHIP_CATALOG_ENTRY,
  CLOSE_BUTTON_CATALOG_ENTRY,
  CODE_CATALOG_ENTRY,
  COLLAPSIBLE_CATALOG_ENTRY,
  COLOR_PICKER_CATALOG_ENTRY,
  COMBOBOX_CATALOG_ENTRY,
  COMMAND_MENU_CATALOG_ENTRY,
  CONFIRM_DIALOG_CATALOG_ENTRY,
  CONFIRM_POPUP_CATALOG_ENTRY,
  CONTAINER_CATALOG_ENTRY,
  CONTEXT_MENU_CATALOG_ENTRY,
  DATA_TABLE_CATALOG_ENTRY,
  DATA_VIEW_CATALOG_ENTRY,
  DATE_INPUT_CATALOG_ENTRY,
  DATE_PICKER_CATALOG_ENTRY,
  DIVIDER_CATALOG_ENTRY,
  DOCK_CATALOG_ENTRY,
  DRAWER_CATALOG_ENTRY,
  DROPDOWN_CATALOG_ENTRY,
  EDITOR_CATALOG_ENTRY,
  EMPTY_STATE_CATALOG_ENTRY,
  FIELDSET_CATALOG_ENTRY,
  FILE_UPLOAD_CATALOG_ENTRY,
  FILE_UPLOADER_CATALOG_ENTRY,
  FLEX_CATALOG_ENTRY,
  FLOAT_LABEL_CATALOG_ENTRY,
  FLOATING_ACTION_BUTTON_CATALOG_ENTRY,
  FLUID_CATALOG_ENTRY,
  FORM_FIELD_CATALOG_ENTRY,
  FORM_CATALOG_ENTRY,
  GALLERIA_CATALOG_ENTRY,
  GRID_CATALOG_ENTRY,
  HOVER_CARD_CATALOG_ENTRY,
  ICON_FIELD_CATALOG_ENTRY,
  ICON_CATALOG_ENTRY,
  IFTA_LABEL_CATALOG_ENTRY,
  IMAGE_COMPARE_CATALOG_ENTRY,
  IMAGE_CATALOG_ENTRY,
  INPLACE_CATALOG_ENTRY,
  INPUT_COLOR_CATALOG_ENTRY,
  INPUT_GROUP_CATALOG_ENTRY,
  INPUT_CATALOG_ENTRY,
  KBD_CATALOG_ENTRY,
  KNOB_CATALOG_ENTRY,
  LINK_CATALOG_ENTRY,
  LIST_CATALOG_ENTRY,
  LISTBOX_CATALOG_ENTRY,
  MEGA_MENU_CATALOG_ENTRY,
  MENU_CATALOG_ENTRY,
  MENUBAR_CATALOG_ENTRY,
  MESSAGES_CATALOG_ENTRY,
  METER_GROUP_CATALOG_ENTRY,
  MODAL_CATALOG_ENTRY,
  MULTI_SELECT_CATALOG_ENTRY,
  NAVIGATION_CATALOG_ENTRY,
  NUMBER_INPUT_CATALOG_ENTRY,
  ORDER_LIST_CATALOG_ENTRY,
  ORGANIZATION_CHART_CATALOG_ENTRY,
  OTP_INPUT_CATALOG_ENTRY,
  OVERLAY_BADGE_CATALOG_ENTRY,
  OVERLAY_PANEL_CATALOG_ENTRY,
  OVERLAY_CATALOG_ENTRY,
  PAGINATOR_CATALOG_ENTRY,
  PANEL_MENU_CATALOG_ENTRY,
  PANEL_CATALOG_ENTRY,
  PASSWORD_CATALOG_ENTRY,
  PICK_LIST_CATALOG_ENTRY,
  POPOVER_CATALOG_ENTRY,
  PORTAL_CATALOG_ENTRY,
  PROGRESS_CATALOG_ENTRY,
  RADIO_CATALOG_ENTRY,
  RATING_CATALOG_ENTRY,
  SCROLL_AREA_CATALOG_ENTRY,
  SCROLL_PANEL_CATALOG_ENTRY,
  SCROLL_TOP_CATALOG_ENTRY,
  SEGMENTED_CONTROL_CATALOG_ENTRY,
  SELECT_BUTTON_CATALOG_ENTRY,
  SELECT_CATALOG_ENTRY,
  SEPARATOR_CATALOG_ENTRY,
  SKELETON_CATALOG_ENTRY,
  SLIDER_CATALOG_ENTRY,
  SPACE_CATALOG_ENTRY,
  SPEED_DIAL_CATALOG_ENTRY,
  SPINNER_CATALOG_ENTRY,
  SPLIT_BUTTON_CATALOG_ENTRY,
  SPLITTER_CATALOG_ENTRY,
  STACK_CATALOG_ENTRY,
  STEPPER_CATALOG_ENTRY,
  SWITCH_CATALOG_ENTRY,
  TAB_MENU_CATALOG_ENTRY,
  TABLE_CATALOG_ENTRY,
  TABS_CATALOG_ENTRY,
  TAG_CATALOG_ENTRY,
  TAGS_INPUT_CATALOG_ENTRY,
  TERMINAL_CATALOG_ENTRY,
  TEXT_CATALOG_ENTRY,
  TIERED_MENU_CATALOG_ENTRY,
  TIMELINE_CATALOG_ENTRY,
  TOAST_CATALOG_ENTRY,
  TOGGLE_BUTTON_CATALOG_ENTRY,
  TOOLBAR_CATALOG_ENTRY,
  TOOLTIP_CATALOG_ENTRY,
  TREE_SELECT_CATALOG_ENTRY,
  TREE_TABLE_CATALOG_ENTRY,
  TREE_VIEW_CATALOG_ENTRY,
  TREE_CATALOG_ENTRY,
  TYPOGRAPHY_CATALOG_ENTRY,
  VIRTUAL_SCROLLER_CATALOG_ENTRY,
  VISUALLY_HIDDEN_CATALOG_ENTRY,
];

export const COMPONENT_USAGE_DOCS: Record<string, ComponentUsageDoc> = {
  autocomplete: AUTOCOMPLETE_USAGE_DOC,
  carousel: CAROUSEL_USAGE_DOC,
  'cascade-select': CASCADE_SELECT_USAGE_DOC,
  chart: CHART_USAGE_DOC,
  chip: CHIP_USAGE_DOC,
  collapsible: COLLAPSIBLE_USAGE_DOC,
  'color-picker': COLOR_PICKER_USAGE_DOC,
  'command-menu': COMMAND_MENU_USAGE_DOC,
  'data-view': DATA_VIEW_USAGE_DOC,
  'date-picker': DATE_PICKER_USAGE_DOC,
  divider: DIVIDER_USAGE_DOC,
  drawer: DRAWER_USAGE_DOC,
  editor: EDITOR_USAGE_DOC,
  'form-field': FORM_FIELD_USAGE_DOC,
  form: FORM_USAGE_DOC,
  icon: ICON_USAGE_DOC,
  image: IMAGE_USAGE_DOC,
  kbd: KBD_USAGE_DOC,
  list: LIST_USAGE_DOC,
  'mega-menu': MEGA_MENU_USAGE_DOC,
  menu: MENU_USAGE_DOC,
  navigation: NAVIGATION_USAGE_DOC,
  'number-input': NUMBER_INPUT_USAGE_DOC,
  'panel-menu': PANEL_MENU_USAGE_DOC,
  popover: POPOVER_USAGE_DOC,
  'scroll-area': SCROLL_AREA_USAGE_DOC,
  'tab-menu': TAB_MENU_USAGE_DOC,
  'tags-input': TAGS_INPUT_USAGE_DOC,
  terminal: TERMINAL_USAGE_DOC,
  'tiered-menu': TIERED_MENU_USAGE_DOC,
  timeline: TIMELINE_USAGE_DOC,
  toolbar: TOOLBAR_USAGE_DOC,
  'tree-table': TREE_TABLE_USAGE_DOC,
  'tree-view': TREE_VIEW_USAGE_DOC,
  tree: TREE_USAGE_DOC,
};
