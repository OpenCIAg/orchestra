# ContextMenu and Portal target contract batch

Scope: `ContextMenuComponent` and `PortalComponent` target behavior in `projects/orc-ds/p2/p2-overlay-components.ts`.

The focused contract spec is `projects/orc-ds/overlay-target-contract.spec.ts`.

This first isolated run's statement that `p2-layout-contract.spec.ts` could not compile was incorrect and is superseded by the current combined rerun at `docs/quality/verification/overlay-target-batch/README.md`. The P2 layout spec compiles and passes alongside the overlay contract.

The earlier isolated verification used Node v24.16.0, `NG_BUILD_MAX_WORKERS=2`, Karma port 9878, ChromeHeadlessCI:

```text
NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9878 node ./node_modules/@angular/cli/bin/ng.js test orc-ds --watch=false --browsers=ChromeHeadlessCI --include=projects/orc-ds/overlay-target-contract.spec.ts --include=projects/orc-ds/runtime-diagnostics.spec.ts --exclude=projects/orc-ds/p2-layout-contract.spec.ts
```

Result at the time: **3 specs, 3 successful**. The runtime diagnostics include contributes no Jasmine specs. The exclusion was unnecessary; a later combined run verified the layout spec too.

Contract covered:

- ContextMenu resolves HTMLElement and selector targets, attaches the contextmenu listener, detaches it when the target changes, treats a valid external target as authoritative, falls back to host behavior for no/invalid targets, handles a contained target exactly once, and removes listeners on destroy.
- Portal moves projected nodes to HTMLElement and selector targets, follows target changes, observes top-level projected additions/removals without a global per-app render hook, returns content to its host, and restores/cleans up on destroy.
