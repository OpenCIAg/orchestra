# Autocomplete Q21 follow-up

Date: 2026-09-12

Autocomplete now treats IME composition as an editing transaction. Intermediate
`input` events update the visible query without changing the form value,
filtering, or opening a delayed panel. The committed value is processed from
`compositionend`; composing keyboard events (including the browser's keyCode
229 fallback) cannot select or dismiss the popup.

Keyboard navigation now preserves native input behavior when no enabled option
can be reached. ArrowUp/ArrowDown, Home, and End prevent the default only when
they move the active option, and Enter ignores disabled or stale active indexes.

The focused suite contains 19 specs, including
`projects/orc-ds/runtime-diagnostics.spec.ts`, and passes in Chrome Headless on
Karma port 9877. Remaining Q21 verification is nested-theme inheritance for
detached panels plus responsive and cross-browser review.
