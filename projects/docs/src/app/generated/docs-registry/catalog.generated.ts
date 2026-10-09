// GERADO — não edite. Fonte: projects/docs/src/app/content/components/
// (formato novo) e os arquivos legacy de catalog/ e pages/components/.
// Regenere com `npm run docs:generate-registry` (tools/docs/generate-registry.mjs).

import type { RegistryEntry } from '../../models/component-entry.model';
import type { ComponentUsageDoc } from '../../models/component-doc.model';
import { ACCORDION_CATALOG_ENTRY } from '../../catalog/accordion.catalog';
import { ALERT_CATALOG_ENTRY } from '../../catalog/alert.catalog';
import {
  AUTOCOMPLETE_CATALOG_ENTRY,
  AUTOCOMPLETE_USAGE_DOC,
} from '../../catalog/autocomplete.catalog';
import { AVATAR_CATALOG_ENTRY } from '../../catalog/avatar.catalog';
import { BADGE_CATALOG_ENTRY } from '../../catalog/badge.catalog';
import { BREADCRUMB_CATALOG_ENTRY } from '../../catalog/breadcrumb.catalog';
import { BUTTON_GROUP_CATALOG_ENTRY } from '../../catalog/button-group.catalog';
import { CALENDAR_CATALOG_ENTRY } from '../../catalog/calendar.catalog';
import { CARD_CATALOG_ENTRY } from '../../catalog/card.catalog';
import {
  CAROUSEL_CATALOG_ENTRY,
  CAROUSEL_USAGE_DOC,
} from '../../catalog/carousel.catalog';
import {
  CHART_CATALOG_ENTRY,
  CHART_USAGE_DOC,
} from '../../catalog/chart.catalog';
import { CHECKBOX_CATALOG_ENTRY } from '../../catalog/checkbox.catalog';
import { CHIP_INPUT_CATALOG_ENTRY } from '../../catalog/chip-input.catalog';
import { CHIP_CATALOG_ENTRY, CHIP_USAGE_DOC } from '../../catalog/chip.catalog';
import { CLOSE_BUTTON_CATALOG_ENTRY } from '../../catalog/close-button.catalog';
import { CODE_CATALOG_ENTRY } from '../../catalog/code.catalog';
import {
  COLLAPSIBLE_CATALOG_ENTRY,
  COLLAPSIBLE_USAGE_DOC,
} from '../../catalog/collapsible.catalog';
import {
  COLOR_PICKER_CATALOG_ENTRY,
  COLOR_PICKER_USAGE_DOC,
} from '../../catalog/color-picker.catalog';
import { COMBOBOX_CATALOG_ENTRY } from '../../catalog/combobox.catalog';
import {
  COMMAND_MENU_CATALOG_ENTRY,
  COMMAND_MENU_USAGE_DOC,
} from '../../catalog/command-menu.catalog';
import { CONFIRM_DIALOG_CATALOG_ENTRY } from '../../catalog/confirm-dialog.catalog';
import { CONTEXT_MENU_CATALOG_ENTRY } from '../../catalog/context-menu.catalog';
import { DATA_TABLE_CATALOG_ENTRY } from '../../catalog/data-table.catalog';
import { DATE_INPUT_CATALOG_ENTRY } from '../../catalog/date-input.catalog';
import {
  DATE_PICKER_CATALOG_ENTRY,
  DATE_PICKER_USAGE_DOC,
} from '../../catalog/date-picker.catalog';
import {
  DIVIDER_CATALOG_ENTRY,
  DIVIDER_USAGE_DOC,
} from '../../catalog/divider.catalog';
import {
  DRAWER_CATALOG_ENTRY,
  DRAWER_USAGE_DOC,
} from '../../catalog/drawer.catalog';
import { DROPDOWN_CATALOG_ENTRY } from '../../catalog/dropdown.catalog';
import {
  EDITOR_CATALOG_ENTRY,
  EDITOR_USAGE_DOC,
} from '../../catalog/editor.catalog';
import { EMPTY_STATE_CATALOG_ENTRY } from '../../catalog/empty-state.catalog';
import { FIELDSET_CATALOG_ENTRY } from '../../catalog/fieldset.catalog';
import { FILE_UPLOADER_CATALOG_ENTRY } from '../../catalog/file-uploader.catalog';
import {
  FORM_FIELD_CATALOG_ENTRY,
  FORM_FIELD_USAGE_DOC,
} from '../../catalog/form-field.catalog';
import { GALLERIA_CATALOG_ENTRY } from '../../catalog/galleria.catalog';
import { HOVER_CARD_CATALOG_ENTRY } from '../../catalog/hover-card.catalog';
import { ICON_FIELD_CATALOG_ENTRY } from '../../catalog/icon-field.catalog';
import { ICON_CATALOG_ENTRY, ICON_USAGE_DOC } from '../../catalog/icon.catalog';
import { IMAGE_COMPARE_CATALOG_ENTRY } from '../../catalog/image-compare.catalog';
import {
  IMAGE_CATALOG_ENTRY,
  IMAGE_USAGE_DOC,
} from '../../catalog/image.catalog';
import { INPLACE_CATALOG_ENTRY } from '../../catalog/inplace.catalog';
import { INPUT_COLOR_CATALOG_ENTRY } from '../../catalog/input-color.catalog';
import { INPUT_GROUP_CATALOG_ENTRY } from '../../catalog/input-group.catalog';
import { INPUT_CATALOG_ENTRY } from '../../catalog/input.catalog';
import { KBD_CATALOG_ENTRY, KBD_USAGE_DOC } from '../../catalog/kbd.catalog';
import { KNOB_CATALOG_ENTRY } from '../../catalog/knob.catalog';
import { LINK_CATALOG_ENTRY } from '../../catalog/link.catalog';
import { LIST_CATALOG_ENTRY, LIST_USAGE_DOC } from '../../catalog/list.catalog';
import { LISTBOX_CATALOG_ENTRY } from '../../catalog/listbox.catalog';
import { MENU_CATALOG_ENTRY, MENU_USAGE_DOC } from '../../catalog/menu.catalog';
import { MENUBAR_CATALOG_ENTRY } from '../../catalog/menubar.catalog';
import { MESSAGES_CATALOG_ENTRY } from '../../catalog/messages.catalog';
import { METER_GROUP_CATALOG_ENTRY } from '../../catalog/meter-group.catalog';
import { MULTI_SELECT_CATALOG_ENTRY } from '../../catalog/multi-select.catalog';
import {
  NAVIGATION_CATALOG_ENTRY,
  NAVIGATION_USAGE_DOC,
} from '../../catalog/navigation.catalog';
import {
  NUMBER_INPUT_CATALOG_ENTRY,
  NUMBER_INPUT_USAGE_DOC,
} from '../../catalog/number-input.catalog';
import { ORGANIZATION_CHART_CATALOG_ENTRY } from '../../catalog/organization-chart.catalog';
import { OTP_INPUT_CATALOG_ENTRY } from '../../catalog/otp-input.catalog';
import { OVERLAY_BADGE_CATALOG_ENTRY } from '../../catalog/overlay-badge.catalog';
import { OVERLAY_PANEL_CATALOG_ENTRY } from '../../catalog/overlay-panel.catalog';
import { PAGINATOR_CATALOG_ENTRY } from '../../catalog/paginator.catalog';
import {
  PANEL_MENU_CATALOG_ENTRY,
  PANEL_MENU_USAGE_DOC,
} from '../../catalog/panel-menu.catalog';
import { PANEL_CATALOG_ENTRY } from '../../catalog/panel.catalog';
import { PASSWORD_CATALOG_ENTRY } from '../../catalog/password.catalog';
import { PICK_LIST_CATALOG_ENTRY } from '../../catalog/pick-list.catalog';
import {
  POPOVER_CATALOG_ENTRY,
  POPOVER_USAGE_DOC,
} from '../../catalog/popover.catalog';
import { PROGRESS_CATALOG_ENTRY } from '../../catalog/progress.catalog';
import { RADIO_CATALOG_ENTRY } from '../../catalog/radio.catalog';
import { RATING_CATALOG_ENTRY } from '../../catalog/rating.catalog';
import {
  SCROLL_AREA_CATALOG_ENTRY,
  SCROLL_AREA_USAGE_DOC,
} from '../../catalog/scroll-area.catalog';
import { SCROLL_PANEL_CATALOG_ENTRY } from '../../catalog/scroll-panel.catalog';
import { SEGMENTED_CONTROL_CATALOG_ENTRY } from '../../catalog/segmented-control.catalog';
import { SELECT_BUTTON_CATALOG_ENTRY } from '../../catalog/select-button.catalog';
import { SEPARATOR_CATALOG_ENTRY } from '../../catalog/separator.catalog';
import { SKELETON_CATALOG_ENTRY } from '../../catalog/skeleton.catalog';
import { SLIDER_CATALOG_ENTRY } from '../../catalog/slider.catalog';
import { SPEED_DIAL_CATALOG_ENTRY } from '../../catalog/speed-dial.catalog';
import { SPINNER_CATALOG_ENTRY } from '../../catalog/spinner.catalog';
import { SPLITTER_CATALOG_ENTRY } from '../../catalog/splitter.catalog';
import { STEPPER_CATALOG_ENTRY } from '../../catalog/stepper.catalog';
import { SWITCH_CATALOG_ENTRY } from '../../catalog/switch.catalog';
import {
  TAB_MENU_CATALOG_ENTRY,
  TAB_MENU_USAGE_DOC,
} from '../../catalog/tab-menu.catalog';
import { TABLE_CATALOG_ENTRY } from '../../catalog/table.catalog';
import { TABS_CATALOG_ENTRY } from '../../catalog/tabs.catalog';
import { TAG_CATALOG_ENTRY } from '../../catalog/tag.catalog';
import {
  TAGS_INPUT_CATALOG_ENTRY,
  TAGS_INPUT_USAGE_DOC,
} from '../../catalog/tags-input.catalog';
import {
  TERMINAL_CATALOG_ENTRY,
  TERMINAL_USAGE_DOC,
} from '../../catalog/terminal.catalog';
import { TEXT_CATALOG_ENTRY } from '../../catalog/text.catalog';
import {
  TIERED_MENU_CATALOG_ENTRY,
  TIERED_MENU_USAGE_DOC,
} from '../../catalog/tiered-menu.catalog';
import {
  TIMELINE_CATALOG_ENTRY,
  TIMELINE_USAGE_DOC,
} from '../../catalog/timeline.catalog';
import { TOAST_CATALOG_ENTRY } from '../../catalog/toast.catalog';
import { TOGGLE_BUTTON_CATALOG_ENTRY } from '../../catalog/toggle-button.catalog';
import {
  TOOLBAR_CATALOG_ENTRY,
  TOOLBAR_USAGE_DOC,
} from '../../catalog/toolbar.catalog';
import { TOOLTIP_CATALOG_ENTRY } from '../../catalog/tooltip.catalog';
import { TREE_SELECT_CATALOG_ENTRY } from '../../catalog/tree-select.catalog';
import {
  TREE_TABLE_CATALOG_ENTRY,
  TREE_TABLE_USAGE_DOC,
} from '../../catalog/tree-table.catalog';
import {
  TREE_VIEW_CATALOG_ENTRY,
  TREE_VIEW_USAGE_DOC,
} from '../../catalog/tree-view.catalog';
import { TREE_CATALOG_ENTRY, TREE_USAGE_DOC } from '../../catalog/tree.catalog';
import { TYPOGRAPHY_CATALOG_ENTRY } from '../../catalog/typography.catalog';
import { VISUALLY_HIDDEN_CATALOG_ENTRY } from '../../catalog/visually-hidden.catalog';

/** Catálogo completo (formato novo + legacy), ordenado por id. */
export const CATALOG_ENTRIES: readonly RegistryEntry[] = [
  {
    ...ACCORDION_CATALOG_ENTRY,
    route: '/components/accordion',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...ALERT_CATALOG_ENTRY,
    route: '/components/alert',
    group: 'display',
    source: 'legacy',
  },
  {
    ...AUTOCOMPLETE_CATALOG_ENTRY,
    route: '/components/autocomplete',
    group: 'selection',
    source: 'legacy',
  },
  {
    ...AVATAR_CATALOG_ENTRY,
    route: '/components/avatar',
    group: 'display',
    source: 'legacy',
  },
  {
    ...BADGE_CATALOG_ENTRY,
    route: '/components/badge',
    group: 'display',
    source: 'legacy',
  },
  {
    ...BREADCRUMB_CATALOG_ENTRY,
    route: '/components/breadcrumb',
    group: 'navigation',
    source: 'legacy',
  },
  {
    id: 'button',
    name: 'Button',
    description:
      'Dispara uma ação: enviar um formulário, abrir um diálogo, confirmar uma operação. Tem variantes de ênfase, três tamanhos, ícones e estado de carregamento.',
    status: 'stable',
    tags: ['botão', 'ação', 'cta', 'submit', 'action', 'click'],
    icon: 'smart_button',
    route: '/components/button',
    group: 'actions',
    source: 'content',
  },
  {
    ...BUTTON_GROUP_CATALOG_ENTRY,
    route: '/components/button-group',
    group: 'actions',
    source: 'legacy',
  },
  {
    ...CALENDAR_CATALOG_ENTRY,
    route: '/components/calendar',
    group: 'input',
    source: 'legacy',
  },
  {
    ...CARD_CATALOG_ENTRY,
    route: '/components/card',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...CAROUSEL_CATALOG_ENTRY,
    route: '/components/carousel',
    group: 'data',
    source: 'legacy',
  },
  {
    ...CHART_CATALOG_ENTRY,
    route: '/components/chart',
    group: 'utilities',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...CHECKBOX_CATALOG_ENTRY,
    route: '/components/checkbox',
    group: 'input',
    source: 'legacy',
  },
  {
    ...CHIP_CATALOG_ENTRY,
    route: '/components/chip',
    group: 'display',
    source: 'legacy',
  },
  {
    ...CHIP_INPUT_CATALOG_ENTRY,
    route: '/components/chip-input',
    group: 'input',
    source: 'legacy',
  },
  {
    ...CLOSE_BUTTON_CATALOG_ENTRY,
    route: '/components/close-button',
    group: 'utilities',
    source: 'legacy',
  },
  {
    ...CODE_CATALOG_ENTRY,
    route: '/components/code',
    group: 'utilities',
    source: 'legacy',
  },
  {
    ...COLLAPSIBLE_CATALOG_ENTRY,
    route: '/components/collapsible',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...COLOR_PICKER_CATALOG_ENTRY,
    route: '/components/color-picker',
    group: 'input',
    source: 'legacy',
  },
  {
    ...COMBOBOX_CATALOG_ENTRY,
    route: '/components/combobox',
    group: 'input',
    source: 'legacy',
  },
  {
    ...COMMAND_MENU_CATALOG_ENTRY,
    route: '/components/command-menu',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...CONFIRM_DIALOG_CATALOG_ENTRY,
    route: '/components/confirm-dialog',
    group: 'overlays',
    source: 'legacy',
  },
  {
    ...CONTEXT_MENU_CATALOG_ENTRY,
    route: '/components/context-menu',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...DATA_TABLE_CATALOG_ENTRY,
    route: '/components/data-table',
    group: 'data',
    source: 'legacy',
  },
  {
    ...DATE_INPUT_CATALOG_ENTRY,
    route: '/components/date-input',
    group: 'input',
    source: 'legacy',
  },
  {
    ...DATE_PICKER_CATALOG_ENTRY,
    route: '/components/date-picker',
    group: 'input',
    source: 'legacy',
  },
  {
    ...DIVIDER_CATALOG_ENTRY,
    route: '/components/divider',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...DRAWER_CATALOG_ENTRY,
    route: '/components/drawer',
    group: 'overlays',
    source: 'legacy',
  },
  {
    ...DROPDOWN_CATALOG_ENTRY,
    route: '/components/dropdown',
    group: 'utilities',
    source: 'legacy',
  },
  {
    ...EDITOR_CATALOG_ENTRY,
    route: '/components/editor',
    group: 'utilities',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...EMPTY_STATE_CATALOG_ENTRY,
    route: '/components/empty-state',
    group: 'display',
    source: 'legacy',
  },
  {
    ...FIELDSET_CATALOG_ENTRY,
    route: '/components/fieldset',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...FILE_UPLOADER_CATALOG_ENTRY,
    route: '/components/file-uploader',
    group: 'utilities',
    source: 'legacy',
  },
  {
    ...FORM_FIELD_CATALOG_ENTRY,
    route: '/components/form-field',
    group: 'input',
    source: 'legacy',
  },
  {
    ...GALLERIA_CATALOG_ENTRY,
    route: '/components/galleria',
    group: 'display',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...HOVER_CARD_CATALOG_ENTRY,
    route: '/components/hover-card',
    group: 'data',
    source: 'legacy',
  },
  {
    ...ICON_CATALOG_ENTRY,
    route: '/components/icon',
    group: 'utilities',
    source: 'legacy',
  },
  {
    ...ICON_FIELD_CATALOG_ENTRY,
    route: '/components/icon-field',
    group: 'input',
    source: 'legacy',
  },
  {
    ...IMAGE_CATALOG_ENTRY,
    route: '/components/image',
    group: 'display',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...IMAGE_COMPARE_CATALOG_ENTRY,
    route: '/components/image-compare',
    group: 'display',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...INPLACE_CATALOG_ENTRY,
    route: '/components/inplace',
    group: 'display',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...INPUT_CATALOG_ENTRY,
    route: '/components/input',
    group: 'input',
    source: 'legacy',
  },
  {
    ...INPUT_COLOR_CATALOG_ENTRY,
    route: '/components/input-color',
    group: 'input',
    source: 'legacy',
  },
  {
    ...INPUT_GROUP_CATALOG_ENTRY,
    route: '/components/input-group',
    group: 'input',
    source: 'legacy',
  },
  {
    ...KBD_CATALOG_ENTRY,
    route: '/components/kbd',
    group: 'utilities',
    source: 'legacy',
  },
  {
    ...KNOB_CATALOG_ENTRY,
    route: '/components/knob',
    group: 'input',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...LINK_CATALOG_ENTRY,
    route: '/components/link',
    group: 'utilities',
    source: 'legacy',
  },
  {
    ...LIST_CATALOG_ENTRY,
    route: '/components/list',
    group: 'data',
    source: 'legacy',
  },
  {
    ...LISTBOX_CATALOG_ENTRY,
    route: '/components/listbox',
    group: 'selection',
    source: 'legacy',
  },
  {
    ...MENU_CATALOG_ENTRY,
    route: '/components/menu',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...MENUBAR_CATALOG_ENTRY,
    route: '/components/menubar',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...MESSAGES_CATALOG_ENTRY,
    route: '/components/messages',
    group: 'display',
    source: 'legacy',
  },
  {
    ...METER_GROUP_CATALOG_ENTRY,
    route: '/components/meter-group',
    group: 'data',
    source: 'legacy',
  },
  {
    id: 'modal',
    name: 'Modal',
    description:
      'Janela de diálogo sobre a página, com fundo escurecido, foco preso dentro dela e fechamento por Esc. Para decisões e tarefas curtas que pedem atenção total.',
    status: 'stable',
    tags: ['diálogo', 'janela', 'confirmação', 'overlay', 'dialog', 'popup'],
    icon: 'picture_in_picture',
    route: '/components/modal',
    group: 'overlays',
    source: 'content',
  },
  {
    ...MULTI_SELECT_CATALOG_ENTRY,
    route: '/components/multi-select',
    group: 'input',
    source: 'legacy',
  },
  {
    ...NAVIGATION_CATALOG_ENTRY,
    route: '/components/navigation',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...NUMBER_INPUT_CATALOG_ENTRY,
    route: '/components/number-input',
    group: 'input',
    source: 'legacy',
  },
  {
    ...ORGANIZATION_CHART_CATALOG_ENTRY,
    route: '/components/organization-chart',
    group: 'data',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...OTP_INPUT_CATALOG_ENTRY,
    route: '/components/otp-input',
    group: 'input',
    source: 'legacy',
  },
  {
    ...OVERLAY_BADGE_CATALOG_ENTRY,
    route: '/components/overlay-badge',
    group: 'data',
    source: 'legacy',
  },
  {
    ...OVERLAY_PANEL_CATALOG_ENTRY,
    route: '/components/overlay-panel',
    group: 'overlays',
    source: 'legacy',
  },
  {
    ...PAGINATOR_CATALOG_ENTRY,
    route: '/components/paginator',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...PANEL_CATALOG_ENTRY,
    route: '/components/panel',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...PANEL_MENU_CATALOG_ENTRY,
    route: '/components/panel-menu',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...PASSWORD_CATALOG_ENTRY,
    route: '/components/password',
    group: 'input',
    source: 'legacy',
  },
  {
    ...PICK_LIST_CATALOG_ENTRY,
    route: '/components/pick-list',
    group: 'data',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...POPOVER_CATALOG_ENTRY,
    route: '/components/popover',
    group: 'overlays',
    source: 'legacy',
  },
  {
    ...PROGRESS_CATALOG_ENTRY,
    route: '/components/progress',
    group: 'display',
    source: 'legacy',
  },
  {
    ...RADIO_CATALOG_ENTRY,
    route: '/components/radio',
    group: 'input',
    source: 'legacy',
  },
  {
    ...RATING_CATALOG_ENTRY,
    route: '/components/rating',
    group: 'input',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...SCROLL_AREA_CATALOG_ENTRY,
    route: '/components/scroll-area',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...SCROLL_PANEL_CATALOG_ENTRY,
    route: '/components/scroll-panel',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...SEGMENTED_CONTROL_CATALOG_ENTRY,
    route: '/components/segmented-control',
    group: 'actions',
    source: 'legacy',
  },
  {
    id: 'select',
    name: 'Select',
    description:
      'Campo para escolher uma ou várias opções de uma lista fechada. Abre um painel com navegação por teclado, busca opcional e integração com formulários do Angular.',
    status: 'stable',
    tags: ['seleção', 'dropdown', 'lista', 'opções', 'formulário', 'select'],
    icon: 'arrow_drop_down_circle',
    route: '/components/select',
    group: 'selection',
    source: 'content',
  },
  {
    ...SELECT_BUTTON_CATALOG_ENTRY,
    route: '/components/select-button',
    group: 'input',
    source: 'legacy',
  },
  {
    ...SEPARATOR_CATALOG_ENTRY,
    route: '/components/separator',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...SKELETON_CATALOG_ENTRY,
    route: '/components/skeleton',
    group: 'display',
    source: 'legacy',
  },
  {
    ...SLIDER_CATALOG_ENTRY,
    route: '/components/slider',
    group: 'input',
    source: 'legacy',
  },
  {
    ...SPEED_DIAL_CATALOG_ENTRY,
    route: '/components/speed-dial',
    group: 'actions',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...SPINNER_CATALOG_ENTRY,
    route: '/components/spinner',
    group: 'display',
    source: 'legacy',
  },
  {
    ...SPLITTER_CATALOG_ENTRY,
    route: '/components/splitter',
    group: 'layout',
    source: 'legacy',
  },
  {
    ...STEPPER_CATALOG_ENTRY,
    route: '/components/progress?tab=stepper',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...SWITCH_CATALOG_ENTRY,
    route: '/components/switch',
    group: 'input',
    source: 'legacy',
  },
  {
    ...TAB_MENU_CATALOG_ENTRY,
    route: '/components/tab-menu',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...TABLE_CATALOG_ENTRY,
    route: '/components/table',
    group: 'data',
    source: 'legacy',
  },
  {
    ...TABS_CATALOG_ENTRY,
    route: '/components/tabs',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...TAG_CATALOG_ENTRY,
    route: '/components/tag',
    group: 'data',
    source: 'legacy',
  },
  {
    ...TAGS_INPUT_CATALOG_ENTRY,
    route: '/components/tags-input',
    group: 'selection',
    source: 'legacy',
  },
  {
    ...TERMINAL_CATALOG_ENTRY,
    route: '/components/terminal',
    group: 'utilities',
    source: 'legacy',
    status: 'experimental',
  },
  {
    ...TEXT_CATALOG_ENTRY,
    route: '/components/text',
    group: 'utilities',
    source: 'legacy',
  },
  {
    ...TIERED_MENU_CATALOG_ENTRY,
    route: '/components/tiered-menu',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...TIMELINE_CATALOG_ENTRY,
    route: '/components/timeline',
    group: 'data',
    source: 'legacy',
  },
  {
    ...TOAST_CATALOG_ENTRY,
    route: '/components/toast',
    group: 'overlays',
    source: 'legacy',
  },
  {
    ...TOGGLE_BUTTON_CATALOG_ENTRY,
    route: '/components/toggle-button',
    group: 'actions',
    source: 'legacy',
  },
  {
    ...TOOLBAR_CATALOG_ENTRY,
    route: '/components/toolbar',
    group: 'navigation',
    source: 'legacy',
  },
  {
    ...TOOLTIP_CATALOG_ENTRY,
    route: '/components/tooltip',
    group: 'overlays',
    source: 'legacy',
  },
  {
    ...TREE_CATALOG_ENTRY,
    route: '/components/tree',
    group: 'data',
    source: 'legacy',
  },
  {
    ...TREE_SELECT_CATALOG_ENTRY,
    route: '/components/tree-select',
    group: 'selection',
    source: 'legacy',
  },
  {
    ...TREE_TABLE_CATALOG_ENTRY,
    route: '/components/tree-table',
    group: 'data',
    source: 'legacy',
  },
  {
    ...TREE_VIEW_CATALOG_ENTRY,
    route: '/components/tree-view',
    group: 'data',
    source: 'legacy',
  },
  {
    ...TYPOGRAPHY_CATALOG_ENTRY,
    route: '/components/typography',
    group: 'utilities',
    source: 'legacy',
  },
  {
    ...VISUALLY_HIDDEN_CATALOG_ENTRY,
    route: '/components/visually-hidden',
    group: 'utilities',
    source: 'legacy',
  },
];

/** Guias de uso das páginas legacy (página genérica antiga). */
export const COMPONENT_USAGE_DOCS: Readonly<Record<string, ComponentUsageDoc>> =
  {
    autocomplete: AUTOCOMPLETE_USAGE_DOC,
    carousel: CAROUSEL_USAGE_DOC,
    chart: CHART_USAGE_DOC,
    chip: CHIP_USAGE_DOC,
    collapsible: COLLAPSIBLE_USAGE_DOC,
    'color-picker': COLOR_PICKER_USAGE_DOC,
    'command-menu': COMMAND_MENU_USAGE_DOC,
    'date-picker': DATE_PICKER_USAGE_DOC,
    divider: DIVIDER_USAGE_DOC,
    drawer: DRAWER_USAGE_DOC,
    editor: EDITOR_USAGE_DOC,
    'form-field': FORM_FIELD_USAGE_DOC,
    icon: ICON_USAGE_DOC,
    image: IMAGE_USAGE_DOC,
    kbd: KBD_USAGE_DOC,
    list: LIST_USAGE_DOC,
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
