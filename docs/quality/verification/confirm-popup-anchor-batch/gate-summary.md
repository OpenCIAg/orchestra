# ConfirmPopup anchor and viewport placement

Date: 2026-09-23

`PopupConfirmation` now supports optional same-document `HTMLElement` and `ElementRef<HTMLElement>` anchors. Without an explicit anchor it uses the focused opener when available and centers otherwise. Explicit `x`/`y` remain absolute viewport overrides. The fixed popup now sizes to its content, flips above a low trigger when needed, clamps within viewport margins, and updates on scroll, resize, and popup-size changes; listeners and the ResizeObserver are removed when the request closes or the component is destroyed.

| Check                                                                                                    | Result                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NG_BUILD_MAX_WORKERS=2 npm run test:lib:ci -- --include=projects/orc-ds/confirm-popup-behavior.spec.ts` | **9/9** passed ([focused tests](focused-tests.log))                                                                                                                                |
| `NG_BUILD_MAX_WORKERS=2 npm run test:lib:ci -- --include=projects/orc-ds/p2-repair.spec.ts`              | **16/16** passed, including default actions, accessible naming, Escape, focus restoration, and exact zero-coordinate preservation ([compatibility tests](compatibility-tests.log)) |

The service still has one request signal: a new confirmation replaces the current request. Whether requests should queue or reject replacement is an application policy question and remains open.
