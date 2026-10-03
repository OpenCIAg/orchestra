---
'@ciag/orchestra': minor
---

Unified the size vocabulary across the library as an expand–contract change. Every sized control now accepts the canonical `sm | md | lg` scale (`md` renders as the default middle size), and the PrimeNG-era `small | large` values keep rendering identically as deprecated aliases — `small` → `sm`, `large` → `lg` — normalized internally, documented on each input, and scheduled for removal at the 23.0.0 gate. No public API surface mixes vocabularies anymore, and the canonical controls gain no new inputs.

Legacy-vocabulary controls widened to the canonical vocabulary (the complete old→new enumeration for the 23.0.0 gate manifest; the mapping is identical on every control — `small` → `sm`, `large` → `lg` — applied to the `size` input of each):

- `orc-select` (`SelectSize` now `sm | md | lg | small | large`)
- `orc-table`
- `orc-data-table`
- `orc-cascade-select`
- `orc-checkbox`
- `orc-radio-button`
- `orc-otp-input` / `orc-input-otp`
- `orcInputMask` / `pInputMask` (host-class directive)
- `orc-multi-select` (compatibility no-op input; accepted values widened, no rendering effect)
- `orc-date-picker`
- `orc-tree-select`
- `orc-password` / `orc-input-password`
- `orc-select-button`
- `orc-toggle-button`
- `orc-split-button`

Controls that already spoke the canonical vocabulary and are unchanged: `orc-button`, `orc-icon-button` (icon size separately `xs | sm | md | lg | xl`), `orc-input`, `orc-textarea`, tab groups (`sm | md | lg`), `orc-spinner`, `orc-switch`, `orc-slider`, `orc-progress-bar` / `orc-progress-circle` (bar adds `xl`), `orc-paginator`, `orc-chip`, `orc-badge`, `orc-chip-input`, `orc-number-input`, `orc-color-picker`, `orc-avatar` (documented `xs | sm | md | lg | xl` scale), and `orc-modal` (`sm | md | lg` plus its documented extras `xl | fullScreen | custom`). The `orc-typography` and `orc-text` `size` inputs are typography font scales, not control sizes, and keep their documented scales.
