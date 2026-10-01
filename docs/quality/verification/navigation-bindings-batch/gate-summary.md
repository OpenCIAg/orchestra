# Navigation and public bindings coordinated gate

Sealed 2026-09-22 after SOURCE FREEZE. All commands used Node v24.16.0 with
`NG_BUILD_MAX_WORKERS=2` where applicable. No production build ran during SSR;
the verifier consumed the sealed `dist/orc-ds` produced at 18:44:11Z.

| Gate                                                     | Evidence                                                                                       | Result                                                                                                                |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Full library/runtime (`npm run test:lib:ci`, Karma 9876) | [library-tests.log](library-tests.log)                                                         | 642/642 passed                                                                                                        |
| Production library                                       | [build-lib.log](build-lib.log)                                                                 | passed; dist built 18:44:11.162Z                                                                                      |
| Production docs                                          | [build-docs.log](build-docs.log)                                                               | passed                                                                                                                |
| Production template                                      | [build-template.log](build-template.log)                                                       | passed                                                                                                                |
| Light and dark themes                                    | [themes.log](themes.log)                                                                       | 6/6 each passed                                                                                                       |
| Docs browser suite                                       | [docs-tests.log](docs-tests.log)                                                               | 38/38 passed                                                                                                          |
| Compatibility                                            | [compatibility.log](compatibility.log)                                                         | passed                                                                                                                |
| Current packed consumer                                  | [package-current.log](package-current.log)                                                     | 224 JS entries, declarations without `skipLibCheck`, 5 Sass entries passed                                            |
| Minimum Angular packed consumer                          | [package-minimum.log](package-minimum.log)                                                     | 224 JS entries, declarations without `skipLibCheck`, 5 Sass entries passed                                            |
| Compiled Angular public-binding metadata                 | [public-binding-metadata.log](public-binding-metadata.log)                                     | 21/21 registered; missing and duplicate lists empty                                                                   |
| Current-package SSR                                      | [verify-ssr-report.md](verify-ssr-report.md), [verify-ssr-result.json](verify-ssr-result.json) | 147/147 imported, instantiated, selector-matched, default-lifecycle-complete, and rendered; 0 failures, 0 diagnostics |
| SSR abnormal-exit self-check                             | [verify-ssr-self-check.log](verify-ssr-self-check.log)                                         | timeout and nonzero exit both rejected                                                                                |

The immutable package input is [ciag-orchestra-22.1.0.tgz](ciag-orchestra-22.1.0.tgz),
recorded in [package-archive.json](package-archive.json). Its SHA-256 is
`987657b1b5718fb79c05c1be3050af213da3e84798ca8110a290cebb8c4f0177`, matching
the archive hash recorded by the SSR verifier. The SSR run used Angular
22.1.2 and the sealed package archive.

The 21 metadata assertions cover 19 repaired same-event public aliases and the
two distinct PickList all-transfer outputs. SSR evidence covers default server
rendering and teardown only; interactive/open-state coverage is 0, and it does
not claim browser interaction, hydration, directives, pipes, services, or
application-specific provider coverage. The historical Image/Card/Slider
snapshot remains separate and is not counted in this gate.
