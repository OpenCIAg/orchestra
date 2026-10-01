# Splitter contract batch

This batch covers the Splitter implementation in `projects/orc-ds/p2/p2-overlay-components.ts` and the dedicated DOM contract in `projects/orc-ds/splitter-contract.spec.ts`.

The supported panel-content API is a named standalone template:

```html
<orc-splitter [panels]="panels">
  <ng-template orcSplitterPanel="left">Left content</ng-template>
  <ng-template orcSplitterPanel="right">Right content</ng-template>
</orc-splitter>
```

`SplitterPanel.id` selects the matching template. `size` supplies the initial percentage. `minSize` is a percentage lower bound for that panel; resizing stops at the bound and a set of minima whose sum exceeds 100% is proportionally normalized. Consumers should provide one named template for each panel when panel mode is enabled. When `panels` is empty, ordinary projected content remains supported through the existing fallback projection.

Each gutter is a focusable `role="separator"` with orientation, value, minimum, maximum, and an accessible label. Horizontal gutters respond to Left/Right and vertical gutters respond to Up/Down. Boundary no-ops do not emit resize output. The contract spec also verifies panel regions, content routing, output cardinality, and DOM updates after resizing.

Focused command (Node 24.16.0, ChromeHeadlessCI, Karma 9878):

```sh
NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9878 /Users/matheuscastro/.nvm/versions/node/v24.16.0/bin/node ./node_modules/@angular/cli/bin/ng.js test orc-ds --watch=false --browsers=ChromeHeadlessCI --include=projects/orc-ds/splitter-contract.spec.ts --exclude=projects/orc-ds/p2-layout-contract.spec.ts --exclude=projects/orc-ds/defer/defer.directive.spec.ts
```

Result: **3/3 focused specs passed**. Full output is retained in [focused.log](focused.log).

The expansion/runtime command additionally included `projects/orc-ds/p2-expansion.spec.ts` and `projects/orc-ds/runtime-diagnostics.spec.ts`, and passed **119/119 specs** with no runtime diagnostic failure. The unrelated `p2-layout-contract.spec.ts` generic-query compile error and `defer.directive.spec.ts` strict-null compile error are excluded from these bounded runs; neither is part of this Splitter patch. Full output is retained in [combined.log](combined.log).
