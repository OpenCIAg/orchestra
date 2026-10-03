---
'@ciag/orchestra': minor
---

Extract the p2 form and input families (combobox, multi-select, listbox, calendar, date-input, date picker companions, knob, editor, input-group and companions, icon-field, ifta-label, input-mask, input-otp, password, float-label, select-button, toggle-button, key-filter, tags-input and companions, input-color, organization chart) into canonical per-component directories with separate templates and styles. Import paths, selectors, and exports are unchanged; the p2 entry keeps re-exporting every symbol. PrimeNG host-class mimicry (`p-*`, `p-component`, `data-pc-name`) is removed from the extracted components; state hooks keep their `orc-p2-*` names except where noted in the parity specs.
