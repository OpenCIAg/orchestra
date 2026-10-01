# PickList public-input audit — 2026-09-24

The inventory records **31 public inputs** on `PickListComponent`: 25 signal inputs and six models. Every declared input is active and has a traced or tested behavior; no deprecated no-op was found. The component is implemented in `projects/orc-ds/p2/p2-pick-list-component.ts`, and the prior P2/secondary entry points preserve its class identity. The focused input suite passes **6/6**, the existing P2 behavior suite passes **124/124**, the dedicated docs page suite passes **3/3**, and the compact-layout Playwright scenario passes in Chromium, Firefox, and WebKit.

| Public input | Status and observable behavior | Focused evidence |
| --- | --- | --- |
| `source` | Active model. Controls source items; successful movement updates the source list and preserves disabled items. | Existing selected/all transfer and disabled-item contracts. |
| `target` | Active model. Controls target items; selected/all transfer appends in stable order, while drag/drop can insert before a target option. | Existing transfer and new drag/drop contracts. |
| `label` | Active. Names the component region; blank values use “Pick list”. | Accessible-name fallback contract. |
| `sourceHeader` | Active. Renders a trimmed source heading and names its listbox; blank text uses “Source list”. | Named pane and whitespace-contract coverage. |
| `targetHeader` | Active. Renders a trimmed target heading and names its listbox; blank text uses “Target list”. | Named pane and whitespace-contract coverage. |
| `emptyText` | Active. Renders a nonblank empty status in either filtered list; whitespace-only text is suppressed. | Independent filter/empty-state contract. |
| `style` | Active. Applies inline styles to the component root. | Rendered `width: 80%` assertion. |
| `styleClass` | Active. Adds caller classes while retaining library classes. | Rendered consumer-class assertion. |
| `responsive` | Active boolean input. Enables compact layout behavior and the `responsive` state class. | Media-query contract and mobile browser replay. |
| `filterBy` | Active. Searches one or more comma-separated option fields; defaults to `label`. | Multi-field string, array-valued, and numeric filter cases. |
| `filterLocale` | Active. Applies locale-aware case normalization; invalid locales fall back safely. | Invalid-locale safety and filter case coverage. |
| `filterMatchMode` | Active. Supports `contains`, `startsWith`, `endsWith`, `equals`, `notEquals`, `in`, `lt`, `lte`, `gt`, and `gte`; unknown values fall back to `contains`. | Focused prefix/equality/suffix, array-membership, and numeric-boundary cases. |
| `sourceFilter` | Active model. Controls the source filter input and filters only source options. | Independent two-pane filter contract. |
| `targetFilter` | Active model. Controls the target filter input and filters only target options. | Independent two-pane filter contract. |
| `sourceFilterPlaceholder` | Active. Trims and renders the source filter placeholder. | Rendered placeholder assertion. |
| `targetFilterPlaceholder` | Active. Trims and renders the target filter placeholder. | Rendered placeholder assertion. |
| `ariaSourceFilterLabel` | Active. Trims the source filter name and falls back to “Filter source list”. | Whitespace fallback contract. |
| `ariaTargetFilterLabel` | Active. Trims the target filter name and falls back to “Filter target list”. | Custom target-filter name assertion. |
| `moveToTargetLabel` | Active. Names the selected-to-target action; blank values use its default name. | Docs page activation and rendered action contract. |
| `moveToSourceLabel` | Active. Names the selected-to-source action; blank values use its default name. | Docs page transfer contract. |
| `moveAllToTargetLabel` | Active. Names the all-enabled-items-to-target action. | Docs page all-transfer contract. |
| `moveAllToSourceLabel` | Active. Names the all-enabled-items-to-source action. | Existing transfer behavior and rendered action contract. |
| `sourceStyle` | Active. Applies inline styles to the source pane. | Rendered source-pane height assertion. |
| `targetStyle` | Active. Applies inline styles to the target pane. | Rendered target-pane height assertion. |
| `dragdrop` | Active boolean input. Enables native drag between panes and reordering within each pane; disabled items and a disabled widget cannot start a drag. Transfers emit the established move, aggregate transfer, and selection events. | Simulated cross-pane transfer, same-pane reorder, and disabled guards. |
| `metaKeySelection` | Active boolean input. When enabled, an unmodified activation selects one option and Ctrl/Meta toggles additional values; when disabled, each activation toggles without a modifier. | Selection and output-cardinality contract. |
| `stripedRows` | Active boolean input. Adds alternating row styling without overriding selected-state appearance. | Rendered striped state contract. |
| `breakpoint` | Active. Supplies the `max-width` value used by the responsive media query; changing it updates compact state and its listener is removed on destruction. | Large/small breakpoint transition and mobile browser replay. |
| `disabled` | Active boolean input. Disables filters, selection, transfers, drag, and option tab stops while preserving controlled data. | Existing docs and direct disabled contracts. |
| `sourceSelected` | Active selection model. Tracks/prunes enabled source selection and changes as options are selected or transferred. | Direct source-selection set and transfer regressions. |
| `targetSelected` | Active selection model. Tracks/prunes enabled target selection and changes as options are selected or transferred. | Existing target selection and transfer contracts. |

## Repairs found during the audit

- `filterMatchMode`, `responsive`, `breakpoint`, `dragdrop`, `metaKeySelection`, and `stripedRows` were declared but had no effect. They now control field filtering, responsive layout, native drag transfer/reorder, modifier-key selection, and striping.
- The docs claimed a narrow layout but enforced a 34rem minimum width and only offered horizontal scrolling. The example now opts into the component's breakpoint layout: list panes stack, transfer buttons share a compact row, and their arrows point in the movement direction. Exact 320px viewport checks pass in all three Playwright engines.
- Locale filtering now falls back safely for invalid tags; multi-field and array-value filtering are supported. Accessible labels, placeholders, headings, and empty messages trim whitespace and use useful fallbacks.

All 31 inputs have active behavior; no full component removal or no-op compatibility decision is indicated. Keyboard-only drag/drop is not offered; the transfer actions remain the keyboard-accessible equivalent. Additional forced-RTL, assistive-technology, and broader responsive/theme combinations remain open.
