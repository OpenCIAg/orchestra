# P2 Calendar and DateInput contract batch

Validated 2026-09-22 with Node 24.16.0 and `NG_BUILD_MAX_WORKERS=2`.

- Focused contract suite: **3/3 passed**.
- Existing P2 expansion compatibility suite: **116/116 passed**.
- No browser runtime errors or warnings were reported.

The focused suite covers date-only and date-time Calendar values, editable time CVA updates, invalid dates, emitted selected values, DateInput native `required`, strict date-only CVA writes, invalid input clearing, and touched/change callbacks.

Calendar `showTime` now renders a native time control and emits normalized `YYYY-MM-DDTHH:mm` values. DateInput keeps a strict native date-only contract and rejects date-time or invalid values. Remaining compatibility candidates are Calendar `dateFormat` (no formatting surface in the grid) and `inline` (the component is always inline); they should be documented as deprecated/no-op inputs or implemented in a separate bounded batch.

Evidence: [focused-runtime.log](focused-runtime.log) and [p2-expansion-runtime.log](p2-expansion-runtime.log).
