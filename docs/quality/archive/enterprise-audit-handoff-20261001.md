# Enterprise component audit handoff — 2026-10-01

This document transfers the current state of the library-wide audit so work can continue without restarting the inventory or treating an incomplete test snapshot as sign-off. It is a contextual handoff, not a completion report. The full user objective remains: review and test every component, identify weak or redundant library surfaces, improve code quality, separation of concerns, performance, UI/UX and developer experience, and fix the inconsistencies found.

## Repository and working-state notes

- Workspace: `/Users/matheuscastro/Workspaces/orc_ds`.
- The worktree contains a large body of related, uncommitted source, test, documentation, CI, package, and Changesets edits. Preserve them. Do not use `git reset`, `git clean`, or broad reversions as a way to start fresh.
- Use Node 24.16.0 for project commands by prepending `/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin` to `PATH`.
- The date of this handoff is October 1, 2026. Several verification logs are dated September 24; their age and exact source snapshot matter when describing what is currently verified.

## Audit map and current coverage

The source-derived inventory currently records **147 components, 19 directives, 4 services, and 223 package entry points**. Every component has some direct behavior or family-test evidence, but that does not mean every public input, state combination, browser engine, or assistive-technology path has been verified. The behavior ledger classifies **136 components as Behavior and 11 as Behavior (narrow)**; the narrow label is an explicit coverage limit.

Use these as the audit's current map and source of prior decisions:

- [Enterprise audit plan and milestones](../enterprise-audit.md)
- [Component inventory](../component-inventory.md)
- [Behavior coverage ledger](../behavior-coverage-ledger.md)
- [Control audit](../audit-controls.md)
- [Expansion and P2 audit](../audit-expansion.md)
- Display/documentation audit: audit-display-docs.md (defective duplicate of audit-expansion.md, removed; surviving findings folded there)
- [Directive and service contract ledger](../directive-service-contract-ledger.md)
- [Library scope and redundancy decisions](../library-scope-decisions.md)
- [Current integrated gate summary](../verification/enterprise-component-followup-20260924/gate-summary.md)

The current gate summary still contains the earlier **1,461/1,461** and **33/33** counts. It must not be represented as the latest verified result; reconcile it only after rerunning the affected checks against the current source.

## Work completed in the latest audit wave

The broader audit already repaired and covered many reported regressions, including DateTime outside dismissal, modal focus/lifecycle behavior, button icon spacing, shared form-control spacing, component extraction with compatibility imports, and extensive input, state, accessibility, and documentation contracts. Their evidence is distributed through the dated verification folders under `docs/quality/verification/`.

The most recent component-level work includes:

- **Galleria:** fullscreen mode now exposes dialog semantics, focuses its close control on entry, contains Tab navigation, closes on Escape, and restores focus. A WebKit-specific stale-`activeElement` issue was addressed by capturing the external pointer opener and cleaning up the document listener/timer. The focused Galleria contract passed **20/20** after that change.
- **DataTable:** pointer-activatable rows now support Enter and Space, ignore bubbled keyboard events from nested controls, show a focus outline, and use a pointer cursor. Its focused suite passed **19/19**.
- **EmptyState:** visible title and description are trimmed, blank text is omitted, and a whitespace-only icon falls back to `∅`. Its contract was included in a **43/43** combined run with Galleria and DataTable before the final Galleria pointer-opener change. The public API guide was corrected to match the implementation's optional title/description defaults and accessible-name inputs.
- **Galleria browser coverage:** the targeted focus test passed Chromium, Firefox, and WebKit (**3/3**). The complete interaction matrix then passed **36/36** across those engines.
- Changesets exist for the latest Galleria and DataTable changes: `.changeset/galleria-contract.md` and `.changeset/data-table-public-contracts.md`.

## Verification snapshot and the known failure

Treat each result according to the source revision it actually tested:

| Check                                          | Last observed result                                                                                       | Source-snapshot caveat                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production library, docs, and template build   | Pass                                                                                                       | Rebuilt after the Galleria pointer-opener change. Log: build-all.log: verification/enterprise-component-followup-20260924/build-all.log (archived, see release CI artifacts).                                                                                                                                                                                                                                                           |
| Full Playwright interaction matrix             | **36/36 pass**                                                                                             | Run after the Galleria fix. Log: browser-interactions.log: verification/enterprise-component-followup-20260924/browser-interactions.log (archived, see release CI artifacts).                                                                                                                                                                                                                                                           |
| Full library, seed `20260923`                  | **1,464/1,464 pass**                                                                                       | This run predates the final Galleria pointer-opener edit; rerun on current source. Log: library-seed-20260923.log: verification/enterprise-component-followup-20260924/library-seed-20260923.log (archived, see release CI artifacts).                                                                                                                                                                                                  |
| Full library, seed `4321`                      | **1,463/1,464 pass; one failure**                                                                          | This is the latest full-library run after the Galleria edit. ScrollArea failed as described below. Log: library-seed-4321.log: verification/enterprise-component-followup-20260924/library-seed-4321.log (archived, see release CI artifacts); preserved diagnostic copy: library-seed-4321-scroll-area-observed-failure.log: verification/enterprise-component-followup-20260924/library-seed-4321-scroll-area-observed-failure.log (archived, see release CI artifacts). |
| Package consumers, current and minimum Angular | Pass                                                                                                       | Each validated 224 JavaScript entries, public declarations without `skipLibCheck`, and 5 Sass entries. Logs: current: verification/enterprise-component-followup-20260924/package-current.log (archived, see release CI artifacts), minimum: verification/enterprise-component-followup-20260924/package-minimum.log (archived, see release CI artifacts).                                                                                                                 |
| Compatibility metadata                         | Pass                                                                                                       | compatibility.log: verification/enterprise-component-followup-20260924/compatibility.log (archived, see release CI artifacts).                                                                                                                                                                                                                                                                                                          |
| SSR                                            | **147/147 pass**                                                                                           | Covers default component rendering and teardown, not interactive/open-state SSR or hydration. ssr.log: verification/enterprise-component-followup-20260924/ssr.log (archived, see release CI artifacts).                                                                                                                                                                                                                                |
| Light/dark theme contracts                     | **6/6 each**                                                                                               | themes.log: verification/enterprise-component-followup-20260924/themes.log (archived, see release CI artifacts).                                                                                                                                                                                                                                                                                                                        |
| Docs tests and docs integrity                  | Earlier pass: **82/82** docs tests; inventory/docs integrity passed before the latest audit-document edits | Refresh both after current source and docs changes.                                                                                                                                                                                                                                                                                                                                                  |

The concrete current failure is in `projects/orc-ds/scroll-area/scroll-area.component.spec.ts:291`: “ScrollAreaComponent behavior pages both axes in the rendered viewport and remeasures after its bounds shrink” expected a viewport size of `100`, but observed `89`. A preceding full-suite run had passed, so this may involve asynchronous layout/measurement ordering, but the cause is not established. The ScrollArea `.ts`, `.html`, and `.scss` files are already modified in this worktree, and the current ScrollArea spec is untracked. Inspect those edits and reproduce the failure before changing anything. Do not weaken the assertion unless evidence proves that its expected behavior is wrong.

`npm run verify:docs` passed before the most recent audit-ledger edits. `npm run format:check` initially flagged the EmptyState spec, which was formatted. A subsequent `git diff --check` produced no errors, but rerun final documentation, format, and whitespace checks after all edits.

## Library-footprint findings

The evidence does **not** justify deleting a whole component or public entry point without downstream-consumer information. These are candidates for compatibility-window or major-release review, not immediate removals:

- `TooltipComponent` is explicitly internal/deprecated, has no public Angular inputs, and is instantiated by `TooltipDirective`. Consider removing its barrel export only after downstream imports have been reviewed.
- `TextInputComponent` and `ToggleComponent` are identity aliases for the canonical Input and Switch implementations; they add no unique runtime behavior.
- There are 69 alias-only secondary `index.ts` entry points. Removing them would risk breaking package imports and would not materially reduce runtime bundles. The reviewed paths are cataloged in [audit-expansion.md](../audit-expansion.md).
- `OverlayComponent` has inert/deprecated positioning options and no docs route, but it still has live visibility, projected content, show/hide/toggle, output, style, and Escape behavior. It is a low-value compatibility wrapper, not a useless component.
- Small primitives such as InputGroupAddon, IftaLabel, Box, Grid, Flex, Stack, Space, AspectRatio, Separator, VisuallyHidden, Text, Typography, ButtonGroup, Dock, and ScrollPanel have modest implementations but supply shared semantics or styling; short source alone is not evidence for removal.

See [library-scope-decisions.md](../library-scope-decisions.md) for canonical ownership, alias, and deprecation rationale. Local repository search cannot establish public usage outside this checkout.

## Recommended continuation sequence

1. Inspect the current ScrollArea source/spec edits and reproduce the `100` versus `89` failure with focused, repeated runs. Fix the implementation or test synchronization according to the evidence, preserving the intended observable behavior.
2. Rebuild after any source changes. Rerun the focused ScrollArea contract and the full library suite under both seeds (`4321` and `20260923`) against the same current source. The current expected suite size is 1,464 unless the verified fix adds coverage.
3. Preserve focused contracts for Galleria, DataTable, and EmptyState, then rerun the full browser matrix after rebuild. The latest matrix already passes 36/36, but any source change affecting these flows requires a fresh replay.
4. Refresh docs tests, `node tools/quality/inventory.mjs`, `npm run verify:docs`, `npm run format:check`, and `git diff --check`. Rerun package, SSR, theme, compatibility, and production build gates when relevant source or packaging changes invalidate their current evidence.
5. Update the latest gate summary and ledgers with only current passing results. Keep the earlier failed ScrollArea run as diagnostic evidence; do not let stale **1,461/33** claims remain once the current gate is sealed.
6. Continue the full objective using the inventory and remaining audit notes: close high-impact input/keyboard/focus gaps, cover directive/service behavior, and record the remaining cross-browser, narrow/mobile, RTL, reduced-motion, projected-content, assistive-technology, hydration, and external-consumer gaps. Do not treat default mounting or one broad green suite as complete enterprise validation.

The audit is still in progress. A truthful completion claim requires requirement-by-requirement evidence across the original scope, plus an explicit list of unresolved environmental and consumer-usage limits.
