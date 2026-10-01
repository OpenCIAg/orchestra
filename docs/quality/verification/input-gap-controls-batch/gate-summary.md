# P2 input-gap controls batch

## Scope

Reviewed `InputGroupComponent` in `p2/p2-form-components.ts` and `InputGroupAddonComponent`, `IconFieldComponent`, and `IftaLabelComponent` in `p2/p2-input-gap-components.ts`.

## Changes

- `InputGroupComponent` now exposes `role="group"` only when `label` has a non-whitespace accessible name, and trims that name before setting `aria-label`. This avoids adding an unnamed group to the accessibility tree.
- `IconFieldComponent` now uses a block wrapper that can safely contain native controls, uses logical inline-start positioning/padding for RTL layouts, and marks the decorative icon as non-interactive.
- `IftaLabelComponent` now uses a block wrapper and styles projected direct-child labels through Angular's projection boundary. Its label offset uses logical inline-start so the label placement follows RTL direction.
- `InputGroupAddonComponent` has no declared inputs or outputs and remains a projection-only text/addon wrapper; no source change was needed.
- Added four browser DOM contracts for group naming/slot state/control sizing, addon projection/height, icon projection/decoration/RTL placement, and ifta label association/projected-label layout.

## Verification

Focused command:

```sh
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9899 npm run test:lib:ci -- --include=projects/orc-ds/p2-input-gap-controls-contract.spec.ts --include=projects/orc-ds/runtime-diagnostics.spec.ts
```

Result: Chrome Headless completed all 4 focused specs successfully. The runtime diagnostics hook ran with the suite and observed no console errors or warnings, including fixture teardown. `git diff --check` passed for the two source modules and added spec.

Full output: [`focused-tests.log`](./focused-tests.log).

## Remaining API boundaries

No no-op inputs were found in these four classes. `InputGroupComponent`'s `label`, `prefix`, and `suffix` are all consumed. `IconFieldComponent.icon` is rendered as decorative content. The addon and ifta wrappers intentionally expose no component inputs. `IconFieldComponent` leaves naming the actual input to its caller; `IftaLabelComponent` requires callers to provide a correctly associated `<label for>` and control `id`.
