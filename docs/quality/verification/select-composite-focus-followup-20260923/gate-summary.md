# Select composite-focus follow-up — 2026-09-23

PASS. The focused Select suite passed **19/19**. The complete library suite passed **1235/1235** under Jasmine seeds `4321` and `20260923`; the Angular library package build, documentation integrity, and `git diff --check` passed.

The trigger and portaled search panel now behave as one focus boundary for CVA touch and public blur outputs. Internal focus movement does not mark the control touched. With `updateOn: 'blur'`, a changed selection remains pending until focus leaves the component. A true focus exit or a click on a non-focusable outside target touches once, emits blur once, and closes the panel. Panel closure and clear/chip-removal actions no longer call the CVA touched callback independently of focus.

Historical input tally at this composite-focus checkpoint: the 78-entry Select audit classified 22 supported-tested, 38 supported-untested, and 18 deprecated no-op entries. The later [Select input follow-up](../select-input-followup-20260923/gate-summary.md) supersedes that tally: all 60 supported inputs now have behavior assertions, and the 18 unsupported compatibility inputs remain deprecated. The initial-only `lazy`/`virtualScroll` range contract and remaining cross-browser, physical-device, and assistive-technology review are recorded there.

| Gate                           | Result           | Evidence                                                   |
| ------------------------------ | ---------------- | ---------------------------------------------------------- |
| Select focused suite           | PASS — 19/19     | [focused-tests.log](focused-tests.log)                     |
| Full library, seed 4321        | PASS — 1235/1235 | [library-seed-4321.log](library-seed-4321.log)             |
| Full library, seed 20260923    | PASS — 1235/1235 | [library-seed-20260923.log](library-seed-20260923.log)     |
| Angular library package build  | PASS             | [build-library.log](build-library.log)                     |
| Documentation/source integrity | PASS             | [documentation-integrity.log](documentation-integrity.log) |
| `git diff --check`             | PASS             | [diff-check.log](diff-check.log)                           |
