# Orchestra Design System (`@ciag/orchestra`)

Enterprise Angular Component Framework and Design System built with Angular 19+, native Signals, ARIA semantics, visible focus, keyboard navigation, and tree-shakeable secondary entry points.

Package versions use the Angular major as the semver major: `22.y.z`. `22.4.0-rc.0` is a breaking release candidate of the Angular 22 line: it removes the compatibility surface (alias entry points, the `p2` tier and the removed families listed in [`docs/overhaul/DECISOES.md`](docs/overhaul/DECISOES.md)).

The canonical documentation home is <https://orchestra.ciag.org.br> (component catalog, design guide, and the machine-readable [`llms.txt`](https://orchestra.ciag.org.br/llms.txt) / [`llms.md`](https://orchestra.ciag.org.br/llms.md) agent reference). The GitHub Pages deployment mirrors the same artifact.

---

## Installation

Install `@ciag/orchestra` and its peer dependencies via npm:

```bash
npm install @ciag/orchestra @angular/cdk
```

---

## Styling & Design Tokens

Include Orchestra's multi-tier design tokens, CSS layers, and themes in your application's `styles.scss`:

```scss
@use '@ciag/orchestra/styles/index';
```

`styles/index` preserves Orchestra's legacy global reset for existing applications. New applications that own their CSS reset can load the tokens, themes, layers, and mixins without that global reset:

```scss
@use '@ciag/orchestra/styles/core';
```

Both style entries apply border-box sizing within component-owned `.orc-*` subtrees. The core entry leaves unrelated application boxes, typography, margins and padding alone. Theme boundaries can use `data-theme="light"`, `data-theme="dark"`, `.theme-light` or `.theme-dark`; an explicit data attribute takes precedence over a conflicting class, and explicit themes override the system preference. Nested themes resolve their own semantic colors and shadows.

`npm run test:themes:ci` checks the compiled core styles in separate browser runs with light and dark preferences, including nested themes, status text contrast and component sizing without the global reset.

Or add the shipped Sass entry directly to `angular.json`:

```json
"styles": [
  "node_modules/@ciag/orchestra/styles/index.scss",
  "src/styles.scss"
]
```

### Theme Switching

Orchestra supports automatic system preference as well as manual theme toggling via `data-theme` attribute or theme CSS classes:

```html
<html data-theme="dark">
  <!-- Content -->
</html>
```

---

## Component Usage

### Hybrid Imports

Import directly from secondary entry points for maximum tree-shaking granularity, or from the root package:

```typescript
import { Component } from '@angular/core';
import { ButtonComponent } from '@ciag/orchestra/button';
import { InputComponent } from '@ciag/orchestra/input';
import { ModalComponent } from '@ciag/orchestra/modal';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ButtonComponent, InputComponent, ModalComponent],
  template: `
    <orc-input label="Nome" placeholder="Digite seu nome" />
    <orc-button variant="primary" (click)="openModal()">Abrir Modal</orc-button>
    <orc-modal [(isOpen)]="isOpen">
      <div modal-header>Título do Modal</div>
      <p modal-body>Conteúdo do modal</p>
    </orc-modal>
  `,
})
export class ExampleComponent {
  isOpen = false;

  openModal() {
    this.isOpen = true;
  }
}
```

---

## Component Catalog

| Category         | Components & Directives                                                                                                                 | Secondary Entry Point                                                                                                                                                                                                                                                                                                                         |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **General**      | Button, Icon Button                                                                                                                     | `@ciag/orchestra/button`                                                                                                                                                                                                                                                                                                                      |
| **Data Entry**   | Input, Textarea, Select, Option, Checkbox, Radio, Switch, Slider, Rating, OTP Input, Chip Input, File Uploader, Date Picker, Form Field | `@ciag/orchestra/input`, `@ciag/orchestra/select`, `@ciag/orchestra/checkbox`, `@ciag/orchestra/radio`, `@ciag/orchestra/switch`, `@ciag/orchestra/slider`, `@ciag/orchestra/rating`, `@ciag/orchestra/otp-input`, `@ciag/orchestra/chip-input`, `@ciag/orchestra/file-uploader`, `@ciag/orchestra/date-picker`, `@ciag/orchestra/form-field` |
| **Feedback**     | Alert, Toast, Spinner, Skeleton, Progress (Bar/Circle)                                                                                  | `@ciag/orchestra/alert`, `@ciag/orchestra/toast`, `@ciag/orchestra/spinner`, `@ciag/orchestra/skeleton`, `@ciag/orchestra/progress`                                                                                                                                                                                                           |
| **Navigation**   | Breadcrumb, Stepper, Tabs, Paginator, Dropdown/Menu                                                                                     | `@ciag/orchestra/breadcrumb`, `@ciag/orchestra/stepper`, `@ciag/orchestra/tabs`, `@ciag/orchestra/paginator`, `@ciag/orchestra/dropdown`, `@ciag/orchestra/menu`                                                                                                                                                                              |
| **Overlays**     | Modal, Tooltip, Drawer, Popover                                                                                                         | `@ciag/orchestra/modal`, `@ciag/orchestra/tooltip`, `@ciag/orchestra/drawer`, `@ciag/orchestra/popover`                                                                                                                                                                                                                                       |
| **Data Display** | Table, Card, Avatar, Badge, Accordion, List, Tree View                                                                                  | `@ciag/orchestra/table`, `@ciag/orchestra/card`, `@ciag/orchestra/avatar`, `@ciag/orchestra/badge`, `@ciag/orchestra/accordion`, `@ciag/orchestra/list`, `@ciag/orchestra/tree-view`                                                                                                                                                          |

### Entry points

Every family is imported from its own secondary entry point (`@ciag/orchestra/<family>`). There are no alias entry points, and the root `@ciag/orchestra` entry exports only the core surface (`@ciag/orchestra/core`).

### Material Symbols

`orc-icon` renders Google Material Symbols directly from their snake_case ligature names. The component stylesheet loads the Outlined, Rounded, and Sharp variable fonts from Google Fonts automatically, so no `index.html` or global stylesheet change is required:

```html
<orc-icon name="pin" family="rounded" fill="filled" size="md" ariaLabel="Fixar" />
```

Use `weight`, `grade`, and `opticalSize` for the remaining Material Symbols axes. Because the font is remote, production CSPs must allow `fonts.googleapis.com` and `fonts.gstatic.com`. Material Symbols are provided by Google under the [Apache License 2.0](https://developers.google.com/fonts/docs/material_symbols).

---

## Workspace Development Commands

The docs and application template consume the built library in `dist/orc-ds`.
After `npm ci`, run `npm run build:lib` before starting either app. For ongoing
library edits, start `npm run watch:lib` first and wait for its initial build,
then start the app in another terminal. Both development servers exclude the
local library from dependency prebundling so rebuilt components are not served
from a stale dependency cache.

```bash
# Run documentation / showcase app
npm start

# Build library package
npm run build:lib

# Build documentation app
npm run build:docs

# Build entire workspace (library + docs + application template)
npm run build

# Run unit and accessibility tests
npm run test:lib

# Create a changeset for release
npm run changeset

# Pack tarball for local inspection
npm run pack:lib

# Verify imports and declarations in isolated consumers at current and minimum Angular versions
npm run verify:package
npm run verify:package:minimum
```

---

## Versioning & Releases

Versions are `22.y.z`: the Angular major is the semver major, and `npm install @ciag/orchestra@^22.3.0` receives every backward-compatible release of the Angular 22 line. Breaking changes land only at Angular-major boundaries — the next one is `23.0.0`. This is the one-time **generation collapse**: the retired `Angular major.Orchestra major.Orchestra minor` scheme carried breaking Orchestra generations in the semver minor slot (so `^22.1.0` consumers received breaking `22.2.0` automatically); since `22.3.0` a minor bump is backward-compatible by contract.

Releases run through changesets:

1. Every consumer- or contributor-visible change lands a changeset file (`.changeset/*.md`, via `npm run changeset`) committed with its work.
2. CI maintains a **Version PR** (`.github/workflows/version-pr.yml`) that consumes the pending changesets into the version bump and the generated changelog section.
3. Merging the Version PR produces the governed release commit; the guarded release workflow (`.github/workflows/release.yml`) verifies the package distribution and publishes it to npm under the `latest` dist-tag.
4. Old release lines (`v19`–`v22`) are Angular-locked backport streams: their releases are patch tags (`vNN.x.y`), published under the matching `angularNN` dist-tag.

---

## License

MIT © CIAG
