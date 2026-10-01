# Drag/drop contract batch

Date: 2026-09-23

Focused runtime command:

```text
NG_BUILD_MAX_WORKERS=2 /Users/matheuscastro/.nvm/versions/node/v24.16.0/bin/node ./node_modules/@angular/cli/bin/ng.js test orc-ds --watch=false --browsers=ChromeHeadlessCI --include='projects/orc-ds/drag-drop/drag-drop.directive.spec.ts'
```

Runtime: Node v24.16.0, ChromeHeadless 153.0.0.0.

Result: **4 SUCCESS, 0 FAILED**.

Coverage:

- draggable writes the private scope MIME marker and matching drops emit once;
- mismatching scopes are rejected at dragenter and drop;
- protected dragover accepts the MIME marker while drop requires the readable scope payload;
- dynamic draggable/droppable disabled inputs update native `draggable`, disabled classes, `aria-disabled`, and clear active state.

The focused run completed without Angular runtime warnings or errors. Full captured output: `focused-runtime.log`.
