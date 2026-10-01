# Confirmation concurrency policy

This focused batch establishes latest-request ownership for the two singleton confirmation services.

## Reproduced behavior

Before the repair, overlapping `confirm()` calls silently replaced the active request. The first request's `reject` callback was never invoked, and destroying either host left its service request signal populated. The focused reproduction was `confirmation-concurrency.spec.ts`; it failed 3/3 cases for those callback and teardown expectations.

## Supported policy

- `ConfirmationService` and `ConfirmPopupService` each expose one visible request.
- A newer request replaces the visible request and invokes the superseded request's `reject` callback exactly once.
- Destroying the dialog or popup host clears its active service request without invoking a callback.

## Validation

The final focused command ran `confirmation-concurrency.spec.ts`, `confirm-dialog-contract.spec.ts`, `confirm-popup-behavior.spec.ts`, and `p2-repair.spec.ts` under Node 24.16.0 with `NG_BUILD_MAX_WORKERS=2`; **34/34 passed** (exit 0). Full output: [focused-tests.log](focused-tests.log).

`git diff --check` passed (exit 0).
