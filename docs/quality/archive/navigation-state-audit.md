# Tabs and Stepper state audit

Revalidated 2026-09-13 against the current Tabs and Stepper source and browser specs. The focused gate is recorded in `docs/quality/verification/navigation-state-batch/`.

## Repairs

- TabGroup now treats `selectedIndex` and `value` as controlled aliases. A single alias update becomes the selection intent; when both change in one update, `value` wins deterministically. Internal activation updates both models without emitting `tabChange`/`onChange` for external writes.
- TabGroup keyboard navigation skips disabled tabs, and `selectOnFocus` relies on the native focus path so one navigation produces one selection event. The tablist is no longer an extra tab stop.
- Closable tabs use a sibling native button rather than a focusable control nested inside a tab button. Closing a tab removes it from the cached set, preserves the active tab identity where possible, chooses an enabled neighbor when the active tab closes, and restores focus only when focus was inside the widget. Deferred recovery is invalidated by a later close, external focus movement, or teardown. `controlClose` remains consumer-controlled.
- Initial visible content is recorded in `loadedTabs`; dynamic closed tabs are pruned. Tab and panel IDs remain paired, and the existing projection/lazy model is preserved.
- Stepper synchronizes `currentStep` and `activeIndex` by detecting which controlled alias changed. Explicit `active` status cannot create additional active tab stops or `aria-current` markers. The navigation has a default accessible name, native buttons remain `type="button"`, and keyboard movement only targets reachable steps.

## Evidence and limits

`tabs/tab-group.component.spec.ts` covers external and two-way alias writes, deterministic precedence, disabled navigation, one-time focus selection, native close-button independence, lazy cache initialization, active identity after closing around a disabled neighbor, deferred-focus cancellation, dynamic item observer release, full-width sizing, and real LTR/RTL overflow movement. `stepper/stepper.component.spec.ts` covers alias synchronization and simultaneous writes, default naming, single active semantics, disabled keyboard skipping and recovery, select-on-focus output, style binding, RTL movement, empty-data and readonly recovery, and all-disabled/form-safe controls. The focused 26-test and relevant 153-test P1/P2/runtime suites pass in Chrome Headless; exact command/output is in the navigation-state batch logs.

The implementation does not add tab panels to Stepper, invent RTL configuration absent from its public API, or claim complete lazy creation for caller-projected content. Remaining coverage includes broader dynamic child replacement beyond the tested projected removal path, navigator visibility combinations beyond the focused custom-label path, and Stepper visual/responsive combinations. These are coverage limits rather than source-proven defects.
