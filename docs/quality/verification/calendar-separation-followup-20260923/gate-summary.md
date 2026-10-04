# Form-control separation follow-up — 2026-09-23

Calendar, native DateInput, Combobox, and Listbox now live in focused P2 implementation modules, with strict ISO date validation shared through a small utility. All four former `p2-form-components` exports remain and resolve to the exact same classes, so existing imports remain compatible. The parent-bound Calendar time synchronization and Listbox accessibility fixes are included in the focused contracts.

All gates passed:

- Calendar and DateInput focused contract: **5/5**, including parent-model time synchronization and Calendar/DateInput legacy export identity (log: verification/calendar-separation-followup-20260923/focused-tests.log (archived, see release CI artifacts)).
- Combobox focused contract: **8/8**, including the legacy export identity and CVA, keyboard, disabled, and output behavior (log: verification/calendar-separation-followup-20260923/combobox-tests.log (archived, see release CI artifacts)).
- Listbox focused contract: **6/6**, including accessible naming/filter labels, unique IDs, filtered active-descendant behavior, and legacy export identity (log: verification/calendar-separation-followup-20260923/listbox-tests.log (archived, see release CI artifacts)). Declared but unimplemented feature inputs/outputs are marked deprecated and listed in the Listbox docs.
- Full library suite: **1243/1243** under seeds `4321` and `20260923` (seed 4321: verification/calendar-separation-followup-20260923/library-seed-4321.log (archived, see release CI artifacts), seed 20260923: verification/calendar-separation-followup-20260923/library-seed-20260923.log (archived, see release CI artifacts)).
- Library package build (log: verification/calendar-separation-followup-20260923/build-library.log (archived, see release CI artifacts)) and compatibility metadata validation (log: verification/calendar-separation-followup-20260923/compatibility.log (archived, see release CI artifacts)).
- Isolated package consumer validation: **224** JavaScript entry points and consolidated aliases, public declarations without `skipLibCheck`, and **5** Sass entry points (log: verification/calendar-separation-followup-20260923/package.log (archived, see release CI artifacts)).
- Docs application tests: **75/75**, and production docs build (tests: verification/calendar-separation-followup-20260923/docs-tests.log (archived, see release CI artifacts), build: verification/calendar-separation-followup-20260923/build-docs.log (archived, see release CI artifacts)).
- SSR render and teardown: **147/147** inventoried components (log: verification/calendar-separation-followup-20260923/ssr.log (archived, see release CI artifacts)).
- Inventory: **147** components, **19** directives, **4** services, and **223** package entry points (log: verification/calendar-separation-followup-20260923/inventory.log (archived, see release CI artifacts)).
- Documentation/source integrity and `git diff --check` (integrity log: verification/calendar-separation-followup-20260923/documentation-integrity.log (archived, see release CI artifacts), diff log: verification/calendar-separation-followup-20260923/diff-check.log (archived, see release CI artifacts)).

The behavior coverage ledger still classifies 136 components as Behavior and 11 as Behavior (narrow). This extraction improves ownership and reviewability; it does not imply exhaustive input coverage or full enterprise acceptance.
