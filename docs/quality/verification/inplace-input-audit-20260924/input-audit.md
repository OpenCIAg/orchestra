# Inplace public-input audit — 2026-09-24

`InplaceComponent` has **7 public inputs** and four transition outputs. All inputs have active behavior; no deprecated no-op was found. The direct behavior suite passes **11/11** and the existing P2 expansion suite passes **124/124**. The component has moved from the shared input-gap file to `projects/orc-ds/p2/p2-inplace-component.ts`; its old module and the P2 barrel re-export the same class.

| Input | Observable behavior and evidence |
| --- | --- |
| `active` | Two-way model controls display/edit state; programmatic changes emit one transition output, user actions emit the original event outputs, and initial active state is not reported as a transition. |
| `closable` | Boolean-coerced. When false, omits Close while Escape still exits. If the focused close button is removed at runtime, focus moves into the remaining edit surface. |
| `disabled` | Boolean-coerced. Disables display/close actions and activation/deactivation; if a focused close button becomes disabled, focus moves into the edit surface. |
| `preventClick` | Boolean-coerced. Keeps the trigger focusable with `aria-disabled="true"` and suppresses pointer/keyboard activation. |
| `label` | Trimmed. Names the edit group and trigger when present; a blank value leaves projected display text to name the trigger and supplies a useful edit-group name. With no projected display, the trigger shows `Edit`. |
| `closeLabel` | Trimmed; blank values fall back to `Close`. |
| `styleClass` | Trimmed consumer class is preserved across display and edit states. |

## Repairs found during the audit

- Whitespace-only labels, close names, and style classes could create blank accessible names or malformed class attributes. They now resolve consistently.
- Turning `closable` off or `disabled` on while the Close button held focus removed/disabled the focused element and left focus on the document body. Focus now moves to the first available edit control or the edit group; Escape then restores focus to the trigger.
- Inplace's transition, projection, focus, and key handling were embedded alongside three unrelated input-family components. It now has a dedicated module, with an explicit legacy re-export and an identity regression.

The focused suite also covers pointer transitions, Enter/Space activation, repeated-call cardinality, Escape and IME composition, externally controlled state, disabled/prevent-click behavior, projected display/edit content, and focus restoration. Cross-browser focus replay, screen-reader review, and discoverable standalone documentation remain library-wide follow-ups.
