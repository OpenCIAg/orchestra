# Button input audit — 2026-09-24

The refreshed inventory records **31 public inputs** on `ButtonComponent`; each
source name is also its Angular public binding name. The component is implemented
in `projects/orc-ds/button/button.component.ts`, with native-button bindings in
`button.component.html` and visual states in `button.component.scss`. The
focused contract is `projects/orc-ds/button/button-input-contract.spec.ts`,
alongside the existing `button-behavior.spec.ts` and
`button.component.spec.ts`.

## Input status matrix

| Public input     | Observable contract and status                                                                                                                         | Focused evidence                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `variant`        | Selects the `orc-button--variant-*` style; default is `primary`.                                                                                       | Input contract checks `secondary` and severity/link precedence.                                                         |
| `severity`       | Overrides `variant` when provided.                                                                                                                     | Input contract checks `danger` after removing the `link` override.                                                      |
| `size`           | Selects `sm`, `md`, or `lg` size and icon geometry.                                                                                                    | Input contract checks the `lg` class; behavior spec checks square icon-only dimensions at all sizes.                    |
| `disabled`       | Sets native `disabled` and `aria-disabled`; activation is blocked.                                                                                     | Component spec checks disabled state and click guard; behavior spec checks native activation while loading.             |
| `loading`        | Sets native disabled state and `aria-busy`, shows the spinner, and preserves button dimensions.                                                        | Behavior spec checks busy state, dimensions, and blocked activation; input contract checks loading-icon rendering.      |
| `fullWidth`      | Adds the full-width class; stylesheet sets the button and host to full width.                                                                          | Input contract checks its class.                                                                                        |
| `text`           | Adds the text-variant class.                                                                                                                           | Input contract checks the class.                                                                                        |
| `outlined`       | Adds the outlined class.                                                                                                                               | Input contract checks the class.                                                                                        |
| `raised`         | Adds the raised class and shadow.                                                                                                                      | Input contract checks the class.                                                                                        |
| `rounded`        | Adds the fully rounded class.                                                                                                                          | Input contract checks the class.                                                                                        |
| `plain`          | Adds the plain foreground class.                                                                                                                       | Input contract checks the class.                                                                                        |
| `fluid`          | Adds the fluid and full-width classes; stylesheet sets 100% width.                                                                                     | Input contract checks both classes.                                                                                     |
| `link`           | Forces the link variant class over `severity` and `variant`.                                                                                           | Input contract checks precedence and fallback to `severity`.                                                            |
| `icon`           | Renders a class-based icon or sanitized SVG.                                                                                                           | Input contract checks generic right positioning; behavior spec checks SVG sanitization and geometry.                    |
| `iconPos`        | Positions the generic `icon` left/right/top/bottom. Side-specific inputs retain their explicit sides.                                                  | Input contract checks the right class; behavior spec checks top layout.                                                 |
| `loadingIcon`    | **Repaired:** a class string or sanitized SVG replaces the default spinner; omission retains the default spinner.                                      | Input contract checks class and SVG forms, sanitization, and the default.                                               |
| `id`             | Sets the native button id.                                                                                                                             | Input contract checks the rendered id.                                                                                  |
| `tabindex`       | Sets the native tab index.                                                                                                                             | Input contract checks the rendered attribute.                                                                           |
| `ariaLabelledBy` | Sets `aria-labelledby` on the native button.                                                                                                           | Input contract checks the rendered attribute.                                                                           |
| `ariaExpanded`   | Sets the native `aria-expanded` value.                                                                                                                 | Input contract checks `true` serialization.                                                                             |
| `ariaControls`   | Sets the native `aria-controls` value.                                                                                                                 | Input contract checks the rendered attribute.                                                                           |
| `form`           | Associates the button with the named external form.                                                                                                    | Input contract checks the native `form` attribute.                                                                      |
| `styleClass`     | Adds consumer classes to the native button.                                                                                                            | Input contract checks class composition.                                                                                |
| `style`          | Applies the supplied inline style map to the native button.                                                                                            | Input contract checks a custom property.                                                                                |
| `badge`          | Renders the supplied string or number in a compact, high-contrast pill.                                                                                | Input contract checks numeric content and computed minimum width/radius.                                                |
| `badgeClass`     | Adds consumer classes to the styled badge pill.                                                                                                        | Input contract checks class composition.                                                                                |
| `iconLeft`       | Renders a class-based icon or sanitized SVG in the left slot, taking precedence over generic `icon`.                                                   | Input contract checks its class-based form.                                                                             |
| `iconRight`      | Renders a class-based icon or sanitized SVG in the right slot, taking precedence over generic `icon`.                                                  | Input contract checks its class-based form.                                                                             |
| `iconOnly`       | Keeps square geometry and hides projected text while retaining the supplied accessible name. **Repaired:** projected text previously remained visible. | Behavior spec checks hidden projected text and `aria-label`; existing geometry assertion checks each size.              |
| `type`           | Sets native button `type`, defaulting to `button`.                                                                                                     | Input contract checks `submit`; component host spec checks native click behavior.                                       |
| `ariaLabel`      | Sets the native button's `aria-label`.                                                                                                                 | Input contract checks the rendered attribute; icon-only behavior spec checks the accessible-name input remains present. |

No input is currently deprecated or a declaration-only no-op after the
`loadingIcon` repair. The badge span now has a default compact pill treatment,
while `badgeClass` remains the consumer styling hook.

## Outputs and event behavior

`click` is exposed under the public alias `(clicked)` so the native bubbling
`(click)` event is not delivered twice. `onFocus` and `onBlur` forward their
native `FocusEvent`s. The focused input contract asserts one click emission and
identity-preserving focus/blur forwarding; the existing host integration test
continues to cover native `(click)` activation. The Button API table now
documents all 31 inputs, exposes the component output as `clicked`, lists
`onFocus`/`onBlur`, and distinguishes the native DOM `(click)` event. IconButton's
docs use the same `clicked` alias.

## Verification and remaining limits

The audit adds five input/output contract cases and a separate projected-text
regression. The focused contract passes **5/5** in Chrome Headless 153 on Node
24.16. The production library build, cross-engine, forced-colors, and
assistive-technology review remain open for the integrated gate.
