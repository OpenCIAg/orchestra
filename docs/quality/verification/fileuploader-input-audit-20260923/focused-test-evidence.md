# Focused evidence

Command:

```sh
PATH=/Users/matheuscastro/.nvm/versions/node/v24.15.0/bin:$PATH \
  npx ng test orc-ds --watch=false --browsers=ChromeHeadless \
  --include=projects/orc-ds/file-uploader/file-uploader-behavior.spec.ts
```

Result: **23 tests passed, 0 failed** in Chrome Headless 153.0.0.0 on 2026-09-23. The first attempt with the shell default Node v24.2.0 exited before Angular compilation because the CLI requires v24.15.0 or newer; rerunning with the installed v24.15.0 runtime completed successfully.

Focused assertions added to `projects/orc-ds/file-uploader/file-uploader-behavior.spec.ts`:

- `applies the configured HTTP method, headers, credentials, and field name`
- `renders configured labels, icons, styles, preview sizing, and action visibility`
- `passes the localized file status labels to the child file item`
- `uses maxFiles, single-file mode, and the configured size/type messages`

These exercise request construction, both style binding shapes, file-item localization and accessible naming, action class/visibility bindings, single/multiple limits, and configured validation tokens through the browser DOM and `HttpTestingController`.
