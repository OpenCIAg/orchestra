# ConfirmDialog policy batch

Date: 2026-09-23

Focused runtime command:

```text
PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH NG_BUILD_MAX_WORKERS=2 ORC_KARMA_PORT=9881 npm run test:lib:ci -- --include='projects/orc-ds/confirm-dialog-contract.spec.ts' --include='projects/orc-ds/runtime-diagnostics.spec.ts'
```

Runtime: Node v24.16.0, ChromeHeadless 153.0.0.0.

Result: **5 SUCCESS, 0 FAILED**. Existing confirmation repair coverage was rerun with the new suite: **20 SUCCESS, 0 FAILED**.

Coverage:

- `blockScroll` acquires the shared document-scoped lock and restores the prior inline overflow value and priority;
- `blockScroll=false` leaves document scrolling unchanged;
- nested lock ownership keeps scrolling locked until the final owner releases;
- `rtl` sets `dir="rtl"` on the alertdialog;
- Tab and Shift+Tab wrap among enabled alertdialog actions through `FocusTrapDirective`;
- destroying an open dialog releases its lock.

Existing default-focus, Escape, callback, accessible naming, and opener restoration checks remain green. The focused runs completed without Angular runtime warnings or errors.

Packaging regression follow-up:

- ConfirmDialog now imports `lockDocumentScroll` through `@ciag/orchestra/internal`, the existing secondary entry, so ng-packagr does not pull `projects/orc-ds/internal/*` under the P2 entry's `rootDir`.
- Production library build: **passed** ([build-lib.log](build-lib.log)).
- Focused dialog/modal/drawer/overlay integration with runtime diagnostics: **95 SUCCESS, 0 FAILED** ([focused-integration.log](focused-integration.log)).
- Current and minimum packed consumers: **passed** ([package-current.log](package-current.log), [package-minimum.log](package-minimum.log)).
- Default-lifecycle SSR inventory: **passed** ([ssr.log](ssr.log)).
- Targeted diff check: **passed** ([diff-check.log](diff-check.log)).
