# Image browser QA

Run date: 2026-09-13. This note records browser observations against the sealed `dist/orc-ds` package, archive SHA-256 `a9782e8341b1c9f1650a252d387e6d5b96ff0c61c5a3ba04a9b9035b77dbc910`.

The documentation route `http://localhost:4200/components/image` was inspected first. Its examples do not enable `preview`, so it cannot exercise the preview trigger. An ephemeral fixture (outside the repository and package distribution) imported the sealed package and ran at `http://localhost:4308/`. No product source, `dist`, or documentation fixture was changed. No screenshot file was exported; the observations below are the durable record of the live UI checks.

## Default desktop viewport

The fixture exposed a loaded data-URL image, a `preview=true` trigger, source-change control, and an output counter. The accessibility tree reported a named native button, `Open image preview: QA image`, and the image name `QA image`. The initial Tab landed on the trigger.

- Physical `Enter` on the trigger opened one modal. The modal was exposed as `Image preview`; its control group contained named Zoom out, Zoom in, Rotate left, Rotate right, and Close image preview buttons. Focus entered on Zoom out.
- Escape closed the modal and restored focus to the preview trigger.
- Reopening with physical `Space` opened one modal. Repeated trigger activation while it was already open did not reopen or reset it.
- Keyboard activation of Zoom in and Rotate right changed the image while the toolbar remained visible; focus remained on the activated toolbar button.
- Clicking outside the modal at approximately `(50,400)` dismissed it and restored trigger focus.
- After changing the fixture source while closed, reopening visibly changed the image from the red data URL to the blue data URL.

At the default viewport the loaded image occupied approximately 641x481 CSS pixels and the toolbar controls were visible with a focus outline. The browser accessibility tree had no unnamed preview controls.

## Narrow and short viewports

The browser viewport override was set to `320x480`, reloaded, and the trigger was opened with physical Space. The loaded image fit approximately `304px` of content width (x≈8..312); the toolbar stayed in flow below the image. After keyboard rotation, the rotated image and focused Rotate right button remained visible.

The override was then set to `320x240`, reloaded, and the preview was opened with physical Space. The image and toolbar remained present in the short viewport. Escape closed the preview and restored focus to the trigger. The viewport was reset to the default size and the fixture reloaded afterward.

## Cleanup and diagnostics

The live check observed backdrop dismissal, Escape dismissal, focus restoration, source replacement after close, and usable toolbar controls at both constrained sizes. The browser console returned no warning or error entries (`[]`). The focused Karma suite still supplies the deterministic API and DOM assertions, while this fixture supplies physical keyboard and constrained-viewport evidence. The fixture did not exercise application-specific providers, hydration, or the accepted compatibility no-ops: `appendTo` remains accepted without relocation and `hideTransitionOptions` remains accepted with Modal's single transition configuration.
