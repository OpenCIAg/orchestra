# Utility directive contract batch

The batch repaired resource ownership and consumer-style handling in `RippleDirective`, `StyleClassDirective`, `AnimateOnScrollDirective`, `AutoFocusDirective`, and `UseStyleDirective`. In particular, Ripple no longer depends on undefined keyframes, honors reduced-motion preferences, and restores the host's original inline styles; UseStyle exposes the selector's intended `[orcUseStyle]` binding and restores prior styles rather than deleting consumer values.

The focused Chrome Headless suite covers ripple position/disabled/zero-size/destroy paths, trigger and panel-aware outside dismissal, style updates and cleanup, queued autofocus disabled state, observer one-shot and stale-callback behavior, and the missing-observer fallback.

- Command: `PATH=/Users/matheuscastro/.nvm/versions/node/v24.16.0/bin:$PATH ORC_KARMA_PORT=9884 node_modules/.bin/ng test orc-ds --watch=false --browsers=ChromeHeadless --include='projects/orc-ds/utility-directives-contract.spec.ts' --include='projects/orc-ds/runtime-diagnostics.spec.ts'`
- Result: **7 SUCCESS** (Chrome Headless 153)
- Raw output: [focused-runtime.log](focused-runtime.log)
- SSR and cross-browser visual coverage remain outside this focused batch.
