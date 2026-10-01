# Code and Overlay behavior batch

Date: 2026-09-22

The focused ChromeHeadlessCI run passed **6/6** contract tests and included `runtime-diagnostics.spec.ts`.

```sh
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH \
NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9886 \
npm run test:lib:ci -- \
  --include='projects/orc-ds/code-overlay-contract.spec.ts' \
  --include='projects/orc-ds/runtime-diagnostics.spec.ts'
```

The CodeComponent implementation remains in `projects/orc-ds/p2/p2-data-components.ts`; DataTable was subsequently moved to `p2-data-table-component.ts`, with the old data module preserving its re-export; the `projects/orc-ds/code/index.ts` package entry re-exports the P2 package. There is no local `projects/orc-ds/code/code.component.ts`, template, stylesheet, or component type file in this checkout.

Code now always presents a usable Copy button, preserves exact preformatted text, exposes the language as both readable metadata and `data-language`, announces successful and failed copy results through a polite live region, and emits success only when the Clipboard API write succeeds. Repeated attempts ignore stale completions; the temporary success state resets and its timer is canceled on destroy.

Overlay now emits `onShow` and `onHide` when its model changes externally as well as when callers use `show`, `hide`, or `toggle`. Repeated same-state calls do not emit duplicate events. Escape hides the overlay; projected content, the built-in class, consumer class, and inline style remain intact.

Overlay inputs `mode`, `contentStyle`, `contentStyleClass`, `target`, `appendTo`, `autoZIndex`, `baseZIndex`, `showTransitionOptions`, and `hideTransitionOptions` are compatibility-only no-ops in this shell and are marked deprecated in source. Use `OverlayPanelComponent` for positioning, portal attachment, and target-relative behavior. `style`, `styleClass`, and `visible` are functional.

Residual limits: CodeComponent displays plain preformatted text and does not tokenize or syntax-highlight code. Copy depends on the Clipboard API (typically available in secure browser contexts); unsupported or rejected writes are announced as failures without a fallback copy mechanism. Code labels are English defaults and should be localized through inputs. Overlay remains a basic absolutely positioned visibility shell with fixed z-index; it does not implement modal semantics, outside-click dismissal, target positioning, portal attachment, or transitions. Use the dedicated OverlayPanel, Popover, or Modal components when those behaviors are required.

Full runner output: [focused-runtime.log](focused-runtime.log).
