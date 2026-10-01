# P2 Menu and Menubar batch

## Result

SOURCE READY for the bounded Menu/Menubar repair.

Menu now honors the public `items` alias through the same rendering and
selection path as `model`, indexes visible/enabled nested entries for roving
keyboard state, and keeps a clicked nested item active. Menubar now indexes
only visible/enabled top-level entries, exposes a real roving button tab stop,
focuses the active button after horizontal navigation, preserves nested
submenu activation, emits focus on descendant focus, and emits blur only when
focus leaves the composite.

## Evidence

- `focused-tests.log`: **5 SUCCESS** from
  `p2-menu-contract.spec.ts` plus `runtime-diagnostics.spec.ts`.
- The earlier combined probe also ran `p2-expansion.spec.ts`; it reached
  `118 SUCCESS / 2 FAILED`. The two failures are the pre-existing Splitter
  gutter expectations at `p2-expansion.spec.ts:1306-1308`; no Menu or Menubar
  failure remained.

Focused command:

```text
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9879 npm run test:lib:ci -- --include='projects/orc-ds/p2-menu-contract.spec.ts' --include='projects/orc-ds/runtime-diagnostics.spec.ts'
```

The following compatibility inputs remain declared but have no behavior in
`MenuComponent`: `appendTo`, `showTransitionOptions`, and
`hideTransitionOptions`. They remain intact for public compatibility. The
Menubar inputs in scope are consumed by the current template or keyboard
contract.
