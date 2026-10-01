# Inline Calendar model-sync follow-up — 2026-09-23

PASS. The focused Calendar/DateInput suite passed **4/4**. The complete library suite passed **1236/1236** under Jasmine seeds `4321` and `20260923`. The Angular library build and all-component SSR harness passed; documentation/source integrity and `git diff --check` passed.

`CalendarComponent` exposes a writable `value` model as well as the CVA interface. Before this follow-up, `writeValue()` synchronized `timeValue`, but a parent update through `[(value)]` bypassed that method. The native time editor could then display stale data, and selecting a different day could replace the parent's current time. A component effect now keeps the editor's time synchronized with valid parent-bound date-time values without feeding a second value change back to the consumer. Date-only values use midnight when time editing is enabled.

The regression binds a host signal, changes its time from `09:15` to `14:20`, verifies the rendered native time input, then selects a new day and confirms the emitted/model value remains `14:20`. The popup DatePicker remains a separate control and already has focused outside-dismissal, Escape, focus-return, and touch-layout contracts.

The regenerated inventory still contains **147 components, 19 directives, 4 services, and 223 secondary entry points**. Formatting the shared P2 source moved component declarations; the behavior-ledger anchors for Calendar, Combobox, DateInput, InputGroup, Listbox, MultiSelect, and TagsInput were updated to match the generated inventory.

| Gate                             | Result                                                                | Evidence                                                   |
| -------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Calendar/DateInput focused suite | PASS — 4/4                                                            | [focused-tests.log](focused-tests.log)                     |
| Full library, seed 4321          | PASS — 1236/1236                                                      | [library-seed-4321.log](library-seed-4321.log)             |
| Full library, seed 20260923      | PASS — 1236/1236                                                      | [library-seed-20260923.log](library-seed-20260923.log)     |
| Angular library package build    | PASS                                                                  | [build-library.log](build-library.log)                     |
| SSR harness                      | PASS — 147/147                                                        | [ssr.log](ssr.log)                                         |
| Inventory regeneration           | PASS — 147 components / 19 directives / 4 services / 223 entry points | [inventory.log](inventory.log)                             |
| Documentation/source integrity   | PASS                                                                  | [documentation-integrity.log](documentation-integrity.log) |
| `git diff --check`               | PASS                                                                  | [diff-check.log](diff-check.log)                           |
