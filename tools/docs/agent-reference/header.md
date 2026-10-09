# Orchestra Design System — coding-agent reference

This document is the machine-oriented companion to [`llms.txt`](./llms.txt). It describes the current workspace package `@ciag/orchestra` and is intentionally explicit: an agent should be able to choose a component, import it, compose it, and wire its state without guessing.

> Version context: Angular 22, standalone components, native Signals API, strict TypeScript, tree-shakeable secondary entry points, design tokens, and WCAG 2.1 AA as the design target. The published package version in this workspace is `{{VERSION}}`.

## 1. Operating rules for coding agents

1. Search this reference and the interactive catalog before creating a new control. If a matching `orc-*` component exists, use it.
2. Import each family from its own secondary entry point (`@ciag/orchestra/<family>`). There are no alias entry points, and the root `@ciag/orchestra` entry exports only the core surface, not the families.
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

The library expects Angular 22-compatible `@angular/common`, `@angular/core`, and `@angular/forms` peers. `rxjs` is used by some services and is a peer dependency of the workspace package.

### Load the design tokens

Load the token layer before local application styles. The token layer supplies the brand values, semantic aliases, spacing scale, radii, shadows, transitions, light/dark values, and component variables.

```scss
/* src/styles.scss */
@use '@ciag/orchestra/styles/index';

/* local overrides belong after the library layer */
```

The theme follows system preference by default. A consumer may set `data-theme="dark"` on `html` when its shell owns theme selection. The docs app also exposes a manual theme toggle.

Important tokens include:

| Group     | Tokens                                                                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand     | `--orc-color-azul-eletrico`, `--orc-color-azul-royal`, `--orc-color-laranja`, `--orc-color-ciano`, `--orc-color-roxo-lavender`, `--orc-color-azul-navy`  |
| Surfaces  | `--orc-bg`, `--orc-th`, `--orc-fill-input`, `--orc-fill-modal`, `--orc-highlight-cinza-claro`, `--orc-secondary-bg`, `--orc-border`, `--orc-opposite-bw` |
| Text      | `--orc-font-main`, `--orc-font-secondary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`                                        |
| Semantics | `--color-accent`, `--color-accent-hover`, `--color-accent-fg`, `--color-success`, `--color-error`, `--color-warning`, `--color-info`                     |
| Aliases   | `--bg-app`, `--bg-subtle`, `--bg-muted`, `--bg-inverse`, `--border-default`, `--border-strong`                                                           |
| Layout    | `--space-1` through `--space-20`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`                                            |

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
- `orc-form-field` provides a native `fieldset`/`legend` group with helper/error description. Give each projected input its own native label or accessible name; its visual `required` marker does not set native constraints.
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
