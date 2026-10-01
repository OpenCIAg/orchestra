# ProgressCircle public-input audit — 2026-09-24

`ProgressCircleComponent` declares **19 public inputs**, no outputs, and no CVA contract. The review found that nonanimated indeterminate mode looked complete, the `fill` input was overridden by component CSS, rotation ignored `animationDuration`, numeric size attributes were treated as unknown presets, and whitespace-only accessible overrides remained blank. The fixes are covered by the focused ProgressBar/ProgressCircle suite, which now passes **16/16** cases ([focused log](focused-tests.log)).

| Input               | Observable behavior and evidence                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`             | Finite values clamp to 0–100; non-finite values normalize to zero for arc geometry, text, and ARIA.                                                                                        |
| `mode`              | Determinate mode exposes a 0–100 range. Indeterminate mode removes determinate range attributes and uses either an animated arc or a static partial arc.                                   |
| `variant`           | `primary`, `neutral`, `success`, `warning`, and `error` map to semantic classes; `danger` preserves the error alias. `customColor` overrides the fill stroke.                              |
| `size`              | `sm`, `md`, `lg`, and `xl` map to 32/48/64/96px. Positive numeric property bindings and numeric string attributes render as pixel diameters; invalid/nonpositive values fall back to 48px. |
| `strokeWidth`       | Positive finite numbers and numeric strings set the SVG stroke width, bounded below the circle diameter; invalid values use a size-dependent default.                                      |
| `animation`         | `spin` animates only indeterminate mode; `none` leaves a visible 25% static arc instead of a full ring.                                                                                    |
| `animationDuration` | Applies the same CSS duration to the indeterminate SVG rotation and fill-arc animation.                                                                                                    |
| `showValue`         | Boolean attributes are coerced; determinate values display rounded, normalized text while indeterminate mode does not announce a fake value.                                               |
| `styleClass`        | Trimmed consumer class is composed with the component and state classes.                                                                                                                   |
| `style`             | Inline styles apply to the host container.                                                                                                                                                 |
| `fill`              | CSS fill value applies to the interior of the progress circle; the default remains `none`.                                                                                                 |
| `rounded`           | Boolean attributes control the fill stroke line cap; the default is rounded.                                                                                                               |
| `valuePrefix`       | Prepends text to the rounded, normalized center value.                                                                                                                                     |
| `valueSuffix`       | Appends text to the rounded, normalized center value; the default is `%`.                                                                                                                  |
| `label`             | Trimmed nonblank text supplies the fallback accessible name.                                                                                                                               |
| `customColor`       | Trimmed custom stroke color overrides the selected semantic variant.                                                                                                                       |
| `customTrackColor`  | Trimmed custom color overrides the circle's track stroke.                                                                                                                                  |
| `ariaLabel`         | Trimmed nonblank override wins; whitespace or an empty value falls back to `label`, then `Progress`.                                                                                       |
| `ariaValueText`     | Trimmed override wins; otherwise determinate mode exposes formatted value text and indeterminate mode omits it.                                                                            |

The direct suite covers geometry normalization, default and custom accessible text, all special runtime modes, numeric size attributes, styling inputs, value formatting, semantic aliasing, and reduced-motion CSS. Broader theme contrast and physical assistive-technology review remain open.
