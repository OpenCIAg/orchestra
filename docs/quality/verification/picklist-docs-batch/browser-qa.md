# PickList live browser QA — 2026-09-22

The page displayed the accessible source/target panes and transfer controls at the normal desktop viewport. Clicking **Mover selecionado para selecionados** moved Calendar and updated the counters. With `Tree` in the source filter, **Mover todos para selecionados** moved Calendar and Tree View despite the filter, retained the disabled Experimental item in source, and updated the target in source order. Disabling interaction disabled both filters, option tab stops, and transfer controls.

The in-app viewport override requested 320px, but the app/browser host enforced an effective **477 CSS-pixel** viewport (`window.innerWidth`) and a 472px document client width. The page itself had no horizontal document overflow. The PickList's scroll shell measured 438px client width and 568px scroll width; horizontal scrolling revealed the target pane and the scroll was reset afterward. This confirms the documented overflow path at the effective constrained width, but it does **not** establish exact 320px behavior.

Keyboard reproduction on the live app's currently sealed package exposed a focus defect: after focusing Calendar and pressing ArrowDown, the roving tabindex changed to Data Table while `document.activeElement` remained Calendar. The implementation has since been changed to use `afterNextRender`; focused source tests pass 15/15, including consecutive ArrowDown/ArrowUp and skipping a disabled option. The corrected package has not yet been rebuilt and replayed in this browser.

The page rendered cleanly at desktop and constrained widths. No forced-RTL, reduced-motion, cross-browser, or exact-320px review was completed.
