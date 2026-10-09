---
'@ciag/orchestra': minor
---

`SeparatorComponent` (`orc-separator`, `@ciag/orchestra/separator`) is now `@deprecated` in favour of `DividerComponent` (`orc-divider`). For the same accessible output as a labelled separator use `<orc-divider [decorative]="false" ariaLabel="…">` — the divider is decorative by default. The separator keeps working, unchanged, until the 23.0.0 gate.
