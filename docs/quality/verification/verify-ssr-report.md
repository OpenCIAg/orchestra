# SSR verification

Generated 2026-10-01T16:45:10.790Z against dist/orc-ds (sealed; no build performed by this verifier). Package archive SHA-256: `16e78cbda5e14f06c7009bf77025ec6f00dad444f39a5762ecfa510f4cb62b83`.

The harness attempted all 147 component declarations from [inventory.json](../inventory.json), importing each from the packed consumer and rendering it through Angular 22.1.2's `renderApplication`. It imported 147, instantiated 147, matched 147 canonical selectors, completed default lifecycle teardown for 147, and completed rendering for 147; 0 failed.

The runner isolates every component in a fresh Node process. Each worker uses Angular ViewChild against the imported component type and checks the canonical selector before renderApplication returns, so the marker cannot be produced by a static wrapper alone. This preserves a real server-render lifecycle and records teardown exceptions separately from import/render failures. Production mode suppresses framework startup noise; component warnings and errors remain in the JSON result.

## Failures

None.



Lifecycle exceptions: 0. Worker timeouts: 0. Diagnostics: 0. Full per-component evidence is in [verify-ssr-result.json](verify-ssr-result.json).

Interactive/open-state coverage: 0. Fixture values are explicitly enumerated as ariaLabel, item, fileData, toast; any new required input fails with phase `fixture` instead of being bound to `undefined`. The inventory-driven pass excludes non-component declarations and does not claim browser interaction, hydration, or application-specific provider coverage. Check the sealed distribution timestamp against the source revision before treating this as current.
