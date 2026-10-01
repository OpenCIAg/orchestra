# Public bindings and PickList verification

## Focused Angular gate

Command:

```text
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9877 npm run test:lib:ci -- --include='projects/orc-ds/public-binding-behavior.spec.ts' --include='projects/orc-ds/p2-expansion.spec.ts' --include='projects/orc-ds/p2-repair.spec.ts' --include='projects/orc-ds/runtime-diagnostics.spec.ts'
```

Result: **140/140 SUCCESS**. The full output is preserved in [focused-tests.log](focused-tests.log). No package or dist build was run in this milestone.

Coverage includes typed consumer-template output counts and shared payload identity for all repaired alias branches, including Tree collapse, plus PickList default action names, source/target list semantics, roving keyboard focus, filtering/replacement recovery, disabled/no-movement guards, selected/all transfers in both directions, stable order, final aggregate selection snapshots, whole-widget disable/re-enable, pending disable/target invalidation, explicit blur/external focus preservation, detached-owned neighbor recovery, lifecycle cancellation, and focus-ring styling.
