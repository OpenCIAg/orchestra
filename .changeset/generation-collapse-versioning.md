---
'@ciag/orchestra': minor
---

Collapse the generation-based versioning scheme. Orchestra versions now follow strict semver with the Angular major as the semver major (`22.y.z`), and breaking changes land only at Angular-major boundaries (next: `23.0.0`). The retired `Angular major.Orchestra major.Orchestra minor` scheme placed breaking Orchestra generations in the semver minor slot, so caret ranges received them automatically; from this release onward a minor bump is backward-compatible by contract. Old release lines (v19–v22) continue as Angular-locked backport streams publishing under their `angularNN` dist-tags.
