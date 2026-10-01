# DatePickerComponent public input audit

Audit date: 2026-09-23. The inventory has **90 declared DatePickerComponent public inputs**, including model inputs `value`, `viewDate`, and `overlayVisible`. No base class declares inherited inputs for this component. Outputs and ControlValueAccessor callbacks are recorded separately from this 90-input inventory.

Counts: **86 behavior-tested supported**, **4 explicitly deprecated no-op**, **0 unverified**. Existing overlay contracts for outside click, Escape, focus return, Tab containment, attachment and teardown remain in force. The focused browser run is recorded in [focused-tests.log](focused-tests.log).

The evidence column names focused assertions. The source column gives the first relevant declaration/template/runtime locations (line numbers refer to the checked-in DatePicker component files), so repeated/derived bindings can be followed without treating declaration-only inputs as support.

| Input | Trace: declaration / template / runtime | Classification | Current behavior evidence |
|---|---|---|
| `maxDateCount` | TS 68, 487, 625; HTML no direct binding | Behavior-tested supported | new component spec: honors focus, read-only, multiple-count, separator, and dismissal configuration |
| `hideOnDateTimeSelect` | TS 71, 646; HTML no direct binding | Behavior-tested supported | new component spec: honors focus, read-only, multiple-count, separator, and dismissal configuration |
| `value` | TS 39, 72, 73; HTML 35, 125 | Behavior-tested supported | component/behavior specs: model formatting, writeValue/CVA, parsing, and selection |
| `label` | TS 74; HTML 13, 14, 15 | Behavior-tested supported | new component spec: binds input, description, style, and overlay accessibility inputs |
| `min` | TS 75, 100, 314; HTML 36, 131, 193 | Behavior-tested supported | behavior spec: validates real dates and constraints for string/date models |
| `max` | TS 68, 76, 101; HTML 37, 132 | Behavior-tested supported | new component spec: applies DatePicker input constraints and preserves invalid text only when requested |
| `helperText` | TS 77; HTML 49, 293, 298 | Behavior-tested supported | new component spec: input descriptions; behavior spec: named and associated controls |
| `error` | TS 78; HTML 45, 47, 48 | Behavior-tested supported | new component spec: input error association and alert rendering |
| `required` | TS 79; HTML 16, 39 | Behavior-tested supported | new component spec: binds input attributes and label marker |
| `disabled` | TS 80, 102, 103; HTML 4, 40, 69 | Behavior-tested supported | behavior spec: closes and cleans up when disabled; rejects direct selection |
| `placeholder` | TS 81; HTML 38 | Behavior-tested supported | new component spec: binds input attributes |
| `dateFormat` | TS 82, 135, 379; HTML no direct binding | Behavior-tested supported | component spec: ISO model formatting/parsing; new constraint spec: localized parse validation |
| `selectionMode` | TS 83, 349, 399; HTML no direct binding | Behavior-tested supported | component spec: month view; behavior spec: range and multi-value selection |
| `showIcon` | TS 84; HTML 25, 65 | Behavior-tested supported | component specs: trigger rendering, labels, and actions |
| `showButtonBar` | TS 85; HTML 252, 254 | Behavior-tested supported | component specs: Today/Clear actions and labels |
| `showClear` | TS 86; HTML 252, 267 | Behavior-tested supported | component specs: Clear action/value reset |
| `inline` | TS 87, 201, 533; HTML 54, 97, 107 | Behavior-tested supported | overlay spec: inline calendar remains in normal flow |
| `showTime` | TS 88, 360, 368; HTML 154 | Behavior-tested supported | behavior and overlay specs: date-time values, controls, dismissal |
| `timeOnly` | TS 89, 309, 360; HTML 121, 154 | Behavior-tested supported | behavior spec: time-only value and Date output |
| `showSeconds` | TS 90, 375, 615; HTML 211 | Behavior-tested supported | overlay spec: seconds and meridiem controls; new step/label spec |
| `touchUI` | TS 91, 206, 211; HTML 6, 108 | Behavior-tested supported | overlay specs: bottom sheet, touch target sizes, Escape/focus return |
| `showWeek` | TS 92; HTML 136 | Behavior-tested supported | new locale/action spec: week heading rendered |
| `showOtherMonths` | TS 93; HTML 141 | Behavior-tested supported | new locale/action spec: adjacent-month cells hidden when false |
| `selectOtherMonths` | TS 94; HTML 142 | Behavior-tested supported | new adjacent-month spec: enabled neighboring date selects |
| `readonlyInput` | TS 95, 482; HTML 41 | Behavior-tested supported | new focus/read-only spec: input editing ignored |
| `autofocus` | TS 96; HTML 42 | Behavior-tested supported | New input-binding spec verifies that enabling the input sets the native input's `autofocus` property. Native focus timing remains browser-dependent and is not asserted. |
| `hourFormat` | TS 97, 657; HTML 239 | Behavior-tested supported | overlay/new time spec: 12-hour meridiem control and display |
| `firstDayOfWeek` | TS 98; HTML 130 | Behavior-tested supported | new locale/action spec: localized weekdays and Monday start |
| `numberOfMonths` | TS 99, 327; HTML no direct binding | Behavior-tested supported | behavior spec: two displayed months stay synchronized |
| `minDate` | TS 100, 320, 456; HTML no direct binding | Behavior-tested supported | new constraint spec: Date object min binds to native input and rejects earlier entry |
| `maxDate` | TS 68, 101, 323; HTML no direct binding | Behavior-tested supported | new constraint spec: max Date constraint via component parser |
| `disabledDates` | TS 102, 476; HTML 134 | Behavior-tested supported | new constraint spec: rejects disabled date input; behavior spec: direct disabled selection |
| `disabledDays` | TS 103, 475; HTML 135 | Behavior-tested supported | behavior spec: disabled weekday direct-input validation |
| `view` | TS 16, 17, 67; HTML 81, 126, 127 | Behavior-tested supported | component spec: public month view reaches calendar and accepts a month |
| `ariaLabel` | TS 105, 106; HTML 43, 44, 116 | Behavior-tested supported | new input accessibility spec: native input name |
| `ariaLabelledBy` | TS 106; HTML 44, 118 | Behavior-tested supported | new input accessibility spec: input and panel labelledby bindings |
| `name` | TS 52, 107; HTML 31 | Behavior-tested supported | new input accessibility spec: native name |
| `inputId` | TS 108, 184; HTML no direct binding | Behavior-tested supported | new input accessibility spec: custom id associations |
| `tabindex` | TS 109; HTML 57, 101 | Behavior-tested supported | new input accessibility spec: configured tab index |
| `panelStyleClass` | TS 110; HTML 105 | Behavior-tested supported | new input accessibility spec: panel class |
| `panelStyle` | TS 110, 111; HTML 105, 109 | Behavior-tested supported | new input accessibility spec: panel inline style |
| `style` | TS 48, 114, 117; HTML 3, 11, 29 | Behavior-tested supported | new input accessibility spec: root inline style |
| `styleClass` | TS 117; HTML 3 | Behavior-tested supported | new input accessibility spec: root class |
| `inputStyle` | TS 118, 121; HTML 28, 29 | Behavior-tested supported | new input accessibility spec: input inline style |
| `inputStyleClass` | TS 121; HTML 28 | Behavior-tested supported | new input accessibility spec: input class |
| `dataType` | TS 122, 408, 612; HTML no direct binding | Behavior-tested supported | behavior spec: string and Date CVA/value outputs |
| `defaultDate` | TS 123, 272; HTML no direct binding | Behavior-tested supported | new public-model spec: default date fallback initializes calendar view |
| `viewDate` | TS 124, 274, 279; HTML 127 | Behavior-tested supported | new public-model spec: model can set view month; behavior spec synchronizes navigation |
| `showOnFocus` | TS 125, 512; HTML 59 | Behavior-tested supported | new focus/read-only spec plus keyboard and focus dismissal specs |
| `keepInvalid` | TS 126, 498; HTML no direct binding | Behavior-tested supported | new constraint spec: invalid text is retained only when requested |
| `appendTo` | TS 127, 205; HTML no direct binding | Behavior-tested supported | overlay specs: body/custom targets, parent modal and teardown |
| `autoZIndex` | TS 128; HTML 111 | Behavior-tested supported | new input accessibility spec: automatic z-index disabled path |
| `baseZIndex` | TS 129; HTML 111 | Behavior-tested supported | new input accessibility spec: configured z-index |
| `focusOnShow` | TS 130, 542; HTML no direct binding | Behavior-tested supported | new focus/read-only spec: ArrowDown opens without stealing focus when false |
| `focusTrap` | TS 131, 538; HTML no direct binding | Behavior-tested supported | overlay spec: trapped Tab cycle; new time spec: Tab not canceled when false |
| `fluid` | TS 132; HTML 5 | Behavior-tested supported | new input accessibility spec: fluid class |
| `variant` | TS 133; HTML 7, 8 | Behavior-tested supported | component spec: filled and outlined presentation |
| `size` | TS 134; HTML 9, 10 | Behavior-tested supported | component spec: small and large dimensions |
| `mask` | TS 136; HTML no direct binding | Deprecated no-op | Masking is intentionally not implemented; dateFormat plus the shared parser handles text parsing and avoids silently rewriting keystrokes. |
| `multipleSeparator` | TS 137, 351, 401; HTML no direct binding | Behavior-tested supported | new focus/read-only spec: visible list uses configured separator |
| `rangeSeparator` | TS 138, 350, 400; HTML no direct binding | Behavior-tested supported | new focus/read-only spec: visible range uses configured separator |
| `yearNavigator` | TS 139; HTML 139 | Behavior-tested supported | component spec: accessible bounded year navigator |
| `monthNavigator` | TS 140; HTML 138 | Behavior-tested supported | component spec: accessible month navigator |
| `yearRange` | TS 141; HTML 140 | Behavior-tested supported | component specs: bounded, reversed, malformed year range behaviors |
| `stepHour` | TS 142, 667; HTML no direct binding | Behavior-tested supported | new time spec: configured hour increment |
| `stepMinute` | TS 143, 669; HTML no direct binding | Behavior-tested supported | new time spec: configured minute increment |
| `stepSecond` | TS 144, 670; HTML no direct binding | Behavior-tested supported | new time spec: configured second increment |
| `showTransitionOptions` | TS 146; HTML no direct binding | Deprecated no-op | Visibility has no transition engine/configuration in this implementation; accepting and retaining the field preserves source compatibility. |
| `hideTransitionOptions` | TS 148; HTML no direct binding | Deprecated no-op | Visibility has no transition engine/configuration in this implementation; accepting and retaining the field preserves source compatibility. |
| `clearButtonStyleClass` | TS 149; HTML 272 | Behavior-tested supported | new locale/action spec: Clear class |
| `todayButtonStyleClass` | TS 150; HTML 259 | Behavior-tested supported | new locale/action spec: Today class |
| `icon` | TS 151, 152, 153; HTML 70, 77, 78 | Behavior-tested supported | new input accessibility spec: custom icon class |
| `iconAriaLabel` | TS 152; HTML 70 | Behavior-tested supported | new input accessibility spec: trigger accessible name |
| `iconDisplay` | TS 154; HTML no direct binding | Deprecated no-op | The icon is a dedicated trigger button; alternate in-field placement is unsupported and showIcon controls whether that button exists. |
| `defaultViewDate` | TS 155, 272; HTML no direct binding | Behavior-tested supported | new public-model spec: preferred fallback view date |
| `locale` | TS 156, 393, 419; HTML 143 | Behavior-tested supported | new locale/action spec: French month and weekday localization |
| `panelAriaLabel` | TS 157; HTML 116, 144 | Behavior-tested supported | new input accessibility spec: dialog accessible name |
| `previousMonthLabel` | TS 158; HTML 145 | Behavior-tested supported | new locale/action spec: previous navigation name |
| `nextMonthLabel` | TS 159; HTML 146 | Behavior-tested supported | new locale/action spec: next navigation name |
| `timePickerAriaLabel` | TS 160; HTML 158 | Behavior-tested supported | new time spec: time control group name |
| `previousHourLabel` | TS 161; HTML 178 | Behavior-tested supported | new time spec: previous hour control name |
| `nextHourLabel` | TS 162; HTML 167 | Behavior-tested supported | new time spec: next hour control name |
| `previousMinuteLabel` | TS 163; HTML 204 | Behavior-tested supported | new time spec: previous minute control name |
| `nextMinuteLabel` | TS 164; HTML 193 | Behavior-tested supported | new time spec: next minute control name |
| `previousSecondLabel` | TS 165; HTML 231 | Behavior-tested supported | new time spec: previous second control name |
| `nextSecondLabel` | TS 166; HTML 220 | Behavior-tested supported | new time spec: next second control name |
| `toggleMeridiemLabel` | TS 167; HTML 242 | Behavior-tested supported | new time spec: meridiem toggle name |
| `todayLabel` | TS 168; HTML 264 | Behavior-tested supported | component/new locale-action specs: Today action label |
| `clearLabel` | TS 169; HTML 277 | Behavior-tested supported | component/new locale-action specs: Clear action label |
| `overlayVisible` | TS 183, 201, 233; HTML 54, 71, 97 | Behavior-tested supported | new public-model spec: external visibility input opens and closes panel |

## Review notes

- The deprecated inputs have JSDoc compatibility declarations and remain accepted at the public boundary. `mask` does not rewrite keystrokes; transition options do not configure animations; `iconDisplay` does not move the trigger. Existing replacements/limits are intentionally documented in declaration comments.
- Native autofocus is verified at the DOM property boundary; exact focus timing during dynamically rendered overlays remains a cross-browser check.
- Tests ran on Chrome Headless 153 on macOS. The focused suite does not cover Safari/WebKit, Firefox, Android/iOS touch browsers, assistive-technology combinations, or native Popover API differences in those engines. Those remain cross-browser/mobile risks, especially for touch sheet placement and focus restoration.
- Locale and time behavior were retained and asserted: French localization, custom date parsing, Date/string values, time-only/date-time values, 12-hour meridiem, seconds and custom step sizes. Responsive touch behaviors remain covered by the existing overlay suite.
