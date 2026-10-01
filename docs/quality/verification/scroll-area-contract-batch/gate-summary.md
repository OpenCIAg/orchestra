# ScrollArea contract batch

The focused Chrome Headless suite passed **3/3** with runtime diagnostics. The run used Node 24.16.0, `NG_BUILD_MAX_WORKERS=2`, and Karma port 9897. Full output is in [focused-runtime.log](focused-runtime.log).

The component now computes vertical and horizontal overflow independently, updates four directional shadow states, performs initial and resize/mutation remeasurement, and ignores keyboard paging from projected controls. The viewport is a named region, and PageUp/PageDown honor orientation and reduced-motion preferences. Resize and mutation observers are disconnected during teardown.

The focused test verifies axis-specific shadows and updates, accessible naming, PageDown scrolling only when the viewport itself owns the event, and default labeling. Wider browser/visual review and explicit observer callback timing remain outside this focused gate.
