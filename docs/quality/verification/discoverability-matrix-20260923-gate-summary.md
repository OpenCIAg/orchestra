# Discoverability matrix evidence

Updated: 2026-09-24

The source inventory contains 147 component declarations. Route and rendered-template evidence establishes discoverability/page presence; it does not establish component interaction behavior unless the focused spec is named. The active catalog contains 100 entries; 99 use an explicit or dynamic component route, while Stepper deep-links to the Progress page. The generated matrix contains 147 rows with 96 dedicated docs route/page, 23 meaningful parent/structural examples, and 28 gaps. Chart now has a rendered preview, eight type examples, and focused docs/API tests; TieredMenu, PanelMenu, MegaMenu, and CommandMenu each retain a rendered preview and a named focused docs interaction spec.

Evidence sources checked:

- `docs/quality/component-inventory.md`
- `projects/docs/src/app/services/component-catalog.service.ts`
- `projects/docs/src/app/app.routes.ts`
- `projects/docs/src/app/pages/components/**/*.html`
- `projects/docs/src/app/pages/components/component-doc/component-doc-page.component.html`
- `projects/docs/src/app/app-routing.spec.ts`

Validation: matrix row/count checker **PASS** (147 rows; 95/23/29 classification totals); focused menu-family docs suite **18/18 SUCCESS** with `npx ng test docs --watch=false --browsers=ChromeHeadless --include='**/component-doc-page.component.spec.ts'`; focused docs route regression **33/33 SUCCESS** with `npx ng test docs --watch=false --browsers=ChromeHeadless --include='**/app-routing.spec.ts'`.
