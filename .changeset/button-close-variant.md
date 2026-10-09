---
'@ciag/orchestra': minor
---

`orc-button` gains `variant="close"`: a square, transparent dismiss button that draws its own close glyph (an explicit `iconLeft`/`iconRight` replaces it). Projected text is kept as the accessible name (visually hidden); with nothing projected the button is named `Close`, and `ariaLabel`/`ariaLabelledBy` still take precedence. `CloseButtonComponent` (`orc-close-button`, `@ciag/orchestra/close-button`) is now `@deprecated` in favour of `<orc-button variant="close">` and keeps working until the 23.0.0 gate.
