# DataView documentation batch

Date: 2026-09-23

The docs catalog now exposes DataView at `/components/data-view` through the existing dynamic component-doc route. The preview uses controlled local data and exercises filter, ascending/descending name sorting, grid/list layout, and paginator page movement. The page documents the verified lazy boundary: `onLazyLoad` is a notification for the consumer, which owns remote fetching, `value`/`totalRecords` updates, and any server-side sorting.

## Evidence

| Check                                          |            Result |
| ---------------------------------------------- | ----------------: |
| Focused `component-doc-page.component.spec.ts` | **14/14 SUCCESS** |
| Full `npm run test:docs`                       | **67/67 SUCCESS** |
| `npm run build:docs`                           |          **PASS** |
| `git diff --check`                             |          **PASS** |

The page-level specs assert catalog metadata and API guidance, rendered `orc-data-view`/paginator output, descending local order, list layout, and paginator state after activating the next-page control. No library source was changed.
