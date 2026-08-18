# Orchestra Design System — coding-agent reference

This document is the machine-oriented companion to [`llms.txt`](./llms.txt). It describes the current workspace package `@ciag/orchestra` and is intentionally explicit: an agent should be able to choose a component, import it, compose it, and wire its state without guessing.

> Version context: Angular 19+, standalone components, native Signals API, strict TypeScript, tree-shakeable secondary entry points, design tokens, and WCAG 2.1 AA as the design target. The published package version in this workspace is `0.1.0`.

## 1. Operating rules for coding agents

1. Search this reference and the interactive catalog before creating a new control. If a matching `orc-*` component exists, use it.
2. Import the narrowest secondary entry point. Importing from `@ciag/orchestra/p2` is correct for the P2 primitives; importing from the component-specific entry point is preferred for P0/P1 components. The root `@ciag/orchestra` export is available when convenience is more important than bundle granularity.
3. Every consumer should be a standalone Angular component. Put library components and directives in the consumer component's `imports` array.
4. Do not treat a component's public signal as a normal property. `input()` is read by the component; `model()` supports two-way binding; `output()` is an event. In templates use `[property]`, `[(property)]`, and `(eventName)` respectively.
5. Keep the component's label and accessible name when adding custom visuals. A decorative icon is not a replacement for `label`, `ariaLabel`, `ariaLabelledby`, or `ariaDescribedby`.
6. Use the documented variants and token variables. Do not fork component CSS to recreate an existing variant, and do not hard-code a second design-token scale in an application.
7. When an API is generic, preserve its value type in the consumer. `ComboboxComponent<T>`, `ListboxComponent<T>`, `MultiSelectComponent<T>`, `SegmentedControlComponent<T>`, and table/data components are designed to carry application data without stringifying it.
8. Prefer the component's native form integration. Input, Textarea, Checkbox, Radio Group, Switch, Select, Date Picker, Date Input, Number Input, Slider, Rating, OTP Input, Chip Input, File Uploader, Tags Input, Form, and Form Field are intended to be composed rather than replaced with unrelated controls.
9. For an overlay, preserve the focus lifecycle and dismiss behavior supplied by the component. Do not implement a second Escape listener or body scroll lock unless the component explicitly delegates that responsibility.
10. If a requirement is not represented by a public input, model, output, slot, or directive below, stop and inspect the source before inventing an API. A new API should be added to the library and its docs, not hidden in the consuming app.

## 2. Installation and application setup

### Install

```bash
npm install @ciag/orchestra @angular/cdk
```

The library expects Angular 19-compatible `@angular/common`, `@angular/core`, and `@angular/forms` peers. `rxjs` is used by some services and is a peer dependency of the workspace package.

### Load the design tokens

Load the token layer before local application styles. The token layer supplies the brand values, semantic aliases, spacing scale, radii, shadows, transitions, light/dark values, and component variables.

```scss
/* src/styles.scss */
@use '@ciag/orchestra/styles/index';

/* local overrides belong after the library layer */
```

The theme follows system preference by default. A consumer may set `data-theme="dark"` on `html` when its shell owns theme selection. The docs app also exposes a manual theme toggle.

Important tokens include:

| Group | Tokens |
| --- | --- |
| Brand | `--orc-color-azul-eletrico`, `--orc-color-azul-royal`, `--orc-color-laranja`, `--orc-color-ciano`, `--orc-color-roxo-lavender`, `--orc-color-azul-navy` |
| Surfaces | `--orc-bg`, `--orc-th`, `--orc-fill-input`, `--orc-fill-modal`, `--orc-highlight-cinza-claro`, `--orc-secondary-bg`, `--orc-border`, `--orc-opposite-bw` |
| Text | `--orc-font-main`, `--orc-font-secondary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse` |
| Semantics | `--color-accent`, `--color-accent-hover`, `--color-accent-fg`, `--color-success`, `--color-error`, `--color-warning`, `--color-info` |
| Aliases | `--bg-app`, `--bg-subtle`, `--bg-muted`, `--bg-inverse`, `--border-default`, `--border-strong` |
| Layout | `--space-1` through `--space-20`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full` |

### Minimal standalone component

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';
import { InputComponent } from '@ciag/orchestra/input';

@Component({
  standalone: true,
  imports: [ButtonComponent, InputComponent],
  template: `
    <orc-input label="Project name" [(value)]="projectName" required />
    <orc-button variant="primary" (click)="save()">Save project</orc-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormComponent {
  readonly projectName = signal<string>('');

  save(): void {
    // consume projectName() here
  }
}
```

The older `[(ngModel)]` and Reactive Forms integrations remain valid where a component implements `ControlValueAccessor`; use the component's `[(value)]` model when a lightweight Signals-based form is enough.

## 3. API grammar and composition

### Inputs, models, and outputs

The following notation is used throughout this reference:

- **Input** — one-way configuration: `<orc-button [loading]="saving" />`.
- **Model** — two-way state: `<orc-input [(value)]="name" />`, or `[value]="name" (valueChange)="name = $event"`.
- **Output** — event emitted by the component: `<orc-button (click)="save()" />`.
- **Content** — projected child content between the component tags.
- **Slot** — projected content selected by an attribute such as `[prefix]`, `[suffix]`, `[iconLeft]`, `[modal-header]`, or `[drawer-title]`.
- **Directive** — behavior attached to another element, such as `[orcTooltip]`, `orc-column`, `orcCellDef`, or `orcToolbarItem`.

Boolean inputs use Angular boolean transforms. Both `[disabled]="isDisabled"` and the bare attribute `disabled` are valid. Numeric inputs that use Angular numeric transforms accept template attributes such as `min="0"`, but property binding is safer for dynamic values.

### Content projection conventions

- `orc-button` projects its label and can receive `[iconLeft]`/`[iconRight]` projected content or SVG/icon strings through `iconLeft` and `iconRight`.
- `orc-card` composes with `orc-card-header`, `orc-card-body`, and `orc-card-footer`.
- `orc-tab-group` owns `orc-tab` children; each tab's body is projected between its tags.
- `orc-accordion` owns `orc-accordion-item` children. Use `[(expanded)]` on an item when the parent needs control.
- `orc-modal` supports `modal-header`, `modal-body`, and `modal-footer` attributes in projected content.
- `orc-drawer` supports `drawer-title` and `drawer-actions` projected regions.
- `orc-popover` uses `popover-trigger` for its trigger content.
- `orc-form-field` wraps the actual input/control. It provides the label, helper, required, and error frame; do not put a second label around it.
- `orc-input` and `orc-textarea` expose `[prefix]`/`[suffix]` slots in addition to `prefixText`/`suffixText` strings.
- `orc-table` supports `orc-column` and the `orcCellDef` / `orcHeaderCellDef` template directives for custom cells.
- `orc-toolbar` uses the `[orcToolbarItem]` directive on actionable children.

### Accessibility defaults

The library supplies semantic roles, keyboard behavior, focus-visible states, and live-region semantics for its interaction components. Consumers are responsible for useful labels and correct values. In particular:

- Inputs need a visible `label` whenever one is appropriate. Use `ariaLabel` only when a visible label cannot be rendered.
- Error messages should be passed through `error`, `errorMessage`, or the component-specific validation input so `aria-invalid` and described-by relationships remain connected.
- Icon-only buttons must have `ariaLabel`; a glyph by itself is not an accessible name.
- Destructive actions use `danger`, `error`, or `status="danger"` consistently rather than a custom red class.
- Do not remove the supplied focus ring. If a shell changes the focus color, use a token with sufficient contrast.
- Keep heading hierarchy outside the component; component labels are not automatically document headings.

## 4. Complete package and entry-point map

The root public API exposes 89 secondary entry points. Alias entry points intentionally point to the canonical implementation so applications can migrate terminology without duplicating behavior.

| Entry point | Primary selector(s) or export | Purpose |
| --- | --- | --- |
| `accordion` | `orc-accordion`, `orc-accordion-item` | Expandable content |
| `alert` | `orc-alert` | Inline status and feedback |
| `avatar` | `orc-avatar`, `orc-avatar-group` | Identity and presence |
| `badge` | `orc-badge` | Compact status/count |
| `breadcrumb` | `orc-breadcrumb`, `orc-breadcrumb-item` | Hierarchical navigation |
| `button` | `orc-button`, `orc-icon-button` | Actions |
| `card` | `orc-card`, `orc-card-header`, `orc-card-body`, `orc-card-footer` | Surface composition |
| `checkbox` | `orc-checkbox` | Boolean/multi-select input |
| `chip-input` | `orc-chip-input` | Tokenized text input |
| `dropdown` | `orc-dropdown` | Contextual actions |
| `file-uploader` | `orc-file-uploader`, `orc-file-item` | File selection and upload UI |
| `input` | `orc-input`, `orc-textarea` | Text and form fields |
| `modal` | `orc-modal` | Dialog overlay |
| `otp-input` | `orc-otp-input`, `orc-otp-group`, `orc-otp-slot`, `orc-otp-separator` | One-time codes |
| `paginator` | `orc-paginator` | Page navigation |
| `progress` | `orc-progress-bar`, `orc-progress-circle` | Progress and loading |
| `radio` | `orc-radio-group`, `orc-radio-button` | Single selection |
| `rating` | `orc-rating` | Star/score input |
| `select` | `orc-select`, `orc-option` | Select and option composition |
| `skeleton` | `orc-skeleton` | Loading placeholder |
| `slider` | `orc-slider` | Numeric/range input |
| `spinner` | `orc-spinner` | Busy indicator |
| `stepper` | `orc-stepper` | Sequential progress/navigation |
| `switch` | `orc-switch` | Boolean toggle |
| `table` | `orc-table`, `orc-column`, `[orcCellDef]`, `[orcHeaderCellDef]` | Tabular data |
| `tabs` | `orc-tab-group`, `orc-tab` | Tab navigation |
| `toast` | `orc-toast-container`, `orc-toast` | Notifications |
| `tooltip` | `[orcTooltip]`, `orc-tooltip-overlay` | Short contextual help |
| `dialog` | `DialogComponent` alias of `ModalComponent` | Modal terminology alias |
| `menu` | `MenuComponent` | PrimeNG-style model/popup menu |
| `pagination` | `PaginationComponent` alias of `PaginatorComponent` | Pagination terminology alias |
| `drawer` | `orc-drawer` | Side/top/bottom panel |
| `popover` | `orc-popover` | Contextual content |
| `date-picker` | `orc-date-picker` | Native date field |
| `tree-view` | `orc-tree-view` | Expandable hierarchy |
| `form-field` | `orc-form-field` | Label/control/help wrapper |
| `list` | `orc-list` | Accessible list |
| `autocomplete` | `orc-autocomplete` | Filtered option selection |
| `carousel` | `orc-carousel` | Slides |
| `chip` | `orc-chip` | Compact label/filter |
| `collapsible` | `orc-collapsible` | Disclosure section |
| `color-picker` | `orc-color-picker` | Hex/preset color selection |
| `divider` | `orc-divider` | Visual/semantic separation |
| `form` | `orc-form` | Native form wrapper |
| `icon` | `orc-icon` | Named system icon |
| `image` | `orc-image` | Image with fallback |
| `number-input` | `orc-number-input` | Numeric field |
| `scroll-area` | `orc-scroll-area` | Bounded scrolling |
| `text-input` | `TextInputComponent` alias of `InputComponent` | Input terminology alias |
| `timeline` | `orc-timeline` | Event sequence |
| `toggle` | `ToggleComponent` alias of `SwitchComponent` | Toggle terminology alias |
| `toolbar` | `orc-toolbar`, `[orcToolbarItem]` | Roving action group |
| `button-group` | `orc-button-group` | Grouped actions |
| `calendar` | `orc-calendar` | Month/date grid |
| `code` | `orc-code` | Copyable code block |
| `combobox` | `orc-combobox` | Generic searchable selection |
| `file-upload` | `FileUploadComponent` alias of `FileUploaderComponent` | Upload terminology alias |
| `grid` | `orc-grid` | Responsive columns |
| `kbd` | `orc-kbd` | Keyboard shortcut label |
| `link` | `orc-link` | Styled semantic link |
| `menubar` | `orc-menubar` | Menu bar navigation |
| `splitter` | `orc-splitter` | Resizable panels |
| `tag` | `orc-tag` | Removable semantic tag |
| `typography` | `orc-typography` | Typed text primitive |
| `aspect-ratio` | `orc-aspect-ratio` | Ratio-constrained surface |
| `container` | `orc-container` | Max-width/padding layout |
| `floating-action-button` | `orc-floating-action-button` | Floating action |
| `hover-card` | `orc-hover-card` | Hover/focus preview |
| `portal` | `orc-portal` | Content target/portal primitive |
| `segmented-control` | `orc-segmented-control` | Compact single selection |
| `separator` | `orc-separator` | P2 separator alias |
| `stack` | `orc-stack` | One-dimensional layout |
| `visually-hidden` | `orc-visually-hidden` | Screen-reader-only content |
| `box` | `orc-box` | Surface/layout primitive |
| `close-button` | `orc-close-button` | Named close action |
| `context-menu` | `orc-context-menu` | Right-click menu |
| `data-table` | `orc-data-table` | Lightweight data table |
| `date-input` | `orc-date-input` | P2 native date field |
| `empty-state` | `orc-empty-state` | No-data message |
| `flex` | `orc-flex` | Flex layout primitive |
| `input-group` | `orc-input-group` | Prefix/suffix composition |
| `listbox` | `orc-listbox` | Generic option list |
| `multi-select` | `orc-multi-select` | Generic multiple selection |
| `space` | `orc-space` | Explicit layout gap |
| `speed-dial` | `orc-speed-dial` | Floating action group |
| `tags-input` | `orc-tags-input` | P2 string tag field |
| `text` | `orc-text` | P2 text primitive |
| `tree-select` | `orc-tree-select` | Hierarchical selection |
| `virtual-scroller` | `orc-virtual-scroller` | Bounded large-list viewport |

## 5. Detailed component reference

The following sections list every public property currently exposed by the implementation. “Default” is the source default; a value such as `boolean` means the input is transformed from a bare HTML attribute. Models and outputs are separated so agents do not accidentally treat an event as state.

### Foundation and feedback components

#### `orc-button` and `orc-icon-button` — `@ciag/orchestra/button`

Use `orc-button` for a labeled action or navigation trigger. Use `orc-icon-button` only when the action is genuinely icon-only and provide its accessible label through the icon button API or surrounding context.

- `orc-button` inputs: `variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger'` (primary); `size: 'sm' | 'md' | 'lg'` (md); `disabled` (false); `loading` (false); `fullWidth` (false); `iconLeft?: string`; `iconRight?: string`; `iconOnly` (false); `type: 'button' | 'submit' | 'reset'` (button); `ariaLabel` (empty).
- `orc-button` output: `click: MouseEvent`.
- `orc-icon-button` inputs: `variant` with the same six values (primary); `size` with the same three values (md); `disabled` (false); `loading` (false); `icon?: string`.
- `orc-icon-button` output: `click: MouseEvent`.
- Variations: primary for the main task, secondary for lower-emphasis actions, outline for bordered alternatives, ghost for quiet toolbars, link for inline navigation, danger for destructive tasks; sm/md/lg; loading preserves layout and blocks interaction; icon-left/right and icon-only.
- Content: button label is projected between tags. SVG strings may be passed to `iconLeft`/`iconRight`; the component sanitizes them for rendering.

```html
<orc-button variant="primary" [loading]="saving" (click)="save()">Save</orc-button>
<orc-icon-button icon="search" ariaLabel="Search" variant="ghost" />
```

#### `orc-alert` — `@ciag/orchestra/alert`

Inline feedback with semantic live-region behavior. `severity` accepts `info | success | warning | error`; `status` is an alias that overrides severity. `variant` accepts `subtle | soft | filled | solid | outline` (`subtle`). Other inputs: `title`, `message`, `showIcon` (true), `dismissible` (false), `role?`, `ariaLabel`, and `closeAriaLabel` (`Fechar alerta`). Outputs are `onClose: MouseEvent` and `closed: void`. Use `error`/`warning` for urgent validation or risk; use `info` for guidance. Project content when a message string is not enough.

#### `orc-badge` — `@ciag/orchestra/badge`

Compact status/count, not a replacement for a button. Inputs: `variant: soft | solid | outline | dot | ghost` (soft); `status: primary | secondary | success | warning | danger | info | neutral | pending | active | inactive | new | completed` (primary); `size: sm | md | lg` (md); `text`; `count?`; `maxCount` (99); `dot`; `showDefaultIcon`; `dismissible`; `pill`; `ariaLabel`. Output: `dismiss: MouseEvent`. `count` renders `+maxCount` when it exceeds the limit. Use `showDefaultIcon` only when the status icon adds meaning.

#### `orc-spinner`, `orc-skeleton`, and progress — `@ciag/orchestra/spinner`, `@ciag/orchestra/skeleton`, `@ciag/orchestra/progress`

- `orc-spinner` inputs: `size: sm | md | lg` (md), `customSize`, `variant: primary | secondary | neutral | white` (primary), `type: ring | star | dots` (ring), `text`, `textPosition: right | bottom` (right), `fullScreen` (false), `backdrop` (true), `ariaLabel` (`Carregando...`). Use full-screen only for an application-level blocking state.
- `orc-skeleton` inputs: `variant: text | circular | rectangular` (text), `animation: shimmer | pulse | none` (shimmer), `width`, `height`, `borderRadius`, `ariaLabel` (`Carregando conteúdo...`). Match dimensions of the content being replaced.
- `orc-progress-bar` inputs: `value` (0), `mode: determinate | indeterminate` (determinate), `variant: primary | neutral | success | warning | error | danger` (primary), `size: sm | md | lg | xl` (md), `label`, `showValue`, `valuePrefix`, `valueSuffix` (`%`), `rounded` (true), `segments` (0), `currentSegment` (0), `customHeight`, `customColor`, `customTrackColor`, `ariaLabel`, `ariaValueText`.
- `orc-progress-circle` inputs: `value`, `mode`, `variant`, `size: ProgressSize | number`, `strokeWidth?`, `showValue`, `rounded`, `valuePrefix`, `valueSuffix`, `label`, `customColor`, `customTrackColor`, `ariaLabel`, `ariaValueText`. The defaults match the bar unless otherwise stated (`size=md`, value=0, determinate, rounded=true).
- Progress variations: determinate vs indeterminate; semantic color; sm/md/lg/xl; segmented bar when `segments > 0`; custom colors only for a product-specific token not yet represented by the semantic variants.

#### `orc-card` and card parts — `@ciag/orchestra/card`

`orc-card` inputs are `clickable` (false), `selected` (false), and `variant: 'simple' | 'dashboard'` (`simple`); output is `cardClick: void`. Use `orc-card-header`, `orc-card-body`, and `orc-card-footer` for stable composition. The three parts have no public inputs or outputs and only project content. A clickable card is not a substitute for a button: place the primary action in a real `orc-button` when the user must act.

#### `orc-avatar` and `orc-avatar-group` — `@ciag/orchestra/avatar`

- `orc-avatar` inputs: `src`, `name`, `initials`, `alt`, `size: xs | sm | md | lg | xl` (md), `shape: circular | rounded | square` (circular), `status?: online | offline | busy | away`, `statusPosition: top-right | bottom-right | top-left | bottom-left` (bottom-right), `colorVariant: default | primary | royal | orange | purple | cyan | auto` (default), `bordered` (false), `clickable` (false). Outputs: `imageError: Event`, `avatarClick: MouseEvent`.
- `orc-avatar-group` inputs: `items: AvatarItem[]` (each item may have `src`, `name`, `initials`, `alt`, `status`, `colorVariant`), `max` (0 means no cap), `size` (md), `shape` (circular), `excessCount` (0), `excessColorVariant` (default), `bordered` (true).
- If `src` is absent, provide `name` or `initials` so the fallback remains meaningful. `alt` must describe the person when the image is informative.

### Data entry components

#### `orc-input` and `orc-textarea` — `@ciag/orchestra/input`

Both implement `ControlValueAccessor` and expose a Signals model. Use `[(value)]` for a signal-driven form or `formControl`/`ngModel` when integrating with an existing Angular form.

- `orc-input` inputs: `id`, `name`, `type: text | email | password | number | search | tel | url` (text), `size: sm | md | lg` (md), `status: default | error | success` (default), `placeholder` (`Digite algo...`), `label`, `helperText`, `errorMessage`, `disabled`, `readonly`, `required`, `clearable`, `mask`, `unmaskValue`, `maxLength?`, `minLength?`, `min?`, `max?`, `step?`, `showCharCount`, `prefixText`, `suffixText`, `autocomplete` (off), `autofocus`, `ariaLabel`, `ariaDescribedby`.
- `orc-input` model: `value: string | number` (empty string).
- `orc-input` outputs: `inputChange: string | number`, `blur: FocusEvent`, `focus: FocusEvent`, `clear: void`.
- `orc-textarea` inputs: `id`, `name`, `size: sm | md | lg`, `status: default | error | success`, `placeholder`, `label`, `helperText`, `errorMessage`, `disabled`, `readonly`, `required`, `rows` (4), `resize: none | vertical | horizontal | both` (vertical), `autoResize`, `maxLength?`, `minLength?`, `showCharCount`, `autofocus`, `ariaLabel`, `ariaDescribedby`.
- `orc-textarea` model: `value: string`; outputs: `inputChange: string`, `blur`, `focus`.
- Variations: helper vs error (error wins), disabled vs readonly, clearable/search, masked/unmasked, prefix/suffix, character count, sm/md/lg. Do not pass `errorMessage` without `status="error"`.

```html
<orc-input label="Email" type="email" [(value)]="email" required clearable
  helperText="Use your work address." />
<orc-textarea label="Description" [(value)]="description" [maxLength]="240" showCharCount />
```

#### `orc-form-field` and `orc-form` — `@ciag/orchestra/form-field`, `@ciag/orchestra/form`

- `orc-form-field` inputs: `label`, `helperText`, `error`, `required`. It projects the actual control. Pass the error here when wrapping a native or third-party control so the field frame remains consistent.
- `orc-form` inputs: `layout: 'stacked' | 'inline'` (stacked), `name`, `ariaLabel` (`Formulário`), `disabled`, `novalidate` (true). Outputs: `formSubmit: FormSubmitEvent`, `formReset: void`. It projects form controls and uses native validation when `novalidate` is false.

#### `orc-checkbox`, `orc-radio-group`/`orc-radio-button`, and `orc-switch` — `@ciag/orchestra/checkbox`, `@ciag/orchestra/radio`, `@ciag/orchestra/switch`

- `orc-checkbox` inputs: `id`, `name`, `value`, `label`, `description`, `disabled`, `required`, `error`, `errorMessage`, `ariaLabel`, `ariaLabelledby`, `ariaDescribedby`. Models: `checked: boolean` (false), `indeterminate: boolean` (false). Output: `change: { checked, indeterminate, value? }`.
- `orc-radio-group` inputs: `name` (generated), `layout: vertical | horizontal` (vertical), `disabled`, `error`, `errorMessage`, `label`, `hint`, `ariaLabel`. Model: `value: any` (null). Output: `valueChange: any`.
- `orc-radio-button` inputs: `value`, `label`, `description`, `disabled`, `error`, `name`, `id`, `ariaLabel`. Output: `select: any`. Use it as a child of `orc-radio-group` so one group owns the roving selection.
- `orc-switch` inputs: `id`, `name`, `value`, `label`, `description`, `size: sm | md | lg` (md), `labelPosition: start | end` (end), `disabled`, `required`, `error`, `errorMessage`, `ariaLabel`, `ariaLabelledby`, `ariaDescribedby`. Model: `checked: boolean` (false). Output: `change: SwitchChangeEvent`.
- `toggle` is an alias entry point exporting `ToggleComponent` from the switch implementation. Prefer `@ciag/orchestra/switch` and `orc-switch` for new code.

#### `orc-select` and `orc-option` — `@ciag/orchestra/select`

`orc-select` inputs: `id`, `name`, `placeholder` (`Selecione uma opção`), `label`, `helperText`, `errorMessage`, `status: default | error | success` (default), `multiple`, `searchable`, `searchPlaceholder` (`Buscar...`), `searchEmptyText` (`Nenhum resultado encontrado`), `disabled`, `readonly`, `required`, `clearable`, `options?: SelectOption[]`, `ariaLabel`, `ariaDescribedby`. Model: `value: any`. Outputs: `selectionChange: any`, `searchChange: string`, `opened`, `closed`, `blur`, `focus`. `SelectOption` supports `label`, `value`, optional `description`, `icon`, `avatarUrl`, `group`, and `disabled`. `orc-option` inputs: `id`, `label`, `description?`, `icon?`, `avatarUrl?`, `disabled`. Use the `options` input for data-driven lists or project `orc-option` children for composition.

#### `orc-autocomplete`, `orc-number-input`, and `orc-date-picker`

- `orc-autocomplete` inputs: `id`, `name`, `label`, `placeholder` (`Comece a digitar...`), `helperText`, `errorMessage`, `options: AutocompleteOption[]`, `minChars` (0), `clearable` (true), `disabled`, `required`, `ariaLabel`. Model: `value: string | null` (null). Output: `optionSelected: AutocompleteOption`. An option contains `value`, `label`, and optional `description`/`disabled`. The emitted value is the option's value, not its visible label.
- `orc-number-input` inputs: `id`, `name`, `label`, `placeholder`, `helperText`, `errorMessage`, `status: default | error | success` (default), `size: sm | md | lg` (md), `min?`, `max?`, `step` (1), `precision?`, `prefix`, `suffix`, `disabled`, `readonly`, `required`, `showControls` (true), `ariaLabel`. Model: `value: number | null` (null). Outputs: `valueChange`, `blur`. Values are clamped to min/max and formatted to precision for presentation.
- `orc-date-picker` model: `value: string` (empty, ISO `yyyy-MM-dd`). Inputs: `label`, `min`, `max`, `helperText`, `error`, `required`, `disabled`. It is a native date control and is compatible with Angular forms. Pass ISO values, not localized display strings.

#### `orc-slider`, `orc-rating`, `orc-otp-input`, `orc-chip-input`, and file upload

- `orc-slider` inputs: `id`, `name`, `range` (false), `min` (0), `max` (100), `step` (1), `size: sm | md | lg` (md), `disabled`, `showTicks`, `showLabels`, `showTooltip: auto | always | never` (auto), `label`, `helperText`, `ariaLabel`, `ariaLabelMin` (`Valor mínimo`), `ariaLabelMax` (`Valor máximo`). Model: `value: number | [number, number]` (0). Outputs: `sliderChange`, `sliderInput`. Set `range` when the model is a tuple.
- `orc-rating` inputs: `id` (generated), `max` (5), `allowHalf`, `numeric`, `clearable`, `readonly`, `disabled`, `tooltips: string[]`. Model: `value: number` (0). Use readonly for display-only scores; use `clearable` only when zero is a meaningful explicit choice.
- `orc-otp-input` inputs: `length` (6), `placeholder`, `disabled`, `inputMode: numeric | text` (numeric), `ariaLabel` (`Código de verificação`). Model: `value: string` (empty). Output: `completed: string`. Compound exports `orc-otp-group`, `orc-otp-slot`, and `orc-otp-separator`; use those when each slot needs custom composition.
- `orc-chip-input` inputs: `id`, `label`, `placeholder` (`Digite e pressione Enter...`), `helperText`, `errorMessage`, `disabled`, `readonly`, `size: sm | md | lg` (md), `allowDuplicates`, `maxChips?`, `separatorKeyCodes` (`Enter`, `,`, space), `suggestions: string[]`. Outputs: `chipsChange: string[]`, `maxReached: void`. It is not the same as `orc-chip`: the former edits a collection, the latter renders one compact value.
- `orc-file-uploader` inputs: `accept`, `multiple` (true), `maxFiles` (10), `maxFileSize` (5, MB), `disabled`, `label` (`Clique ou arraste seus arquivos aqui`), `subLabel` (`Suporta imagens e PDFs`), `forceDragover` (false). It composes with `orc-file-item`, whose input is `disabled` and whose output is `remove: string`. `FileItemData` includes `id`, `file`, `name`, `size`, `formattedSize`, `type`, `progress`, `status: pending | uploading | success | error`, optional `errorMessage` and `previewUrl`.

### Navigation, disclosure, and overlays

#### `orc-breadcrumb`, `orc-tabs`, `orc-paginator`, `orc-stepper`

- `orc-breadcrumb` inputs: `items?: BreadcrumbItemData[]`, `separator: chevron | slash | arrow` (chevron), `variant: default | underlined` (default), `maxItems?`, `itemsBeforeCollapse` (1), `itemsAfterCollapse` (1), `ariaLabel` (`Breadcrumb`). Output: `itemClick: { item, index }`. A `BreadcrumbItemData` contains `label` plus optional `routerLink`, `href`, `active`, `disabled`, and `icon`. The compound `orc-breadcrumb-item` exposes the same item inputs and `itemClick: MouseEvent`.
- `orc-tab-group` inputs: model `selectedIndex: number` (0), `variant: line | filled` (line), `size: sm | md | lg` (md), `fullWidth` (false), `ariaLabel` (`Abas de navegação`). Output: `tabChange: { index, tab }`.
- `orc-tab` inputs: `label`, `icon`, `iconPosition: start | end` (start), `disabled`, `badge?`, `id`. Its body is projected content. Built-in icon names recognized by the tab renderer include `home`, `settings`, and `warning`.
- `orc-paginator` inputs: `totalItems` (0), model `pageSize` (10), model `currentPage` (1), `pageSizeOptions` ([10, 20, 50]), `showPageSizeSelector` (true), `showFirstLastButtons` (false), `showPrevNextButtons` (true), `showTotalInfo` (false), `disabled`, `size: sm | md | lg` (md), `maxVisiblePages` (7), `previousLabel` (`Anterior`), `nextLabel` (`Próximo`), `firstLabel` (`Primeira`), `lastLabel` (`Última`), `itemsPerPageLabel` (`Página`), `ariaLabel` (`Paginação`). Outputs: `pageChange: PageChangeEvent`, `pageSizeChange: number`. `PageChangeEvent` includes page, pageSize, totalPages, startIndex, endIndex, and totalItems.
- `orc-stepper` inputs: `steps: StepItem[]`, model `currentStep` (0), `orientation: horizontal | vertical` (horizontal), `type: numeric | icon` (numeric), `clickable` (true), `linear` (false). Output: `stepChange: { step, index }`. A step has `title`, optional `subtitle`, `description`, `icon`, `status: pending | active | completed | loading | error`, `progress`, and `disabled`.

#### `orc-accordion` and `orc-collapsible`

- `orc-accordion` inputs: `multiple` (false), `variant: default | separated | bordered` (default); output `expandedChange: AccordionToggleEvent` (`{ id, expanded }`). Its child `orc-accordion-item` inputs are `id`, `title`, `subtitle`, `icon`, `disabled`, `hideToggle`; model `expanded` (false); outputs `opened`, `closed`, and `toggle: boolean`.
- `orc-collapsible` inputs: `id`, `title`, `summary`, model `open` (false), `disabled`, `lazy`; output `toggleChange: boolean`. Use `lazy` when the body is expensive and may be skipped until first open.

#### `orc-modal`, `orc-drawer`, `orc-popover`, and `orc-dropdown`

- `orc-modal` model: `isOpen: boolean` (false). Inputs: `size: sm | md | lg | xl | fullScreen | custom` (md), `status: neutral | danger` (neutral), `inline` (false), `closeOnBackdropClick` (true), `showCloseButton` (true), `ariaLabelledBy`, `ariaDescribedBy`, `zIndex` (1000). Output: `closed`. Escape is handled by the native dialog lifecycle; the previous active element is restored. Use `modal-header`, `modal-body`, and `modal-footer` slots.
- `orc-drawer` model: `open` (false). Inputs: `placement: left | right | top | bottom` (right), `label` (`Painel lateral`), `closeOnBackdrop` (true), `dismissible` (true). Output: `closed`. Use `drawer-title` and `drawer-actions` slots. A non-dismissible drawer must still expose a clear internal close action.
- `orc-popover` model: `open` (false). Inputs: `placement: top | right | bottom | left` (bottom), `label` (`Conteúdo adicional`). Its trigger is projected with `[popover-trigger]`. It closes on Escape/outside interaction according to the implementation.
- `orc-dropdown` inputs: `items: DropdownItem[]` (empty), `placement` (`bottom-start`); output `itemSelect: DropdownItem`. A `DropdownItem` has `label` and optional `id`, `icon`, `shortcut`, `danger`, `disabled`, `divider`, `action`, and recursive `children`. Keep the trigger a real button. `menu` is a separate PrimeNG-style model/popup menu entrypoint.

#### `orc-tooltip`, `orc-drawer`, and named navigation aliases

The tooltip API is a directive. Attach `[orcTooltip]`, `[appTooltip]`, or `[uiTooltip]` with a string. Directive inputs are `tooltipPosition: top | bottom | left | right` (top), `tooltipTheme: dark | light` (dark), `tooltipShowDelay` (150 ms), `tooltipHideDelay` (100 ms), and `tooltipDisabled` (false). A tooltip is for short supplementary text, never critical information or a form error. `dialog` aliases `ModalComponent`; `pagination` aliases `PaginatorComponent`; `text-input` aliases `InputComponent` as `TextInputComponent`.

### Data display and media

#### `orc-list`, `orc-tree-view`, `orc-timeline`, `orc-carousel`

- `orc-list` input: `items: ListItem[]` (empty). Each item is `{ id: string; label: string; description?: string; disabled?: boolean; selected?: boolean }`. The list component exposes selection behavior through its implementation; use stable ids and handle item activation at the consumer boundary.
- `orc-tree-view` inputs: `nodes: TreeNode[]` (empty), `label` (`Árvore`); output `nodeSelect: TreeNode`. `TreeNode` is `{ id: string; label: string; children?: TreeNode[]; disabled?: boolean }`. Expansion is internal; Enter/Space activates and ArrowRight/ArrowLeft expand or collapse.
- `orc-timeline` inputs: `items: TimelineItem[]` (empty), `orientation: vertical | horizontal` (vertical), `ariaLabel` (`Timeline`); output `itemSelect: { item, index }`. Items have `title`, optional `description`, `date`, `icon`, and `status: pending | current | completed | error`.
- `orc-carousel` inputs: `items: CarouselItem[]` (empty), model `activeIndex` (0), `orientation: horizontal | vertical` (horizontal), `loop` (true), `autoplay` (false), `interval` (5000 ms), `showArrows` (true), `showIndicators` (true), `ariaLabel` (`Carousel`). Output `slideChange: { index, item }`. A `CarouselItem` has `label`, optional `id`, `description`, `image`, `alt`, and `disabled`.

#### `orc-table`, `orc-data-table`, `orc-empty-state`, `orc-image`

- `orc-table<T>` inputs: `data: T[]` (empty), `columnsConfig?: TableColumnConfig[]`, `rowKey` (`id`), `selectable` (false), model `selectedRows: T[]` (empty), model `sortColumn` (empty), model `sortDirection: asc | desc | none` (none), `striped` (false), `bordered` (true), `hoverable` (true), `loading` (false), `loadingRowsCount` (5), `emptyTitle` (`Nenhum dado encontrado`), `emptyMessage`, `paginated` (false), model `pageSize` (5), model `currentPage` (1), `totalItems?`, `pageSizeOptions` ([5, 10, 20, 50]). Outputs: `selectionChange: T[]`, `sortChange: TableSortEvent`, `rowClick: T`. A column config includes `key`, `header`, optional `sortable`, `width`, and `align: left | center | right`. Use `orc-column` plus the cell directives for custom templates.
- `orc-data-table` is the P2 lightweight generic table. Inputs: `data: Record<string, unknown>[]`, `columns: DataTableColumn[]`, `rowKey` (`id`), `label` (`Data table`), `emptyText` (`No data`), `loading` (false), `selectable` (false), model `selected: Record<string, unknown>[]`. Outputs: `rowClick`, `selectionChange`, and `sortChange: { key, direction: ascending | descending }`. A data table column contains `key`, `label`, and optional `sortable`.
- `orc-empty-state` inputs: `title` (`Nothing here yet`), `description` (`There is no content to show.`), `icon` (`∅`), `actionLabel` (empty). Output: `action: void`. Use the action only when a meaningful recovery or creation path exists.
- `orc-image` inputs: `src`, `alt`, `fallbackSrc`, `fit: contain | cover | fill | none | scale-down` (cover), `width`, `height`, `loading: eager | lazy` (lazy), `radius: none | sm | md | lg | full` (md), `placeholder` (`Imagem indisponível`), `ariaLabel`. Outputs: `loaded: void`, `error: Event`. Always provide meaningful `alt`, or an empty alt only for decorative images.

#### `orc-icon`, `orc-code`, `orc-kbd`, and `orc-badge`

- `orc-icon` inputs: `name: arrow-left | arrow-right | check | chevron-down | chevron-left | chevron-right | chevron-up | close | info | menu | minus | plus | search | star | warning | x-circle | circle` (circle), `size: xs | sm | md | lg | xl | number` (md), `strokeWidth` (2), `ariaLabel`, `title`. A decorative icon should not receive a redundant spoken label.
- `orc-code` inputs: `code`, `language` (`text`), `copyLabel` (`Copy`), `copiedLabel` (`Copied`). Output: `copiedEvent: string`. Use for code examples that need consistent copy behavior; do not build a bespoke pre/code toolbar.
- `orc-kbd` inputs: `keys: string | string[]` (`⌘ K`), `ariaLabel`. Use for discoverable keyboard shortcuts, not as an interactive control.

### P1 inputs, utilities, and primitives

#### `orc-chip`, `orc-divider`, `orc-color-picker`, `orc-icon`, `orc-image`, `orc-number-input`, `orc-scroll-area`, `orc-toolbar`

- `orc-chip` inputs: `label`, `value: string | number`, `variant: neutral | primary | success | warning | danger` (neutral), `size: sm | md | lg` (md), `selectable`, `removable`, `disabled`; model `selected` (false); output `removed: string | number`. Use selectable chips for filters, not primary actions.
- `orc-divider` inputs: `orientation: horizontal | vertical` (horizontal), `variant: solid | dashed | dotted` (solid), `label`, `inset`, `decorative` (true), `ariaLabel`. If `decorative=false`, provide a meaningful label or aria label.
- `orc-color-picker` inputs: `id`, `label`, model `value` (`#1C6AED`), `size: sm | md | lg` (md), `presets: string[]`, `disabled`, `clearable` (true), `showInput` (true), `ariaLabel` (`Escolher cor`). Output `colorChange: string`. Values are 3- or 6-digit hexadecimal strings.
- `orc-scroll-area` inputs: `orientation: vertical | horizontal | both` (vertical), `maxHeight` (`240px`), `maxWidth`, `alwaysShowScrollbar`, `label` (`Scrollable content`). Output `scrolled: { top, left }`.
- `orc-toolbar` inputs: `orientation: horizontal | vertical` (horizontal), `label` (`Toolbar`), `loop` (true). Its `[orcToolbarItem]` directive has `disabled` (false). Use the directive on focusable actions so arrow-key navigation remains coherent.

#### `orc-form`-adjacent aliases

`text-input` is a named alias of `InputComponent`. `toggle` is a named alias of `SwitchComponent`. `file-upload` is a named alias of `FileUploaderComponent`. `dialog` and `pagination` are aliases described above. `menu` is a separate PrimeNG-style model/popup menu component.

### P2 expansion components

P2 components are exported both through `@ciag/orchestra/p2` and, where available, a component-specific secondary entry point. All P2 components are standalone and use the same Signals conventions.

#### Layout primitives

- `orc-button-group` — inputs `orientation: horizontal | vertical` (horizontal), `attached` (false), `label` (`Button group`). Project `orc-button` children; use attached only when the actions form one visual control.
- `orc-grid` — inputs `columns` (0 = auto), `minColumnWidth` (`12rem`), `gap` (`1rem`), `alignItems: start | center | stretch | end` (stretch), `label`.
- `orc-aspect-ratio` — inputs `ratio` (`16 / 9`) and `overflow: hidden | visible` (hidden). Project media/content inside.
- `orc-container` — inputs `maxWidth` (`72rem`), `padding` (`1rem`), `fluid` (false). Use for page-width boundaries, not arbitrary per-section margins.
- `orc-flex` — inputs `direction: row | row-reverse | column | column-reverse` (row), `gap` (`1rem`), `align: start | center | end | stretch | baseline` (stretch), `justify: start | center | end | space-between | space-around | space-evenly` (start), `wrap` (false).
- `orc-stack` — inputs `direction: row | column` (column), `gap` (`1rem`), `align: start | center | end | stretch` (stretch), `justify: start | center | end | space-between` (start).
- `orc-space` — inputs `size` (`1rem`), `direction: row | column` (row), `wrap` (false). Prefer this over empty spacer elements.
- `orc-box` — inputs `padding` (`0`), `margin` (`0`), `background`, `radius` (`.5rem`), `width`. Use it for tokenized surface composition; do not use it to hide an interaction.
- `orc-separator` — inputs `orientation: horizontal | vertical` (horizontal), `label`. `separator` is a P2 entry point distinct from the P1 `divider`; use the latter when dashed/inset/decorative behavior is needed.
- `orc-visually-hidden` — no public inputs. Project content that should remain available to assistive technology but visually clipped.

#### Typography and navigation primitives

- `orc-typography` — inputs `as: span | p | h1 | h2 | h3` (span), `size: xs | sm | md | lg | xl` (md), `weight: number | string` (400), `color`, `truncate` (false). Choose the semantic `as` separately from visual size.
- `orc-text` — inputs `size: sm | md | lg` (md), `muted` (false), `truncate` (false). Use for compact copy, not headings.
- `orc-link` — inputs `href` (`#`), `target`, `ariaLabel`, `underline` (false), `disabled` (false); output `activated: MouseEvent`. Use for navigation and provide a real href.
- `orc-menubar` — inputs `items: MenubarItem[]` (empty), `label` (`Main menu`), `loop` (true); output `itemSelect: MenubarItem`. `MenubarItem` extends `P2Option<string>` with the same id/label/value/disabled data pattern.
- `orc-kbd` — inputs `keys` and `ariaLabel` as described above.

#### Selection and field primitives

The shared generic option shape is:

```ts
export interface P2Option<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}
```

- `orc-combobox<T>` — inputs `options: P2Option<T>[]` (empty), model `value: T | null` (null), model `query` (empty), model `open` (false), `label`, `placeholder` (`Search…`), `helperText`, `emptyText` (`No results`), `disabled` (false); output `optionSelected: P2Option<T>`.
- `orc-calendar` — models `value` (empty) and `currentMonth` (current `yyyy-MM` month); inputs `min`, `max`, `disabled` (false), `ariaLabel` (`Calendar`); output `dateSelected: string`. Dates are ISO strings.
- `orc-date-input` — model `value` (empty); inputs `label`, `name`, `min`, `max`, `helperText`, `error`, `required`, `disabled`, `readonly`. It implements `ControlValueAccessor`.
- `orc-input-group` — inputs `label`, `prefix`, `suffix`; project the control in the group body.
- `orc-listbox<T>` — inputs `options: P2Option<T>[]`, model `value: T | T[] | null`, `multiple` (false), `label`, `ariaLabel` (`Listbox`), `emptyText` (`No options`); output `optionSelected: P2Option<T>`.
- `orc-multi-select<T>` — inputs `options: P2Option<T>[]`, model `value: T[]` (empty), `label`, `placeholder` (`Select options`), `emptyText` (`No options`), `disabled`; model `open` (false); output `optionSelected: P2Option<T>`.
- `orc-tags-input` — model `value: string[]` (empty); inputs `label`, `placeholder` (`Add a tag…`), `helperText`, `suggestions`, `maxTags?`, `disabled`; outputs `tagAdded: string`, `tagRemoved: string`. It implements `ControlValueAccessor`.
- `orc-segmented-control<T>` — inputs `options: P2Option<T>[]`, model `value: T | null` (null), `label` (`Options`), `disabled`; output `valueChangeEvent: T`. Use when the set is short and mutually exclusive.
- `orc-tree-select` — inputs `nodes: TreeSelectNode[]`, model `value: string | null`, `label`, `placeholder` (`Select an item`), `disabled`; model `open` (false); output `nodeSelect: TreeSelectNode`. `TreeSelectNode` extends `P2Option<string>` with optional `children: TreeSelectNode[]`.

#### Data, code, and collection components

- `orc-code` — inputs `code`, `language` (`text`), `copyLabel` (`Copy`), `copiedLabel` (`Copied`); output `copiedEvent: string`.
- `orc-data-table` — inputs/model/outputs are listed in the data display section. Use it for P2 records and `orc-table<T>` for the richer generic table API.
- `orc-empty-state` — inputs `title`, `description`, `icon`, `actionLabel`; output `action`.
- `orc-virtual-scroller` — inputs `items: unknown[]`, `itemHeight` (40), `viewportHeight` (`240px`), `overscan` (4), `label` (`Scrollable list`), `itemLabelKey` (`label`); output `rangeChange: { start, end }`. Keep item height stable; it is the basis for range calculation.
- `orc-tag` — inputs `label` (`Tag`), `variant: neutral | primary | success | warning | danger` (neutral), `removable`, `disabled`; output `removed: string`. Use `orc-chip` when selection is part of the interaction; use `orc-tag` for entity/status labels.
- `orc-hover-card` — model `open` (false); input `label` (`Details`). Use for non-critical preview content on hover or focus, never for content that cannot be reached by keyboard focus.

#### Overlay and advanced layout components

- `orc-floating-action-button` — inputs `label`, `icon` (`+`), `ariaLabel` (`Create`), `extended`, `loading`, `disabled`; output `clicked: MouseEvent`. Use one primary floating action per context.
- `orc-close-button` — inputs `ariaLabel` (`Close`), `icon` (`×`), `size: sm | md | lg` (md), `disabled`; output `close: void`. Prefer it inside an overlay or dismissible feedback pattern.
- `orc-context-menu` — input `items: ContextMenuItem[]`, model `open` (false); outputs `itemSelect: ContextMenuItem`, `opened: { x, y }`. `ContextMenuItem` extends `P2Option<string>` with optional `danger`, `shortcut`, `children`.
- `orc-speed-dial` — input `actions: SpeedDialAction[]`, model `open` (false), `icon` (`+`), `openLabel` (`Open actions`), `closeLabel` (`Close actions`); output `actionSelect: SpeedDialAction`. Keep labels and ordering stable.
- `orc-portal` — input `target: HTMLElement | null` (null). Use only when a composition explicitly needs to render in another target; overlays already own their portal/lifecycle behavior.
- `orc-splitter` — inputs `panels: SplitterPanel[]`, `orientation: horizontal | vertical` (horizontal), `label` (`Resizable panels`); model `sizes: number[]`; output `sizesChange: number[]`. A `SplitterPanel` describes the panel id and sizing constraints used by the implementation.

## 6. Recommended recipes

### A labeled async action

```html
<orc-button
  type="submit"
  variant="primary"
  [loading]="isSaving()"
  [disabled]="form.invalid"
  (click)="save()"
>
  Save changes
</orc-button>
```

Do not use a generic `<button>` plus a hand-written spinner when `orc-button` can provide loading, disabled, focus, and icon behavior.

### A validated field

```html
<orc-input
  label="Workspace name"
  [(value)]="workspaceName"
  [status]="nameError() ? 'error' : 'default'"
  [errorMessage]="nameError()"
  helperText="Use a short, recognizable name."
  required
/> 
```

Only show the error copy when the control is invalid or has been touched. The component keeps helper/error ids and `aria-describedby` consistent.

### A data-driven selection

```ts
readonly options = [
  { value: 'design', label: 'Design', description: 'Tokens and visual language' },
  { value: 'engineering', label: 'Engineering', disabled: true },
];
```

```html
<orc-combobox
  label="Team"
  [options]="options"
  [(value)]="team"
  (optionSelected)="onTeamSelected($event)"
/> 
```

### A modal with explicit semantics

```html
<orc-modal
  [(isOpen)]="isDeleteOpen"
  status="danger"
  size="sm"
  ariaLabelledBy="delete-title"
>
  <h2 modal-header id="delete-title">Delete project?</h2>
  <p modal-body>This action cannot be undone.</p>
  <div modal-footer>
    <orc-button variant="ghost" (click)="isDeleteOpen.set(false)">Cancel</orc-button>
    <orc-button variant="danger" (click)="deleteProject()">Delete</orc-button>
  </div>
</orc-modal>
```

### A composed card

```html
<orc-card>
  <orc-card-header>
    <h2>Coverage</h2>
    <orc-badge text="Stable" status="success" />
  </orc-card-header>
  <orc-card-body>
    <orc-progress-bar [value]="coverage()" label="Documented" showValue variant="success" />
  </orc-card-body>
  <orc-card-footer>
    <orc-button variant="outline" routerLink="/docs">Read documentation</orc-button>
  </orc-card-footer>
</orc-card>
```

## 7. Anti-patterns and migration guidance

| Avoid | Use instead |
| --- | --- |
| Generic button with custom loading markup | `orc-button [loading]` |
| Native text input surrounded by ad-hoc label/error CSS | `orc-input` or `orc-form-field` |
| A `<div>` that acts like a clickable card | `orc-card` plus a real `orc-button` |
| Hand-written tabs and roving tabindex | `orc-tab-group` and `orc-tab` |
| A generic red `<span>` for status | `orc-badge` or `orc-alert` with semantic status |
| A custom spinner overlay | `orc-spinner` or `orc-progress-*` |
| Stringifying generic options | Keep `T` in `orc-combobox<T>`, `orc-listbox<T>`, `orc-multi-select<T>`, or `orc-segmented-control<T>` |
| Duplicating `ModalComponent` under a new name | Use `dialog` alias or extend the canonical modal API in the library |
| Hard-coded `#1C6AED` or `16px` in app components | Use `--orc-color-azul-eletrico` and `--space-4` |
| Removing focus styles to match a screenshot | Adjust the token while preserving a visible focus indicator |

When migrating from generic controls, keep the domain state in the consuming component and replace only the view/control boundary. The library does not require a global service for basic state; Signals are local and explicit.

## 8. Source-of-truth and verification checklist

When changing a component or using an API not covered by an existing playground:

1. Confirm the export in `projects/orc-ds/public-api.ts` or the secondary entry-point `index.ts`.
2. Confirm the selector and public `input`, `model`, `output`, and directive fields in the component source.
3. Add the component to a standalone consumer's `imports` array.
4. Load `@ciag/orchestra/styles/index` before app styles.
5. Check keyboard, focus, error, disabled, loading, empty, and dark-mode states.
6. Run `npm run build:lib` and `npm run build:docs`.
7. If the change is a new public API, add a focused unit/accessibility test and update this document plus the interactive page.

The interactive catalog is the visual reference. Its stable docs route is `/docs`; the component index is `/`; individual demonstrations use `/components/<id>`. The static machine-readable files are `/llms.txt` and `/llms.md`.
