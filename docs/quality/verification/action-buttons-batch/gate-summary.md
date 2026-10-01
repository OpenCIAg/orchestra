# Floating action and close button batch

The focused Chrome Headless suite passed **5/5 specs** with runtime diagnostics included. The build and browser run completed without console errors or warnings. Full output is retained in [focused-runtime.log](focused-runtime.log).

Command:

```sh
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9886 npm run test:lib:ci -- --include=projects/orc-ds/p2-overlay-action-buttons-contract.spec.ts --include=projects/orc-ds/runtime-diagnostics.spec.ts
```

The contracts check native `type="button"` behavior, default and custom accessible names, hidden decorative glyphs, click outputs, disabled/loading activation guards, `aria-busy`, FAB icon/label gap and minimum target size, plus CloseButton `sm`/`md`/`lg` hit-target dimensions.

API review found no declared style/styleClass inputs on either component. CloseButton’s `size` input maps to rendered CSS dimensions. FAB’s `label` is visibly rendered only with `extended=true`; it still contributes to the accessible name when supplied without `extended`. FAB otherwise uses a fixed 3rem minimum size, with extra horizontal padding in extended mode. No declared inputs were found to be wholly unused.
