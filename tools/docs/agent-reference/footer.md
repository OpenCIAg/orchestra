## 6. Recommended recipes

### A labeled async action

```html
<orc-button type="submit" variant="primary" [loading]="isSaving()" [disabled]="form.invalid" (click)="save()"> Save changes </orc-button>
```

Do not use a generic `<button>` plus a hand-written spinner when `orc-button` can provide loading, disabled, focus, and icon behavior.

### A validated field

```html
<orc-input label="Workspace name" [(value)]="workspaceName" [status]="nameError() ? 'error' : 'default'" [errorMessage]="nameError()" helperText="Use a short, recognizable name." required />
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
<orc-combobox label="Team" [options]="options" [(value)]="team" (optionSelected)="onTeamSelected($event)" />
```

### A modal with explicit semantics

```html
<orc-modal [(isOpen)]="isDeleteOpen" status="danger" size="sm" ariaLabelledBy="delete-title">
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

| Avoid                                                  | Use instead                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Generic button with custom loading markup              | `orc-button [loading]`                                                                                |
| Native text input surrounded by ad-hoc label/error CSS | `orc-input` or `orc-form-field`                                                                       |
| A `<div>` that acts like a clickable card              | `orc-card` plus a real `orc-button`                                                                   |
| Hand-written tabs and roving tabindex                  | `orc-tab-group` and `orc-tab`                                                                         |
| A generic red `<span>` for status                      | `orc-badge` or `orc-alert` with semantic status                                                       |
| A custom spinner overlay                               | `orc-spinner` or `orc-progress-*`                                                                     |
| Stringifying generic options                           | Keep `T` in `orc-combobox<T>`, `orc-listbox<T>`, `orc-multi-select<T>`, or `orc-segmented-control<T>` |
| Duplicating `ModalComponent` under a new name          | Use `dialog` alias or extend the canonical modal API in the library                                   |
| Hard-coded `#1C6AED` or `16px` in app components       | Use `--orc-color-azul-eletrico` and `--space-4`                                                       |
| Removing focus styles to match a screenshot            | Adjust the token while preserving a visible focus indicator                                           |

When migrating from generic controls, keep the domain state in the consuming component and replace only the view/control boundary. The library does not require a global service for basic state; Signals are local and explicit.

## 8. Source-of-truth and verification checklist

When changing a component or using an API not covered by an existing playground:

1. Confirm the export in `projects/orc-ds/public-api.ts` or the secondary entry-point `index.ts`.
2. Confirm the selector and public `input`, `model`, `output`, and directive fields in the component source.
3. Add the component to a standalone consumer's `imports` array.
4. Load `@ciag/orchestra/styles/index` before app styles.
5. Check keyboard, focus, error, disabled, loading, empty, and dark-mode states.
6. Run `npm run build:lib` and `npm run build:docs`.
7. If the change is a new public API, add a focused unit/accessibility test, update the catalog usage doc, and regenerate this reference (`npm run docs:generate-agent-reference`).

The interactive catalog is the visual reference. Its stable docs route is `/docs`; the component index is `/`; individual demonstrations use `/components/<id>`. The static machine-readable files are `/llms.txt` and `/llms.md`.
