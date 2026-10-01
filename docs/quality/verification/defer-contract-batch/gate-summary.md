# Defer contract batch

Date: 2026-09-22

Focused runtime command:

```text
NG_BUILD_MAX_WORKERS=2 /Users/matheuscastro/.nvm/versions/node/v24.16.0/bin/node ./node_modules/@angular/cli/bin/ng.js test orc-ds --watch=false --browsers=ChromeHeadlessCI --include='projects/orc-ds/defer/defer.directive.spec.ts'
```

Runtime: Node v24.16.0, ChromeHeadless 153.0.0.0.

Result: **4 SUCCESS, 0 FAILED**.

Coverage in `defer.directive.spec.ts`:

- structural content stays deferred until an intersecting entry, while non-intersecting entries do not load it;
- `onLoad` emits once and the observer disconnects after loading;
- an unavailable `IntersectionObserver` loads immediately;
- a structural anchor without a containing target loads immediately;
- destruction disconnects the observer and a stale callback cannot emit after the directive is destroyed.

The focused run completed without Angular runtime warnings or errors. The only source adjustment in this batch is the destroyed-state guard required by the test: a callback retained by an observer after fixture destruction previously attempted to emit through a destroyed `OutputRef` (`NG0953`).

Full captured output: `focused-runtime.log`.
