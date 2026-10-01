# DatePicker input contract audit

Audit date: 2026-09-23. The declaration inventory used was `docs/quality/inventory.json`; the observable contract was checked against the DatePicker and Calendar templates, implementation, focused specs, the component catalog, and the public LLM usage guide. No DatePicker input is inherited from another library component. `DatePickerComponent` implements `ControlValueAccessor`; `value`, `viewDate`, and `overlayVisible` are model inputs in addition to the ordinary inputs below.

## DatePickerComponent

### Supported and observable

The following inputs have a source-backed effect in `date-picker.component.ts` and/or its template:

`maxDateCount`, `hideOnDateTimeSelect`, `value`, `label`, `min`, `max`, `helperText`, `error`, `required`, `disabled`, `placeholder`, `dateFormat`, `selectionMode`, `showIcon`, `showButtonBar`, `showClear`, `inline`, `showTime`, `timeOnly`, `showSeconds`, `touchUI`, `showWeek`, `showOtherMonths`, `selectOtherMonths`, `readonlyInput`, `autofocus`, `hourFormat`, `firstDayOfWeek`, `numberOfMonths`, `minDate`, `maxDate`, `disabledDates`, `disabledDays`, `view`, `ariaLabel`, `ariaLabelledBy`, `name`, `inputId`, `tabindex`, `panelStyleClass`, `panelStyle`, `style`, `styleClass`, `inputStyle`, `inputStyleClass`, `dataType`, `defaultDate`, `viewDate`, `showOnFocus`, `keepInvalid`, `appendTo`, `autoZIndex`, `baseZIndex`, `focusOnShow`, `focusTrap`, `fluid`, `variant`, `size`, `multipleSeparator`, `rangeSeparator`, `yearNavigator`, `monthNavigator`, `yearRange`, `stepHour`, `stepMinute`, `stepSecond`, `clearButtonStyleClass`, `todayButtonStyleClass`, `icon`, `iconAriaLabel`, `defaultViewDate`, `locale`, `panelAriaLabel`, `previousMonthLabel`, `nextMonthLabel`, `timePickerAriaLabel`, `previousHourLabel`, `nextHourLabel`, `previousMinuteLabel`, `nextMinuteLabel`, `previousSecondLabel`, `nextSecondLabel`, `toggleMeridiemLabel`, `todayLabel`, `clearLabel`, and `overlayVisible`.

`touchUI` adds a responsive touch presentation with larger controls and a bottom-sheet placement at both wide and narrow widths; narrow viewports additionally enforce the CSS media-query edge constraints. Touch mode applies its fixed layout when the panel opens, while the shared anchored-popup placement observer owns document scroll/resize updates; popup teardown removes the panel and its observers. `variant="filled"|"outlined"` changes the field surface, and `size="small"|"large"` changes input/trigger dimensions. `monthNavigator` and `yearNavigator` render native accessible header selects; `yearRange="start:end"` bounds the year options and invalid ranges fall back to the current twelve-year window. The popup intentionally remains `aria-modal="false"` while `focusTrap` defaults true: it is a dismissible non-modal popup whose keyboard Tab cycle is bounded to its calendar controls.

Evidence includes the native input and labels in `date-picker.component.html`, calendar projection and date/time selection in the same template, and implementation paths for parsing/CVA, constraints, selection mode, month navigation, time stepping, focus trapping, attachment, and button actions. The new component-boundary regression in `date-picker.component.spec.ts` verifies that `view="month"` reaches the calendar DOM and that selecting March updates the parent value to `2026-03-01`. Existing focused specs cover date and string CVA values, date/time and time-only values, invalid/constraint handling, range and month/year selection, labels, keyboard navigation, action labels, attachment, dismissal and cleanup.

The public LLM guide now documents the typed value models, single/multiple/range selection, date/time string shapes, presentation and navigation options, all supported input names and outputs, and the deprecated no-op fields. The browser gate does not establish every cross-product of selection mode, locale, date/time, and attachment behavior; those combinations remain a separate verification question rather than an undocumented contract claim.

### Deprecated compatibility no-ops

The following inputs remain compatibility fields because they have no template binding, class/style effect, or implementation read. They remain public and state their limits in JSDoc in `projects/orc-ds/date-picker/date-picker.component.ts`:

| Input                                             | Verified behavior                           | Replacement/limit                                                 |
| ------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| `mask`                                            | Does not mask or rewrite text input.        | Use `dateFormat` plus the date parser.                            |
| `showTransitionOptions` / `hideTransitionOptions` | Do not configure panel transitions.         | Visibility has no configurable transition in this implementation. |
| `iconDisplay`                                     | Does not move the icon into the text input. | `showIcon` renders the dedicated trigger button.                  |

These are explicit no-op classifications rather than inferred support claims. Implementing input masking, transition engines, or alternate icon placement would be a separate API design milestone.

## DatePickerCalendarComponent

All inventory inputs are supported and observable in the standalone calendar source/template:

`value`, `selectedValues`, `currentMonth`, `min`, `max`, `disabled`, `disabledDates`, `disabledDays`, `firstDayOfWeek`, `showOtherMonths`, `selectOtherMonths`, `showWeek`, `embedded`, `view`, `monthNavigator`, `yearNavigator`, `yearRange`, `locale`, `ariaLabel`, `previousMonthLabel`, `nextMonthLabel`, `weekLabel`, and `monthOffset`.

The calendar derives allowed dates and period selection from the constraint inputs, renders date/month/year views, applies locale and labels, controls the one-tab-stop active date, and emits `dateSelected` and `viewDateChange`. Focused tests cover hidden other-month cells, disabled date/month/year selection, month/year period fallback inside constraints, and keyboard movement across a month boundary.

## Outputs and CVA surface checked

`DatePickerComponent` outputs checked in source/specs are `onFocus`, `onBlur`, `onClose`, `onSelect`, `onClear`, `onInput`, `onTodayClick`, `onClearClick`, `onShow`, `onViewDateChange`, `onMonthChange`, `onYearChange`, and `onClickOutside`. `DatePickerCalendarComponent` emits `dateSelected` and `viewDateChange`. CVA writes, disabled state, invalid-input handling, selection updates, clear/today actions, and touched notifications are covered by the focused behavior suite; the browser gate does not claim every Cartesian combination of selection mode, locale, and time configuration.
