# Image/Card/Slider frozen-source gate

Generated 2026-09-13 on Node 24.16.0 with `NG_BUILD_MAX_WORKERS=2`.

| Gate                                | Result                                                                                                                               | Evidence                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Library + runtime diagnostics specs | PASS, 602/602                                                                                                                        | `library-tests.log`                                                |
| Compatibility                       | PASS                                                                                                                                 | `compatibility.log`                                                |
| Library production build            | PASS                                                                                                                                 | `build-lib.log`                                                    |
| Documentation production build      | PASS                                                                                                                                 | `build-docs.log`                                                   |
| Template production build           | PASS                                                                                                                                 | `build-template.log`                                               |
| Light/dark theme contract           | PASS, 6/6 per theme                                                                                                                  | `themes.log`                                                       |
| Documentation specs                 | PASS, 38/38                                                                                                                          | `docs-tests.log`                                                   |
| Current packed consumer             | PASS: 224 JS entries, declarations, 5 Sass entries                                                                                   | `package-current.log`                                              |
| Minimum Angular packed consumer     | PASS: 224 JS entries, declarations, 5 Sass entries                                                                                   | `package-minimum.log`                                              |
| Current sealed-package SSR          | PASS: 147/147 imported, instantiated, canonical selectors matched, rendered, and default lifecycle completed; 0 failures/diagnostics | `verify-ssr.log`, `verify-ssr-report.md`, `verify-ssr-result.json` |
| SSR abnormal-exit self-check        | PASS: leaked success becomes timeout failure; nonzero success becomes render failure                                                 | `verify-ssr-self-check.log`                                        |

The SSR archive is immutable for this run: SHA-256 `a9782e8341b1c9f1650a252d387e6d5b96ff0c61c5a3ba04a9b9035b77dbc910`, package `@ciag/orchestra@22.1.0`, Angular `22.1.2`. Interactive/browser state, hydration, and application-specific provider coverage remain outside this server-render gate.
