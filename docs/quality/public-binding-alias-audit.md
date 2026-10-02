# Public binding alias audit

Status: the original 2026-09-13 sealed-package audit (SHA-256 snapshot evidence, the 19 same-event alias repair table, and the excluded-alias inventory) is archived in [public-binding-alias-audit-20260913.md](archive/public-binding-alias-audit-20260913.md). This file keeps the durable rule and the guard only.

## Alias-registration rule

A TypeScript property alias (for example `readonly alias = this.other`) is available to code using the component class, but **Angular does not register it as a host-template binding unless it is itself created with `input`, `output`, or `model`** (including an explicit alias option). A naming convention alone never implies an alias, and a class method that shares an output-like name (for example Rating's `onItemClick` handler) is not an output alias.

Consequences of the rule:

- Every compatibility name that consumers can bind in a template must be a real `input()`/`output()`/`model()` declaration with an explicit alias, re-exported identically through legacy, P2 barrel, and secondary entry points.
- The 19 same-event assignment aliases found by the 2026-09-13 audit were converted to explicit `output()` registrations, and PickList's `onMoveAllToTarget`/`onMoveAllToSource` became real all-transfer outputs distinct from the selected-only transfers; the per-component evidence table is in the archived audit.
- Assignment aliases that are internal conveniences only (ContextMenu `visible`, VirtualScroller `itemSize`) stay undocumented and must not be silently promoted to public API.

## Guard

The source scan for `readonly alias = this.other`-style assignments over supported public names stays in force as a guard against reintroducing unregistered aliases; internal ContextMenu/VirtualScroller exclusions remain unchanged. Unrelated gallery/menu public names remain candidates for a separate usage-backed audit, held through the compatibility window.
