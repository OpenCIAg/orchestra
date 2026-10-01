# Navigation and public bindings coordinated gate

Status: **sealed and passed after SOURCE FREEZE (2026-09-22)**.

This folder is reserved for the fresh post-freeze evidence. It must contain
the exact command output for the full library/runtime suite, production
library/docs/template builds, light/dark theme checks, docs tests,
compatibility, current and minimum packed consumers, the strengthened SSR
147-component run plus its abnormal-exit self-check, and the compiled Angular
output metadata check for the 21 public bindings under review.

The repository scripts currently used by the gate are:

- `npm run test:lib:ci` (full library/runtime; Karma 9876)
- `npm run build:lib`, `npm run build:docs`, and `npm run build:template`
- `npm run test:themes:ci`
- `npm run test:docs -- --browsers=ChromeHeadlessCI`
- `npm run verify:compatibility`
- `npm run verify:package` and `npm run verify:package:minimum`
- `npm run verify:ssr`

The 602-test Image/Card/Slider and earlier 147-component SSR results remain a sealed
historical snapshot in
[`image-card-slider-batch`](../image-card-slider-batch). They are not evidence
for this fresh package. The current package archive, 147-component SSR result,
and all gate logs are sealed in this directory; see
[`gate-summary.md`](gate-summary.md).
