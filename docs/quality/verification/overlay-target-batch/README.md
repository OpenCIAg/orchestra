# ContextMenu, Portal, and P2 layout contract batch

The batch covers `ContextMenuComponent` target listener binding and cleanup, `PortalComponent` projected-node movement and restoration, and the P2 `KbdComponent`/`LinkComponent` behavior fixes.

Verification ran with Node v24.16.0, `NG_BUILD_MAX_WORKERS=2`, Karma port 9878, and ChromeHeadlessCI:

```sh
NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9878 /Users/matheuscastro/.nvm/versions/node/v24.16.0/bin/node ./node_modules/@angular/cli/bin/ng.js test orc-ds --watch=false --browsers=ChromeHeadlessCI --include=projects/orc-ds/overlay-target-contract.spec.ts --include=projects/orc-ds/p2-layout-contract.spec.ts --include=projects/orc-ds/runtime-diagnostics.spec.ts
```

Result: **8/8 browser specs passed**. The runtime-diagnostics harness was included and reported no browser console errors or warnings. The output is retained in `focused-runtime.log`.

Coverage includes selector and direct element targets, same-origin iframe elements, target rebinding, invalid-target host fallback, nested target exact-once behavior, projected-node moves and top-level add/remove reconciliation, destroy restoration, Kbd chord splitting, and enabled/disabled Link interaction semantics.
