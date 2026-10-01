# Menu-family deferred preview evidence

Date: 2026-09-23

The TieredMenu, PanelMenu, MegaMenu, and CommandMenu examples live in the standalone `menu-family-preview.component.ts/html/scss` module and render only for their four route IDs through an Angular `@defer` boundary. The menu implementations live in `projects/orc-ds/p2/p2-menu-family-components.ts`; the original P2 barrel and feature entry points continue to re-export them.

The first template-only extraction produced a small preview chunk but did not defer the menu implementations: the generic page's P2 compatibility import still caused the shared implementation chunk to load eagerly. That was an incomplete split. A docs-only P2 facade in `projects/orc-ds/p2/p2-doc-components.ts`, selected by the docs TypeScript path maps, now exports the P2 symbols required by the generic preview while omitting the menu-family and command-menu declarations. The menu preview imports those declarations through a separate route-specific source path. The facade is private to the docs build; published package entry points are unchanged.

The subsequent Icon extraction also removed the 3,903-entry Material Symbols catalog from the generic page. Current graph measurements and the static-closure scan are recorded in [Icon deferred-preview evidence](icon-catalog-deferred-20260923.md). At that latest production build:

| Chunk                                  | Raw bytes | Gzip bytes | Loading behavior                      |
| -------------------------------------- | --------: | ---------: | ------------------------------------- |
| Generic component-doc page             |   359,082 |     88,883 | Loaded for `/components/:componentId` |
| Icon catalog preview                   | 1,844,014 |    476,796 | Deferred to the Icon route            |
| Menu-family preview and implementation |    60,968 |     11,260 | Deferred to the four menu routes      |

The generic page's recursive static import closure contains 14 chunks and no menu implementation selectors or icon catalog data/UI. The generic page still has many unrelated non-menu preview implementations and retains substantial route-independent component documentation and behavior code, so this is not a completed route-granularity or overall documentation-bundle optimization milestone. Further preview-family extraction must preserve existing routes and interactions and include a production graph measurement.

## Validation

- Focused component-doc suite: **22/22 SUCCESS**.
- Full docs suite: **75/75 SUCCESS**.
- `npm run build:docs`: **PASS**.
- `npm run build:lib`: **PASS** after the menu implementation source split.
- Compatibility verification: **PASS** after the source split.
- `git diff --check`: **PASS**.

The focused and integrated source-freeze results are distinct: source-freeze-31 included this docs bundle refactor with the component and documentation-integrity checks at that checkpoint; its [gate summary](integrated-20260923-source-freeze-31/gate-summary.md) is historical and is superseded by the [current 1255-test gate](form-controls-next-followup-20260923/gate-summary.md).
