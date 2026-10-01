# OrderList documentation verification

## Scope

Added a discoverable `/components/order-list` catalog entry and route with a
small controlled example. The page demonstrates filtering, multiple selection,
controlled reorder, whole-widget disablement, a disabled example item, and the
documented keyboard instructions. The page intentionally does not expose the
deprecated `dragdrop` or `metaKeySelection` compatibility inputs.

## Evidence

Command:

```text
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9878 npm run test:docs -- --include='projects/docs/src/app/app-routing.spec.ts' --include='projects/docs/src/app/pages/components/order-list/order-list-page.component.spec.ts'
```

Result: **35 SUCCESS** (32 route/catalog checks and 3 OrderList page DOM tests).

The focused tests verify that the route renders and is discoverable from the
catalog, that a filtered option can be selected and reordered through the live
DOM, and that the host can be focused and disabled interaction prevents further
selection/reorder actions.

## Limit

The docs test uses the sealed `node_modules/@ciag/orchestra` package. Its
current OrderList bundle predates the source milestone's option-level roving
keyboard implementation and per-option disabled metadata. The page keeps the
current source contract's keyboard guidance, but this focused docs run only
proves host focus and key delivery; option Arrow/Home/End movement and
option-level `aria-disabled` should be rechecked after the next library package
build. No live narrow-viewport browser session or production docs build was run
in this bounded batch.
