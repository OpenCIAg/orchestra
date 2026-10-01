# Icon catalog deferred preview evidence

Date: 2026-09-23

`IconCatalogPreviewComponent` now owns the Material Symbols catalog import, filtering state, family/fill controls, and clipboard fallback. The generic component page retains the Icon documentation/API text and renders the preview through an `@defer` boundary. `ORC_MATERIAL_SYMBOLS` is absent from the generic component-doc chunk and its recursive static-import closure.

## Production graph and sizes

The post-extraction build was `npm run build:docs` with Node 24.16.0 and `NG_BUILD_MAX_WORKERS=2`. Exact bytes below were measured with `wc -c` and `gzip -c`.

| Build state            | Generic component-doc chunk | Raw bytes | Gzip bytes | Icon preview chunk   | Raw bytes | Gzip bytes |
| ---------------------- | --------------------------- | --------: | ---------: | -------------------- | --------: | ---------: |
| Before Icon extraction | `chunk-Jy3tdmrM.js`         | 2,196,730 |    564,507 | —                    |         — |          — |
| After Icon extraction  | `chunk-eg27jO9H.js`         |   359,082 |     88,883 | `chunk-BojEjbsV2.js` | 1,844,014 |    476,796 |

The before build's generic chunk contained the catalog UI (`icon-catalog-item`) and copy handler. The after build's generic recursive static closure contains 14 chunks; none contains `ORC_MATERIAL_SYMBOLS` or the catalog UI payload. The menu-family implementation chunk (`chunk-D9pRAGzz.js`, 60,968 raw / 11,260 gzip) is reachable only through the generic chunk's dynamic import and is absent from that static closure. The generic chunk still contains five textual `Material Symbols` references in documentation metadata, plus one occurrence of each menu selector as catalog/API metadata strings; no implementation selectors occur in its static dependencies.

## Validation

- Focused component-doc suite: **22/22 SUCCESS** (includes search, family/fill controls, clipboard fallback, and unrelated-route defer coverage).
- Full docs suite: **75/75 SUCCESS**.
- `npm run build:docs`: **PASS**.
- `git diff --check`: **PASS**.
