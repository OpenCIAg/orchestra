# Orchestra Design System (`@ciag/orchestra`)

Enterprise Angular Component Framework and Design System built with Angular 19+, native Signals, ARIA semantics, visible focus, keyboard navigation, and tree-shakeable secondary entry points.

Package versions follow strict semver with the Angular major as the semver major: `22.y.z`. Breaking changes land only at Angular-major boundaries (next: `23.0.0`).

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
| **Navigation**   | Breadcrumb, Stepper, Tabs, Paginator/Pagination, Dropdown/Menu                                                                          | `@ciag/orchestra/breadcrumb`, `@ciag/orchestra/stepper`, `@ciag/orchestra/tabs`, `@ciag/orchestra/paginator`, `@ciag/orchestra/pagination`, `@ciag/orchestra/dropdown`, `@ciag/orchestra/menu`                                                                                                                                                |
| **Overlays**     | Modal/Dialog, Tooltip, Drawer, Popover                                                                                                  | `@ciag/orchestra/modal`, `@ciag/orchestra/dialog`, `@ciag/orchestra/tooltip`, `@ciag/orchestra/drawer`, `@ciag/orchestra/popover`                                                                                                                                                                                                             |
| **Data Display** | Table, Card, Avatar, Badge, Accordion, List, Tree View                                                                                  | `@ciag/orchestra/table`, `@ciag/orchestra/card`, `@ciag/orchestra/avatar`, `@ciag/orchestra/badge`, `@ciag/orchestra/accordion`, `@ciag/orchestra/list`, `@ciag/orchestra/tree-view`                                                                                                                                                          |

### P0 Foundation coverage

The milestone tracker’s 28 P0 items are available. Existing APIs remain compatible while canonical aliases are also exported: `DialogComponent` maps to Modal and `PaginationComponent` maps to Paginator. `MenuComponent` has its own model/popup menu contract alongside Dropdown. New P0 primitives use semantic CSS variables and inherit `light`, `dark`, or system mode without component-specific theme configuration. The docs app exposes each P0 component on its own route, for example `/components/date-picker`, `/components/menu`, and `/components/tree-view`.

### P1 Core coverage

P1 adds the recurring composite controls from the milestone tracker: Autocomplete, Carousel, Chip, Collapsible, Color Picker, Divider, Form, Icon, Image, Number Input, Scroll Area, Timeline, Toolbar, plus canonical Text Input and Toggle entry points. Existing Progress, Rating, Stepper, Textarea, and Modal APIs remain compatible. The docs app documents each control independently, including its states and API, for example `/components/autocomplete`, `/components/carousel`, and `/components/toolbar`.

### Material Symbols

`orc-icon` renders Google Material Symbols directly from their snake_case ligature names. The component stylesheet loads the Outlined, Rounded, and Sharp variable fonts from Google Fonts automatically, so no `index.html` or global stylesheet change is required:

```html
<orc-icon name="pin" family="rounded" fill="filled" size="md" ariaLabel="Fixar" />
```

Use `weight`, `grade`, and `opticalSize` for the remaining Material Symbols axes. The full generated name/search catalog is available from `@ciag/orchestra/icons` as `ORC_MATERIAL_SYMBOLS`. Because the font is remote, production CSPs must allow `fonts.googleapis.com` and `fonts.gstatic.com`. Material Symbols are provided by Google under the [Apache License 2.0](https://developers.google.com/fonts/docs/material_symbols).

### P2 Expansion coverage

P2 adds the enterprise/data-heavy and advanced-layout components from the tracker as tree-shakeable secondary entry points: Button Group, Calendar, Code, Combobox, Dropdown, File Upload, Grid, Kbd, Link, Menubar, Splitter, Tag, Typography, Aspect Ratio, Container, Floating Action Button, Hover Card, Portal, Segmented Control, Separator, Stack, Visually Hidden, Box, Close Button, Context Menu, Data Table, Date Input, Empty State, Flex, Input Group, Listbox, Multi Select, Space, Speed Dial, Tags Input, Text, Tree Select, and Virtual Scroller. Existing OTP Input, Progress Bar/Circle, Radio, and file-uploader APIs remain compatible; the docs app exposes the new controls through `/components/p2-expansion` and individual `/components/<id>` routes.

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
