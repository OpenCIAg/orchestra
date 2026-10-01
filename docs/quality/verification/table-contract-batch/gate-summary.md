# Table contract batch

Date: 2026-09-23

The bounded Table repair batch ran with Node 24.16.0 and `NG_BUILD_MAX_WORKERS=2`.

- Focused browser contract: **35/35 passed** with `ChromeHeadlessCI`; full output is in [focused-tests.log](focused-tests.log).
- The shared worktree had an unrelated in-flight P2 barrel extraction that prevents the default all-spec TypeScript graph from compiling, so this focused run used a temporary single-spec tsconfig that was removed after the run.
- Library build: `npm run build:lib` passed; output is in [build-lib.log](build-lib.log).
- The repaired contract is `showInitialSortBadge`: false suppresses the neutral sort badge while active ascending/descending indicators remain visible.
- `TableComponent` declares 103 inputs/models. The audit classifies 49 as directly exercised by the focused suite, 27 as wired but lacking a direct assertion, and 27 as confirmed compatibility no-ops marked `@deprecated` in source. The full lists and limitations are in the [Table input audit](../../audit-expansion.md#tablecomponent-public-input-audit).
- All 26 declared outputs are classified in the [Table output audit](../../audit-expansion.md#tablecomponent-public-input-audit): all 17 live outputs are directly asserted and nine deprecated no-op outputs have no emission path. The 10 supported model-backed change outputs also have direct transition assertions; `contextMenuSelectionChange` is a deprecated no-op model output.

This batch does not claim complete Table parity. Frozen panes, row/cell editing, grouping, context-menu integration, column resize/reorder, virtual scrolling, state persistence, multiple-sort gestures, the 27 wired-but-unasserted inputs, and their associated unsupported outputs remain open or unverified.
