---
'@ciag/orchestra': minor
---

`orc-spinner` adds the opt-in `closeOnEscape` input and the `fullScreenChange` output, so `[(fullScreen)]` works: with `closeOnEscape`, pressing Escape while full screen emits `fullScreenChange(false)`. The spinner never hides itself, and the default (no Escape handling) keeps blocking loaders blocking.
