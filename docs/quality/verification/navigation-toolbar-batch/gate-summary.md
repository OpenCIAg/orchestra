# Navigation and display behavior batch

Date: 2026-09-22

The focused ChromeHeadless run passed **24/24**. It included nine behavior tests for NavigationShell, NavigationItem, Toolbar, Timeline, and LoadingSpinner; the existing 15-test public-binding suite; and `runtime-diagnostics.spec.ts`. The Toolbar additions cover projected disabled initial state, QueryList insertion/removal, and RTL keyboard direction. A root follow-up added an accessible mobile backdrop and controlled Escape/backdrop dismissal output to NavigationShell; the same 24-test gate was rerun after those changes and passed.

Command:

```sh
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH \
NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9886 \
npm run test:lib:ci -- \
  --include='projects/orc-ds/navigation-toolbar-contract.spec.ts' \
  --include='projects/orc-ds/public-binding-behavior.spec.ts' \
  --include='projects/orc-ds/runtime-diagnostics.spec.ts'
```

The gate exposed and verifies these repairs:

- Navigation entries without a destination are native buttons; disabled destination entries are native disabled buttons; enabled destinations remain links. The shell labels its navigation landmark and visually hides a closed mobile drawer from keyboard and assistive-technology navigation. Its drawer offset follows RTL direction.
- Toolbar items now start with a usable tab stop. Disabled state updates native controls, removes the item from roving navigation, blocks activation, and restores a tab stop among the remaining items. Query-list and per-item subscriptions are released when the toolbar is destroyed. Arrow navigation handles horizontal LTR/RTL, vertical orientation, Home, End, and looping.
- Timeline entries are native buttons inside an ordered list, so keyboard activation is native and list semantics remain intact. The `value` fallback, `layout` fallback, `style`, `styleClass`, and `align` inputs now affect output; selected/current events retain their alias identity. Alignment supports `left`, `alternate`, and `right` in vertical layouts.
- Spinner `animation="none"` now stops ring, star, and dot motion; system reduced-motion preferences also disable those animations. The live status gets a useful accessible name from `ariaLabel`, visible `text`, or the “Loading” fallback. The white variant now styles its adjacent text correctly.

The full runner output is in [focused-runtime-toolbar-update.log](focused-runtime-toolbar-update.log).

Residual review: this browser run covered DOM contracts in headless Chrome, not screenshot-based responsive visual review, real reduced-motion preference emulation, or a multi-browser matrix. The mobile navigation shell emits a close request for backdrop/Escape interactions but stays controlled by its owner; that owner must update `open` and restore focus to the trigger. Its default labels are English and should be overridden for localized applications. Timeline’s legacy inputs (`value`, `layout`, `align`, `style`, and `styleClass`) are now included in the public catalog.
