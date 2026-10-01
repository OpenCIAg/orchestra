# Slider contract batch

Validated 2026-09-22 with Node 24.16.0 and `NG_BUILD_MAX_WORKERS=2`.

Command:

```text
node ./node_modules/@angular/cli/bin/ng.js test orc-ds --watch=false --browsers=ChromeHeadlessCI --include='projects/orc-ds/slider/slider.component.spec.ts'
```

Result: **7/7 focused tests passed** with no browser runtime errors or warnings. The suite covers zero and malformed CVA values, reversed and invalid ranges, nonfinite `min`/`step`, vertical pointer and keyboard geometry, pointer ownership, autofocus behavior, and autofocus cancellation after disable/destroy.

The source preserves nonfinite numeric input values through the input transform so `hasInvalidRange()` can report invalid configuration; effective geometry and step calculations still use safe fallbacks.

Full runner output is in [focused-runtime.log](focused-runtime.log).
