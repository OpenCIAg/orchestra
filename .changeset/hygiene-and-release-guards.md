---
'@ciag/orchestra': patch
---

Purge generated process exhaust and archived verification evidence from the repository — evidence is now cited as plain text and produced by CI — and replace push-triggered npm publishing with governed releases: a publish guard checks the version change, registry collisions, and the single-owner stream topology encoded in `compatibility/versions.json`, so publishes happen only from Version-PR merges on main (under `latest`) or from backport tags on the v19–v22 lines (under `angularNN`).
