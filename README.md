# Orchestra Design System (`@ciag/orchestra`)

Enterprise Angular Component Framework and Design System built with Angular 19+, native Signals, strict accessibility (WCAG 2.1 AA), and tree-shakeable secondary entry points.

Package versions follow `Angular major.Orchestra major.Orchestra minor`. For example, `19.1.0` is Orchestra 1.0 for Angular 19.

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

Or add the prebuilt CSS to `angular.json`:

```json
"styles": [
  "node_modules/@ciag/orchestra/styles/index.css",
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

| Category | Components & Directives | Secondary Entry Point |
| :--- | :--- | :--- |
| **General** | Button, Icon Button | `@ciag/orchestra/button` |
| **Data Entry** | Input, Textarea, Select, Option, Checkbox, Radio, Switch, Slider, Rating, OTP Input, Chip Input, File Uploader, Date Picker, Form Field | `@ciag/orchestra/input`, `@ciag/orchestra/select`, `@ciag/orchestra/checkbox`, `@ciag/orchestra/radio`, `@ciag/orchestra/switch`, `@ciag/orchestra/slider`, `@ciag/orchestra/rating`, `@ciag/orchestra/otp-input`, `@ciag/orchestra/chip-input`, `@ciag/orchestra/file-uploader`, `@ciag/orchestra/date-picker`, `@ciag/orchestra/form-field` |
| **Feedback** | Alert, Toast, Spinner, Skeleton, Progress (Bar/Circle) | `@ciag/orchestra/alert`, `@ciag/orchestra/toast`, `@ciag/orchestra/spinner`, `@ciag/orchestra/skeleton`, `@ciag/orchestra/progress` |
| **Navigation** | Breadcrumb, Stepper, Tabs, Paginator/Pagination, Dropdown/Menu | `@ciag/orchestra/breadcrumb`, `@ciag/orchestra/stepper`, `@ciag/orchestra/tabs`, `@ciag/orchestra/paginator`, `@ciag/orchestra/pagination`, `@ciag/orchestra/dropdown`, `@ciag/orchestra/menu` |
| **Overlays** | Modal/Dialog, Tooltip, Drawer, Popover | `@ciag/orchestra/modal`, `@ciag/orchestra/dialog`, `@ciag/orchestra/tooltip`, `@ciag/orchestra/drawer`, `@ciag/orchestra/popover` |
| **Data Display** | Table, Card, Avatar, Badge, Accordion, List, Tree View | `@ciag/orchestra/table`, `@ciag/orchestra/card`, `@ciag/orchestra/avatar`, `@ciag/orchestra/badge`, `@ciag/orchestra/accordion`, `@ciag/orchestra/list`, `@ciag/orchestra/tree-view` |

### P0 Foundation coverage

The milestone tracker’s 28 P0 items are available. Existing APIs remain compatible while canonical aliases are also exported: `DialogComponent` maps to Modal, `PaginationComponent` maps to Paginator, and `MenuComponent` maps to Dropdown. New P0 primitives use semantic CSS variables and inherit `light`, `dark`, or system mode without component-specific theme configuration. The docs app exposes each P0 component on its own route, for example `/components/date-picker`, `/components/menu`, and `/components/tree-view`.

### P1 Core coverage

P1 adds the recurring composite controls from the milestone tracker: Autocomplete, Carousel, Chip, Collapsible, Color Picker, Divider, Form, Icon, Image, Number Input, Scroll Area, Timeline, Toolbar, plus canonical Text Input and Toggle entry points. Existing Progress, Rating, Stepper, Textarea, and Modal APIs remain compatible. The docs app documents each control independently, including its states and API, for example `/components/autocomplete`, `/components/carousel`, and `/components/toolbar`.

### P2 Expansion coverage

P2 adds the enterprise/data-heavy and advanced-layout components from the tracker as tree-shakeable secondary entry points: Button Group, Calendar, Code, Combobox, Dropdown, File Upload, Grid, Kbd, Link, Menubar, Splitter, Tag, Typography, Aspect Ratio, Container, Floating Action Button, Hover Card, Portal, Segmented Control, Separator, Stack, Visually Hidden, Box, Close Button, Context Menu, Data Table, Date Input, Empty State, Flex, Input Group, Listbox, Multi Select, Space, Speed Dial, Tags Input, Text, Tree Select, and Virtual Scroller. Existing OTP Input, Progress Bar/Circle, Radio, and file-uploader APIs remain compatible; the docs app exposes the new controls through `/components/p2-expansion` and individual `/components/<id>` routes.

---

## Workspace Development Commands

```bash
# Run documentation / showcase app
npm start

# Build library package
npm run build:lib

# Build documentation app
npm run build:docs

# Build entire workspace (library + docs)
npm run build

# Run unit and accessibility tests
npm run test:lib

# Create a changeset for release
npx changeset

# Pack tarball for local inspection
npm run pack:lib
```

---

## License

MIT © CIAG
