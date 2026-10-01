# FileUploader lifecycle and limit gate

Date: 2026-09-22

The FileUploader batch repaired the remaining object URL lifecycle gap: a preview URL owned by the component is released immediately when image decoding fails. Caller-provided preview URLs remain caller-owned. Existing lifecycle handling also revokes owned URLs during remove, clear, value replacement, and destroy. File-limit overflow now retains accepted files, reports rejected files through `onError`, and applies the configured summary/detail strings with `{0}` replaced by the effective limit.

Focused browser evidence:

- `projects/orc-ds/file-uploader/file-uploader-behavior.spec.ts`
- 17 specs passed with ChromeHeadless after the repair.

The broader library gate remains a separate integration concern and is recorded in the root verification logs.
