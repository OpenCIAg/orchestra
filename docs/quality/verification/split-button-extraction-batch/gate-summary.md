# SplitButton extraction batch

Date: 2026-09-23

This batch extracted `SplitButtonComponent` from `projects/orc-ds/p2/p2-primeng-gap-components.ts` into `projects/orc-ds/p2/p2-split-button-component.ts`. The old P2 module retains a compatibility re-export, so the P2 barrel, secondary `split-button`/`splitbutton` entries, and direct old-module imports continue to resolve the same class.

## Bundle comparison

The pre-extraction comparison was reconstructed from the shared current worktree without reverting unrelated changes:

1. Saved the current `p2-primeng-gap-components.ts`, focused SplitButton module, and `ng-package.json`.
2. Inlined the focused module's `SplitButtonComponent` declaration back into the old module at the re-export location, restored its `ChangeDetectorRef` import, and removed the focused module temporarily.
3. Built the library with the temporary ng-package destination, then restored the saved extracted source and package configuration.
4. Measured `fesm2022/ciag-orchestra-p2.mjs` with byte length and deterministic gzip (`mtime=0`).
5. Rebuilt the extracted source to the normal `dist/orc-ds` destination.

| Snapshot                     |        Raw FESM | Deterministic gzip |
| ---------------------------- | --------------: | -----------------: |
| Reconstructed pre-extraction | 1,629,816 bytes |      168,487 bytes |
| Extracted current source     | 1,629,817 bytes |      168,784 bytes |
| Delta                        |         +1 byte |         +297 bytes |

The extraction therefore has effectively unchanged raw P2 FESM size; the small gzip increase is recorded rather than treated as a performance improvement.

## Passing evidence

- PrimeNG gap controls: **9/9**.
- P2 expansion plus all-components lifecycle: **271/271**.
- `npm run build:lib`: exit 0.
- Current package verification: exit 0; 224 JavaScript entries, public declarations, and 5 packed Sass entries.
- Minimum Angular package verification: exit 0; 224 JavaScript entries, public declarations, and 5 packed Sass entries.
- Diff and whitespace checks: passed.
