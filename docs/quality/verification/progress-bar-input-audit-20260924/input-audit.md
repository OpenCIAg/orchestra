# ProgressBar public-input audit — 2026-09-24

`ProgressBarComponent` declares **22 public inputs**. The audit found a documented type/runtime mismatch (`size="xl"` had no style), unbounded segmented DOM creation, out-of-range segmented ARIA values, duplicate marker track keys, unbounded marker positions, whitespace-only names, and incomplete marker-tone styling. These are repaired and covered in `progress-bar-behavior.spec.ts`; its original focused run passed **13/13** tests (10 ProgressBar and 3 ProgressCircle contracts). The expanded ProgressCircle review adds three cases, bringing the shared suite to **16/16** (10 ProgressBar and 6 ProgressCircle contracts).

| Input              | Observable behavior and evidence                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`            | Finite values clamp to 0–100 and non-finite values normalize to zero across width, formatted text, and ARIA.                                                                                                    |
| `mode`             | Determinate mode exposes a 0–100 range; indeterminate mode takes precedence over segments, removes range values, hides the value header, applies its state class, and keeps the supplied accessible value text. |
| `variant`          | `primary`, `neutral`, `success`, `warning`, and `error` map to semantic classes; `danger` preserves its error alias.                                                                                            |
| `size`             | `sm`, `md`, `lg`, and `xl` render 4px, 8px, 12px, and 16px tracks.                                                                                                                                              |
| `label`            | Trimmed nonblank text is rendered and supplies the fallback progress name; whitespace-only content is suppressed.                                                                                               |
| `showValue`        | Boolean attribute coercion controls the header and formatted value; zero remains visible.                                                                                                                       |
| `unit`             | Replaces the default percent suffix; a non-default `valueSuffix` takes precedence.                                                                                                                              |
| `color`            | Applies the legacy fill color when `customColor` is blank.                                                                                                                                                      |
| `styleClass`       | Trimmed consumer class is added while component classes remain.                                                                                                                                                 |
| `valueStyleClass`  | Trimmed consumer class is applied to the visible value.                                                                                                                                                         |
| `style`            | Applies inline styles to the host root.                                                                                                                                                                         |
| `valuePrefix`      | Prepends text to the rounded, normalized value.                                                                                                                                                                 |
| `valueSuffix`      | Overrides `unit` when explicitly changed from its percent default.                                                                                                                                              |
| `rounded`          | Boolean attribute coercion controls rounded track, fill, and segment ends.                                                                                                                                      |
| `segments`         | Finite positive values are floored; invalid values disable segment mode and rendered count is capped at 100.                                                                                                    |
| `currentSegment`   | Finite values are floored and clamped from zero through the normalized segment count; the ARIA range matches those bounds.                                                                                      |
| `customHeight`     | Nonnegative numbers become pixel values; strings are trimmed; invalid numeric values are ignored.                                                                                                               |
| `customColor`      | Trimmed custom fill color overrides `color`.                                                                                                                                                                    |
| `customTrackColor` | Trimmed custom color applies to the track and inactive segments.                                                                                                                                                |
| `markers`          | Non-finite positions are ignored, finite positions clamp to 0–100, labels trim, duplicate positions remain independently rendered, and `tone` applies a semantic marker color.                                  |
| `ariaLabel`        | Trimmed override wins; blank values use the trimmed visual label or `Progress`.                                                                                                                                 |
| `ariaValueText`    | Trimmed override wins; blank continuous values fall back to formatted text and blank indeterminate values remain absent.                                                                                        |

## Repair details

- `ProgressSize` already included `xl`, and the docs advertised it, but the bar had no class or CSS rule. `xl` now sets a 16px height and the API table documents it.
- Indeterminate mode and segmented mode previously rendered contradictory visual and ARIA states together. Indeterminate now takes precedence and exposes no determinate range.
- Segmented input could attempt an unbounded `Array.from()` and `aria-valuenow` could exceed `aria-valuemax`. Rendering is capped at 100 and the active-step count is now consistently zero-based and clamped.
- Marker values could be `NaN`, outside the bar, or duplicate. Invalid positions are ignored, positions clamp, loop identity uses the array index, and semantic tones now affect marker color.
- Whitespace-only labels, ARIA overrides, colors, custom classes, and custom heights now resolve to intentional values rather than blank names or invalid CSS.

No ProgressBar input was found to be a no-op. Broader theme contrast, forced RTL, assistive-technology announcements, and visual review on physical mobile remain part of the library-wide follow-up.
