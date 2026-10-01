# Live docs browser QA — 2026-09-23

Manual interaction review against the docs app at `http://localhost:4301` after the post-render Menu/TieredMenu initial-focus fix and the PanelMenu icon-gap repair. The two focused regression batches passed **30/30**.

- **Menu/TieredMenu:** opening Menu places focus on the first enabled item. Activating a disclosure focuses its first enabled child. Escape closes the child submenu and returns focus to its parent. Clicking an outside button closes the menu while retaining focus on that outside button.
- **Date Picker:** opening DateTime and clicking outside closes the popup; document Escape also closes it. The date-time popup exposes hour, minute, and second controls in the accessibility tree. The date-only and date-time examples render with their selection and outside-dismissal behavior.
- **Modal / Dialog:** standard native Modal Escape closes the dialog and restores focus to the opener. A dismissible backdrop closes the dialog; a non-dismissible modal ignores backdrop clicks. The dialog opens in the native top layer with its configured initial focus.
- **Button:** the live preview's icon-label spacing measures 8px; the icon-only control remains square and centered.
- **Docs runtime:** after the final package rebuild and reload, the docs route rendered without the transient stylesheet/package-resolution overlay seen during concurrent rebuild activity. The docs server was stopped for the freeze-6 gate and left stopped.

The embedded browser requested a 320px viewport, but route checks measured `window.innerWidth === 444`; after reset it measured 355px. Exact 320px validation remains open. This is a focused desktop smoke review, not a cross-browser or narrow-viewport certification. Mobile touch behavior, forced RTL, reduced motion, cross-browser behavior, hydration, and assistive-technology testing remain open.
