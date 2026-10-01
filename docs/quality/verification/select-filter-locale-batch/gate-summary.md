# Select filter locale regression

The query was lowercased with the host default locale before the configured `filterLocale` was applied. In Turkish, uppercase `I` therefore became `i`, while the configured locale correctly lowercased the option label to dotless `ı`; matching failed. Data-backed and projected options now pass the original trimmed query into the locale-aware matcher.

Validation passed:

- Focused Select browser suite: **16/16** ([log](focused.log)).
- Full library suite: **1188/1188** under both seeds ([4321](library-seed-4321.log), [20260923](library-seed-20260923.log)).
- Production library build ([log](build-lib.log)), compatibility check ([log](compatibility.log)), and current/minimum package consumer validation ([current](package-current.log), [minimum](package-minimum.log)).
- Docs production build after the public API guide update ([log](build-docs.log)).

The regression covers `filterLocale="tr-TR"` for both data-backed and projected Select options. The same focused batch verifies default accessible names for clear and chip-removal buttons while preserving caller overrides, plus announced loading and default/custom empty states for data and projected options. Broader Select input and locale coverage remains open.
