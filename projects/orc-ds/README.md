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
/* orc-icon font (bundled Material Symbols Rounded, no Google request): */
@import '@ciag/orchestra/icons.css';
/* optional global reset: */
@import '@ciag/orchestra/reset.css';
```

or in `angular.json` `"styles": ["@ciag/orchestra/styles.css", "src/styles.css"]`.
`styles.css` contains the `--orc-*` tokens, the light/dark themes and a base
scoped to component subtrees, all inside `@layer orc`. Token reference:
`styles/TOKENS.md`. `icons.css` self-hosts the Material Symbols Rounded font
used by `orc-icon` (weight 400 with the fill axis, ~540 KB); apps that need
other families or weights skip it and load the font from Google Fonts.

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
