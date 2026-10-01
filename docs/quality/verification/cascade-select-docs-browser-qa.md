# CascadeSelect docs browser QA

Date: 2026-09-23

Route: `/components/cascade-select`, served locally with `ng serve docs --port 4310 --configuration development`.

The in-app browser showed the CascadeSelect catalog route with its beta status, package path, interactive preview, controlled value, live-state panel, keyboard instructions, state descriptions, public API table, and usage snippet. Opening the trigger exposed the level-one `Destino` list. Selecting `Platform` exposed the level-two options, and selecting `Web` closed the panel and updated both the preview and live-state value to `web`. The route had no horizontal page overflow at the browser's effective 1910×1075 viewport.

A requested 320×800 viewport override did not reach the page: the browser reported an effective 477×1194 viewport. At 477px, the preview and live-state panel stack vertically with no horizontal page overflow. Exact 320px behavior remains unverified.

This is a desktop Chromium smoke review of route discoverability, hierarchy interaction, controlled selection, and rendered layout. It does not cover mobile viewport sizes, other browsers, assistive technology, or visual comparison across the rest of the catalog.
