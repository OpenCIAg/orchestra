# ModalService docs-page browser QA — 2026-09-23

The rendered `/components/modal` page was opened from the local docs server in Chrome 153. This exercises the actual `ModalPageComponent` example, which opens `DemoDynamicModalComponent` through `ModalService` and assigns the `closeFn` callback.

## Keyboard replay

1. Activate **Abrir via ModalService**. The dynamic native dialog appears with accessible name **Modal via Serviço**, and focus moves to its **Close dialog** button.
2. Press Tab. Focus moves to **Entendi** inside the dialog.
3. Press Tab again. Focus wraps to **Close dialog**; it does not escape to the page.
4. Press Escape. The dialog closes and focus returns to **Abrir via ModalService**.

The browser console had no warning or error entries during the replay. The rendered interaction agrees with the direct ModalService contract in `modal.service.spec.ts` (14/14).

This is a single-Chrome keyboard check. Cross-browser focus behavior and real assistive-technology testing remain open.
