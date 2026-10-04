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

Include the design tokens, CSS layers, and themes in your application's
`styles.scss`:

```scss
@use '@ciag/orchestra/styles/index';
```

Applications that own their CSS reset can load the tokens and themes without
Orchestra's global reset:

```scss
@use '@ciag/orchestra/styles/core';
```

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
