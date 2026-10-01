# P2 layout primitives contract batch

The focused DOM/browser contract suite passed **10/10** in Chrome Headless with the runtime-diagnostics harness included. The run used Node 24.16.0, `NG_BUILD_MAX_WORKERS=2`, and Karma port 9882 (Karma selected 9883 after the configured port was occupied). Full output is retained in [focused-tests.log](focused-tests.log).

Coverage exercises ButtonGroup's vertical attached-control radii, Grid's named-group semantics and narrow-width column fallback, AspectRatio and Container style inputs, Flex/Stack/Space layout inputs, Box spacing and surface inputs, Separator accessibility metadata, VisuallyHidden clipping, and Text truncation/size states.

Source corrections in this batch make attached ButtonGroups use top/bottom end caps when vertical, make Grid only expose `aria-label` with a group role, coerce static numeric `columns` values, fall back from invalid/fractional counts, and keep auto-fit tracks from overflowing narrower-than-minimum containers. These checks do not replace responsive visual review across engines or test all combinations of caller-provided CSS sizing values.
