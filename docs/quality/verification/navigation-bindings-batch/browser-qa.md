# Navigation browser review

Reviewed 2026-09-22 against the freshly built local docs app, using `dist/orc-ds` from the sealed gate and a desktop in-app browser.

- Tabs page: focused the selected “Visão Geral” tab and sent a physical ArrowRight key. Focus moved to “Configurações” while selection remained on the original panel, consistent with manual activation. Enter selected “Configurações” and replaced the associated panel. The visible 44px playground variant and icon/label spacing rendered cleanly at the desktop viewport.
- Progress page Stepper: focused “Step 1”, sent ArrowRight, and observed focus move to “Step 2”. Enter activated it; the rendered horizontal Stepper showed Step 2 active while Step 1 was completed.
- Theme observed: dark. No responsive 320px, forced RTL, reduced-motion, or cross-browser visual review was performed in this browser pass.
- The docs app has no PickList page/example yet; the focused consumer DOM tests and library/runtime gate cover PickList keyboard and focus behavior. See [next contract milestones](../../next-contract-milestones.md) for the docs repair.

This is a browser spot check of these two live demos, not a substitute for the broader component or responsive audit.
