# Component input follow-up — forms, overlays, and public inputs — 2026-09-23

This follow-up improves CVA timing, ARIA semantics, filtering, selection limits, tooltip sizing, disabled-state handling, and component module ownership. TagsInput moved into a focused implementation module while legacy imports retain class identity. Follow-on audits classify every Table, Select, TreeSelect, DataTable, TreeTable, Modal, and NumberInput public input; they also fix Modal accessible-name precedence, NumberInput layout/precision, and TreeTable multi-selection semantics.

All integration gates passed:

- MultiSelect focused contract: **6/6**, including combobox semantics, `in` and numeric filter modes, selection-limit behavior, and limit-aware clear-all.
- TreeSelect focused contracts: **33/33** (14 direct, 19 presentation), including Reactive Forms `updateOn: 'blur'` timing, one focus/blur output per composite focus boundary, root/trigger presentation, readonly guards, custom filter/action labels, disabled transitions, and retaining filter text when the panel hides. Public, CVA, and readonly disabled states disable the filter; loading keeps filtering available. The Clear button retains its existing immediate touched behavior.
- DataTable focused contract: **17/17**. All 40 own inputs are classified: 38 behavior-tested, `sortMode` and `metaKeySelection` deprecated/no-op, and no live inputs unasserted.
- TagsInput behavior/CVA suites: **12/12**, including class identity through legacy imports.
- Tooltip focused suite: **8/8**, including viewport-bounded wrapping for long `fitContent` content.
- Select focused contracts: **31/31**; all 60 supported input/model entries are behavior-tested and 18 compatibility no-ops are deprecated ([input audit](../select-input-followup-20260923/gate-summary.md)).
- Table focused contract: **42/42**; all 103 inputs are classified, with 76 supported inputs behavior-tested and 27 unsupported compatibility inputs deprecated ([focused log](table-input-followup.log)).
- TreeTable input audit: **19** focused cases; 48 active inputs are behavior-tested and 28 compatibility no-ops are deprecated ([audit](../tree-table-input-audit-20260923/input-audit.md)). Its treegrid now exposes the correct `aria-multiselectable` state.
- NumberInput input audit: **12/12** focused cases; all **55** inputs are behavior-tested, including `localeMatcher`, layout/variant styling, precision, and fallback spinbutton naming ([audit](../number-input-audit-20260923/input-audit.md), [focused log](../number-input-audit-20260923/focused-tests.log)).
- Modal input audit: **21/21** focused cases; **38/49** inputs are behavior-tested and **11** unsupported compatibility inputs are deprecated ([audit](../modal-input-audit-20260923/report.md)). Dialog naming now gives `aria-labelledby` precedence by removing a conflicting `aria-label`.

- Full library suite: **1295/1295** under seeds `4321` and `20260923` ([seed 4321](library-seed-4321.log), [seed 20260923](library-seed-20260923.log)).
- Library build and isolated current/minimum-Angular consumers: **224** JavaScript entries/aliases, public declarations without `skipLibCheck`, and **5** Sass entries ([build](build-library.log), [current package](package.log), [minimum package](package-minimum.log)).
- Compatibility metadata: passed ([log](compatibility.log)).
- SSR lifecycle/render: **147/147** inventory components ([log](ssr.log)).
- Theme contracts: **6/6** in forced light mode and **6/6** in forced dark mode ([log](themes.log)).
- Docs application tests: **75/75** and production docs build passed ([tests](docs-tests.log), [build](build-docs.log)).
- Inventory: **147** components, **19** directives, **4** services, and **223** package entry points ([log](inventory.log)).
- Template application build passed ([build](build-template.log)).
- Documentation/source integrity: **115** quality Markdown files, **886** local links, **1** public LLM-guide link, **408** source anchors, **171** P2 anchors, and **147/147** ledger/inventory references; no unresolved links or anchors ([integrity](documentation-integrity.log)). `git diff --check` passed ([diff-check.log]).

The Tooltip component class remains exported for compatibility but is now deprecated for direct use; applications should configure tooltips through `TooltipDirective`. No whole component was identified as safely removable from repository evidence alone. Public-consumer review remains necessary before removing compatibility exports or inert deprecated inputs.
