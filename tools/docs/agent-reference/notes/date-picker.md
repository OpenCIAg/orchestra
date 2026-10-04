`dataType="string"` (default) uses strings; `dataType="date"` reads and writes `Date` objects. `selectionMode="single"` returns one value, while `multiple` and `range` return arrays. The default single-date string is ISO `yyyy-MM-dd`; with `showTime`, strings use `yyyy-MM-ddTHH:mm[:ss]`, and `timeOnly` uses `HH:mm[:ss]`. Use `dateFormat` and `locale` for input display and parsing; keep the model in the selected data type.

`view="date"|"month"|"year"` selects the calendar view. `monthNavigator`, `yearNavigator`, and `yearRange="start:end"` configure native month/year selectors. `Today` and `Clear` are available when the button bar is shown. The anchored popup closes on outside interaction and Escape, restores focus, and supports a bottom-sheet touch presentation. It does not open the native browser date picker.

`mask`, `iconDisplay`, `showTransitionOptions`, and `hideTransitionOptions` remain deprecated compatibility no-ops. `showIcon` renders a separate trigger button; use `dateFormat` for text parsing rather than `mask`. This is a source-backed property inventory; it does not imply that every combination of selection mode, locale, and time settings has an end-to-end test.

```html
<orc-date-picker label="Delivery date" [(value)]="deliveryDate" showIcon showButtonBar showClear required />

<orc-date-picker label="Starts at" [(value)]="startsAt" dataType="date" showTime touchUI variant="filled" size="large" [stepMinute]="15" />
```
