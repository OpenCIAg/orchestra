# Paginator focused behavior test evidence

Command (from repository root):

```sh
PATH=/Users/matheuscastro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH \
  npx ng test orc-ds --watch=false --browsers=ChromeHeadless \
  --ts-config docs/quality/verification/paginator-input-audit-20260923/tsconfig.spec.json \
  --include='projects/orc-ds/paginator/paginator-behavior.spec.ts'
```

Result on 2026-09-23: Angular bundle generation completed and Chrome Headless executed **17/17 paginator behavior specs successfully**. This focused tsconfig scopes TypeScript's spec inputs to the paginator behavior spec so unrelated transient spec compilation errors in other components do not block this component-level run.

The added assertion in `paginator-behavior.spec.ts` covers `totalRecords` precedence, `pageLinkSize`, `rowsPerPageOptions` precedence and `pageSizeOptions` fallback, current page retention in the selector, report rendering via `showCurrentPageReport`, `showFirstLastIcon`, previous/next visibility, page-link visibility, page-size selector hiding, and root style/class/size inputs.
