# Sealed batch browser QA — 2026-09-13

Environment: local `ng serve docs` at `http://localhost:4307/`, built distribution, Chrome through CUA. The server output is retained in `docs/quality/verification/docs-devserver.log`; the viewport override was reset after the compact checks.

## Date Picker and DateTime

- Desktop dark theme: Date Picker opened and the rightmost August 22 cell updated the value to `2026-08-22`. DateTime opened; August 22 updated the date and Increase second changed `00` to `01`.
- Desktop dismissal: an outside click and Escape each collapsed the open DateTime popup.
- 320 CSS-pixel light theme: Date Picker stayed within the viewport (approximately x=8..300), opened above its trigger, left the trigger reachable, and the rightmost August 22 cell updated the value. DateTime's constrained popup exposed the calendar and, after internal scroll, the time controls; its rightmost August 22 cell and Increase second control both updated actual values.
- CUA accessibility state exposed named calendar navigation, date cells, Today/Clear actions and Hour/Minute/Second controls. No browser console warnings or errors were captured.

### Remaining theme and viewport combinations

- Desktop light (`1512×723` CSS px): computed body colors were `rgb(255, 255, 255)` / `rgb(20, 20, 20)`. Date Picker's rightmost August 22 cell updated the value to `2026-08-22`. DateTime's rightmost August 29 cell updated the value to `2026-08-29T13:20:00`, and Increase second changed it to `2026-08-29T13:20:01`. The constrained panel stayed within the viewport (`x=219`, `width=328`, `bottom=715`) with the trigger above it; outside click and Escape collapsed it.
- 320px dark (`320×800` CSS px): computed body colors were `rgb(31, 31, 31)` / `rgb(255, 255, 255)`. Date Picker stayed within `x=8..300`, above its trigger, and retained a reachable trigger. DateTime's rightmost August 29 cell updated the value to `2026-08-29T13:20:02`, and the Increase second control updated the actual value. Its panel stayed within `x=8..306`, with internal scrolling exposing the time controls while the trigger remained reachable.
- These additional combinations emitted no browser console warnings or errors. Screenshots for both combinations were captured inline through CUA.

## Tree View

At desktop light theme, expanding Workspace rendered its child group below the parent row with visible indentation. ArrowDown moved focus through Workspace, Aplicações and Pacotes to disabled Configurações. Enter and click on the disabled node left the selection/state unchanged. No visual or interaction defect was reproduced.

CUA emitted desktop and 320px screenshots during these checks. The CUA screenshot API exposes captures inline but does not provide a filesystem export operation; the observations above are the durable textual record for this run.
