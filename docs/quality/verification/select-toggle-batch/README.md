# SelectButton and ToggleButton focused contract batch

Date: 2026-09-22

## Scope

This batch audited and repaired only `projects/orc-ds/p2/p2-form-gap-components.ts` for `SelectButtonComponent` and `ToggleButtonComponent`. The dedicated contract coverage is in `projects/orc-ds/select-toggle-contract.spec.ts`.

The audit checked the public inputs, outputs, native button semantics, disabled behavior, single and multiple selection, clear/unselectable policy, ControlValueAccessor registration, and composite blur behavior for Reactive Forms controls using `updateOn: 'blur'`.

## Reproduced defects and fixes

- Both controls called the CVA touched callback from their click/toggle path. This caused `updateOn: 'blur'` controls to commit on click. SelectButton now marks the composite touched only when focus leaves its group; ToggleButton marks touched from its native button blur.
- SelectButton emitted value and change outputs when a click was a no-op (`allowEmpty=false`, or a selected multiple option with `unselectable=true`/`allowEmpty=false`). No-op paths now keep state, CVA, `valueChangeEvent`, and `onChange` silent while preserving `onOptionClick` for the enabled user click.
- SelectButton's `size` input had no observable effect. Small and large classes/styles are now applied.
- ToggleButton's `size` and `fluid` inputs had no observable effect. Small, large, and fluid classes/styles are now applied.

Disabled controls and disabled options remain non-interactive and do not emit outputs. Native controls retain `type="button"`, pressed state is exposed through `aria-pressed`, `onOptionClick` reports enabled user clicks including no-op clicks, and value-bearing outputs emit once per real state transition.

### Multiple-selection matrix

The SelectButton API defines `multiple` as an array-valued selection, `allowEmpty` as the policy that prevents an empty selection, and `unselectable` as the separate policy that prevents clearing a selected option. In multiple mode:

- `allowEmpty=true`: selected options can be removed, including the final option.
- `allowEmpty=false`: a selected option can be removed while another option remains; removing the final option is blocked.
- `unselectable=true`: selected options cannot be removed, regardless of the number selected.

This matches the documented API at https://v19.primeng.org/selectbutton and the upstream multiple-selection behavior.

## Verification

Command (Node v24.16.0, Angular CLI, `NG_BUILD_MAX_WORKERS=2`, Karma port 9878):

```text
NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9878 node ./node_modules/@angular/cli/bin/ng.js test orc-ds --watch=false --browsers=ChromeHeadlessCI --include=projects/orc-ds/select-toggle-contract.spec.ts --include=projects/orc-ds/runtime-diagnostics.spec.ts
```

Result: **6 specs, 6 successful**. The runtime diagnostics include is a diagnostics module with no Jasmine specs; the six executed specs are the dedicated contract suite. Full output is retained in `combined.log`; the dedicated-only run is retained in `dedicated.log`.

The dedicated suite covers:

1. SelectButton native semantics and single-selection output cardinality.
2. SelectButton multiple selection, clearing, `unselectable`, and disabled-option behavior.
3. SelectButton `updateOn: 'blur'` commit only after focus leaves the composite.
4. ToggleButton native semantics, pressed state, sizing/fluid classes, disabled state, `allowEmpty`, and output cardinality.
5. ToggleButton `updateOn: 'blur'` commit only after the native button blurs.
6. SelectButton multiple mode preserving a non-empty array when `allowEmpty=false`, while blocking removal of its final value.

## Bounded limitations

This batch does not change InputMask, Radio, OrderList, PickList, Modal, public aliases, or shared quality ledgers. Keyboard navigation beyond native button focus order and visual pixel-level styling remain outside this focused contract suite.
