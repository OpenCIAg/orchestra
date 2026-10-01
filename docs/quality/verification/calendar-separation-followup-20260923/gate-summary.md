# Form-control separation follow-up — 2026-09-23

Calendar, native DateInput, Combobox, and Listbox now live in focused P2 implementation modules, with strict ISO date validation shared through a small utility. All four former `p2-form-components` exports remain and resolve to the exact same classes, so existing imports remain compatible. The parent-bound Calendar time synchronization and Listbox accessibility fixes are included in the focused contracts.

All gates passed:

- Calendar and DateInput focused contract: **5/5**, including parent-model time synchronization and Calendar/DateInput legacy export identity ([log](focused-tests.log)).
- Combobox focused contract: **8/8**, including the legacy export identity and CVA, keyboard, disabled, and output behavior ([log](combobox-tests.log)).
- Listbox focused contract: **6/6**, including accessible naming/filter labels, unique IDs, filtered active-descendant behavior, and legacy export identity ([log](listbox-tests.log)). Declared but unimplemented feature inputs/outputs are marked deprecated and listed in the Listbox docs.
- Full library suite: **1243/1243** under seeds `4321` and `20260923` ([seed 4321](library-seed-4321.log), [seed 20260923](library-seed-20260923.log)).
- Library package build ([log](build-library.log)) and compatibility metadata validation ([log](compatibility.log)).
- Isolated package consumer validation: **224** JavaScript entry points and consolidated aliases, public declarations without `skipLibCheck`, and **5** Sass entry points ([log](package.log)).
- Docs application tests: **75/75**, and production docs build ([tests](docs-tests.log), [build](build-docs.log)).
- SSR render and teardown: **147/147** inventoried components ([log](ssr.log)).
- Inventory: **147** components, **19** directives, **4** services, and **223** package entry points ([log](inventory.log)).
- Documentation/source integrity and `git diff --check` ([integrity log](documentation-integrity.log), [diff log](diff-check.log)).

The behavior coverage ledger still classifies 136 components as Behavior and 11 as Behavior (narrow). This extraction improves ownership and reviewability; it does not imply exhaustive input coverage or full enterprise acceptance.
