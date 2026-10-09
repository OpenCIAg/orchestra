# Orchestra (`@ciag/orchestra`)

Enterprise Angular component framework and design system: native Signals,
ARIA semantics, visible focus, keyboard navigation, and tree-shakeable
secondary entry points. Orchestra versions with the Angular major as the
semver major (`22.y.z`); breaking changes land only at Angular-major
boundaries.

## Install

```bash
npm install @ciag/orchestra @angular/cdk
```

## Styles

Orchestra ships plain CSS, no Sass required. In the app's `styles.css`:

```css
@import '@ciag/orchestra/styles.css';
/* optional global reset: */
@import '@ciag/orchestra/reset.css';
```

or in `angular.json` `"styles": ["@ciag/orchestra/styles.css", "src/styles.css"]`.
`styles.css` contains the `--orc-*` tokens, the light/dark themes and a base
scoped to component subtrees, all inside `@layer orc`. Token reference:
`styles/TOKENS.md`. `orc-icon` does not load fonts; the app loads Material
Symbols (for example with a Google Fonts `<link>` in `index.html`).

## Theming

Set `data-theme="light"` or `data-theme="dark"` on any element to scope a
theme; an explicit data attribute wins over the `theme-light`/`theme-dark`
classes and over the system preference, and nested themes resolve their own
semantic colors and shadows.

## Documentation

- Full README and guides: the
  [repository README](https://github.com/OpenCIAg/orchestra#readme)
- Documentation site: <https://orchestra.ciag.org.br>
- Changelog: [CHANGELOG.md](./CHANGELOG.md)
