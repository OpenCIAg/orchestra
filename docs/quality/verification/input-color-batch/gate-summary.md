# InputColor batch

SOURCE READY. `InputColorComponent` now provides a forms-compatible control,
coerces its public disabled input, keeps the legacy `ariaLabel` input, and
gives its native color and text fields distinct accessible names. User input
accepts trimmed hexadecimal `#RGB` and `#RRGGBB` values, normalizing to
lowercase six-digit hex; invalid values are ignored and leave the last valid
value intact.

Focused component and runtime diagnostics: **4 SUCCESS**.

External CVA writes that are null or invalid use the canonical fallback
`#3b82f6` in both native inputs. Focus is treated as one composite control, so
moving from the color input to the text input does not mark the form touched.

```text
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9880 npm run test:lib:ci -- --include='projects/orc-ds/p2-input-color-contract.spec.ts' --include='projects/orc-ds/runtime-diagnostics.spec.ts'
```

Evidence: `focused-tests.log` in this directory.

Intentionally unsupported formats are CSS named colors, `rgb()`/`hsl()`
strings, and alpha-bearing hex values; the native color input and the public
text contract remain six-digit opaque hex values after normalization.
