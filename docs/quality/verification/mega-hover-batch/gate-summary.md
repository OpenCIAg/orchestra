# MegaMenu and HoverCard behavior batch

The focused browser contract suite passed **7/7 specs** with the runtime-diagnostics harness included. The build completed successfully and the diagnostics run reported no browser console errors or warnings. Full output is retained in [focused-runtime.log](focused-runtime.log).

Command:

```sh
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9886 npm run test:lib:ci -- --include=projects/orc-ds/mega-hover-contract.spec.ts --include=projects/orc-ds/runtime-diagnostics.spec.ts
```

The tests cover MegaMenu orientation styling and ARIA orientation, group/item visibility and disabled state, roving focus and orientation-specific arrow navigation, focus/blur boundaries, enabled item selection, URL/target rendering and safe `_blank` relation values. HoverCard coverage verifies keyboard focus moving into its content, trigger/panel ARIA association, Escape dismissal with focus return, outside-focus dismissal, and pointer-leave behavior.

Remaining limits: MegaMenu renders one group level (`group.items`) and does not render recursive child items inside those entries; RTL arrow navigation and cross-browser visual review remain unverified. HoverCard uses a caller-provided `id` for `aria-controls`; without one the trigger still exposes `aria-haspopup`/`aria-expanded`, while viewport collision placement and touch-specific visual behavior remain outside this focused browser contract.
