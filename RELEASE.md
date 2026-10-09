# RELEASE.md — release runbook and history notes

How `@ciag/orchestra` is released, and what the release history actually
contains. This file came out of the release-history repair (overhaul ticket
[#8](https://github.com/OpenCIAg/orchestra/issues/8)); the "Historical notes"
section is the archaeology record — no history rewrite or tag deletion was
executed to produce it.

## Streams and topology

One publishable package (`projects/orc-ds`, built to `dist/orc-ds`), released
from parallel streams — one per supported Angular major:

| Branch | Role              | Publishes                    | npm dist-tag |
| ------ | ----------------- | ---------------------------- | ------------ |
| `main` | current           | Version-PR merges (any bump) | `latest`     |
| `v22`  | backport (frozen) | patch tags only (`v22.*`)    | `angular22`  |
| `v21`  | backport          | tags (`v21.*`)               | `angular21`  |
| `v20`  | backport          | tags (`v20.*`)               | `angular20`  |
| `v19`  | backport          | tags (`v19.*`)               | `angular19`  |

`compatibility/versions.json` is the machine-readable contract (branch →
Angular major, peer range, package major, node, role, publish mode, tag glob,
dist-tag). Everything release-related validates against it:

- `tools/release/verify-compatibility.mjs` — branch/manifest compatibility.
- `tools/release/publish-guard.mjs` — the publish/tag decision (verdict logic
  in `publish-guard-lib.mjs`, topology in `topology-lib.mjs`). Read-only
  toward the registry and git; `--dry-run` prints the verdict and the dist-tag
  reconciliation plan without touching anything.
- `tools/release/version-packages.mjs` — the changesets Version-PR seam.
- `tools/release/changelog-lib.mjs` + `verify-changelog-coverage.mjs` —
  changelog parsing and the published-version coverage invariant.
- `tools/release/release-notes.mjs` — one version's changelog section as
  GitHub Release notes.

Version scheme: Angular major . Orchestra major . Orchestra minor
(`22.2.0` = Orchestra generation 2 for Angular 22). Breaking changes land only
at Angular-major boundaries; note the retired middle "generation" digit sat in
semver's minor slot, so `^22.1.0` ranges auto-received breaking `22.2.x` —
see Historical notes (dual-stream collision).

## Current-line release flow (main)

1. **Changeset** — land features/fixes on `main` with a changeset proposal
   (`.changeset/*.md`) declaring the bump kind for `@ciag/orchestra`.
2. **Version PR** — `version-pr.yml` (changesets action) consumes pending
   proposals on `changeset-release/main`: bumps
   `projects/orc-ds/package.json`, generates the changelog section, and
   refreshes a single PR toward `main`. It never publishes and never tags.
3. **Merge the Version PR** — this produces the governed release commit:
   version changed vs the parent, zero pending changesets.
4. **Guarded publish** — `release.yml` runs on the merge push. The publish
   guard requires: version changed vs `HEAD~1` → governed trigger → zero
   pending changesets → registry reachable → version not already published →
   current line may not move `latest` backwards. Only then does it build,
   run the isolated-consumer `verify:package` gates, and
   `npm publish` under `latest` (OIDC trusted publishing, `id-token: write`;
   the workflow itself is `contents: read`).
5. **Tag + GitHub Release** — `tag-release.yml` (one of the two
   `contents: write` workflows, alongside `version-pr.yml` — each scoped to
   its job: Version-PR branch pushes there, tag + GitHub Release creation
   here) runs the same guard verdict, waits for the version to appear on
   the npm registry (release.yml publishes concurrently), creates the
   annotated `v<version>` tag at the release commit, and opens the GitHub
   Release with the version's changelog section as notes
   (`tools/release/release-notes.mjs`). If the publish never lands, the job
   fails instead of minting a tagged-but-never-published phantom.

The tag push of step 5 re-triggers `release.yml`'s tag path; the guard
recognizes a tag whose commit sits on the current line
(`taggedCommitOnCurrentLine`) and skips — the old-line rules do not apply to
the current line's own release tags, even while they share the `v22.*` glob
space (see Historical notes).

## Backport-line release flow (v19–v22)

1. Land the fix (or security) backport on the `vNN` branch. Frozen
   `patch-tag` lines (currently `v22`) may only bump the patch segment of the
   stream they froze on (`22.2.x`); plain `tag` lines may bump minor/major.
2. Bump `projects/orc-ds/package.json` on the branch
   (`chore(release): ...`), push the branch.
3. Push the annotated tag `vNN.x.y` at the release commit — the version must
   equal the tag. `release.yml` routes the tag through the branch's `tagGlob`,
   re-runs the guard (patch-only invariant for frozen lines, collision,
   registry), and publishes under the line's `angularNN` dist-tag.
4. `tag-release.yml` waits for the registry, then attaches the GitHub Release:
   notes from the tagged tree's changelog section, or a fallback note when the
   era predates changelog sections. Tags marking commits on `main` are
   ignored here (the current-line job owns them).

## Support policy

- `main` is the only active development line; it always tracks the current
  Angular major.
- The previous Angular-major line (N−1) is maintained while that Angular
  major is in Angular's active support window: fixes and security backports
  land there as patch releases.
- Older backport lines receive fixes and security backports only, until their
  Angular major reaches end of life; then the line is retired (branch kept,
  dist-tag left pointing at its last release).
- Breaking changes only at Angular-major boundaries, except the
  `22.4.0-rc.0` overhaul, which already removed the compatibility scaffolding
  (see `docs/overhaul/DECISOES.md`).
- Consumers pin a line via the dist-tags: `latest` (current),
  `angular19`…`angular22` (backports). `npm view @ciag/orchestra dist-tags`
  shows the live map; `node tools/release/publish-guard.mjs --dry-run` prints
  where each line stands relative to the registry.

## Changelog coverage invariant

Every version published to npm has exactly one section in
`projects/orc-ds/CHANGELOG.md`; every section is either an npm version or
explicitly annotated `## X.Y.Z (tagged, never published)`.
`npm run verify:changelog-coverage` checks it against the live registry;
`node --test tools/release/changelog-coverage.test.mjs` (part of
`test:tools`) checks it offline against the committed registry snapshot in
`tools/release/fixtures/npm-versions.json` — refresh the snapshot with
`node tools/release/verify-changelog-coverage.mjs --write-fixture` after a
release adds new versions. New sections themselves are generated by the
Version PR flow (step 2 above), which prepends them; the backfilled history
sits below the `22.2.0` section and is edited only by archaeology.

## Historical notes (verified 2026-10-02, nothing rewritten)

All findings below were re-verified against the git object store and the npm
registry while backfilling the changelog; commit hashes are stable.

**No remote tags or releases exist.** `git ls-remote --tags` is empty for both
remotes (GitHub `OpenCIAg/orchestra` and the GitLab mirror). Every "release
tag" below is an annotated tag in local working clones only. No GitHub Release
was ever created before the overhaul; the tag+Release job (tag-release.yml)
now creates both going forward.

**The 8 local tags:**

| Tag     | Commit    | On a branch? | Version on npm?      |
| ------- | --------- | ------------ | -------------------- |
| v19.1.0 | `63206e9` | yes (main)   | yes                  |
| v19.2.0 | `ccd7ffe` | yes (main)   | yes                  |
| v20.1.0 | `b72b95a` | **no**       | yes (from `db802df`) |
| v20.2.0 | `25dba81` | **no**       | **never published**  |
| v21.1.0 | `613a2ff` | **no**       | yes (from `b7dc0e8`) |
| v21.2.0 | `0cc78ed` | **no**       | **never published**  |
| v22.0.0 | `395357b` | yes (main)   | yes                  |
| v22.1.0 | `38d380c` | **no**       | yes (from `a446a80`) |

- **5 orphaned tags** — v20.1.0, v20.2.0, v21.1.0, v21.2.0, v22.1.0 point at
  commits no branch reaches. The stream split of 2026-08-17/18 rewrote the
  release lines (v20's root is `c4d2dbb`, v21's is `d5f7921`), leaving the
  tagged commits dangling. Orphaned tags pointing at _published_ versions
  (v20.1.0, v21.1.0, v22.1.0) are misleading history, not broken releases —
  the npm artifact came from a different commit.
- **2 phantom tags** — v20.2.0 and v21.2.0 are "prepare orchestra X.2.0"
  release-prep commits from the pre-rewrite line whose versions were never
  published to npm. They are deletion candidates (see Remote actions).
- **22.2.0 (and everything else) published without a tag** — 22.2.0 was
  published 2026-10-01 from main's `4cf3692` with no tag anywhere; the same
  holds for most of the 31 published versions (0.1.0, 19.3.0, the whole
  21.0.x series, 22.0.1, 22.0.2, 22.1.x, 22.2.1). The tag+Release job closes
  this going forward; creating the missing `v22.2.0` tag retroactively is a
  remote action.
- **Backwards moves.** The orphaned v22.1.0 tag (2026-08-17, "prepare
  orchestra 22.1.0") predates the current line's `22.0.1 → 22.0.2` release
  (8e2c71a, 2026-08-24): npm `latest` descended relative to tag space, and
  22.1.0 itself was only published 2026-09-01 from a different commit
  (`a446a80`). The Angular 19 line did the same: 19.2.0 (2026-08-18) was
  followed by 19.1.1 (efd4f07, published 2026-08-25), a patch _below_ the
  already-published 19.2.0. The publish guard now refuses backwards moves on
  the current line and patch-stream violations on frozen lines.
- **Dual-stream collision.** While the package major is 22, `main` (current,
  `latest`) and `v22` (frozen backport, `angular22`) publish in the same
  semver space: today `angular22=22.2.1` sits _ahead_ of `latest=22.2.0`, and
  `^22.1.0` consumers auto-received the breaking middle-digit bump in
  22.2.x. Rules that keep it safe: main may not move `latest` backwards; v22
  publishes patch releases only; main's release tags (e.g. a future
  `v22.3.0`) fall inside the `v22.*` glob and are recognized as current-line
  tags and skipped by both the publish path and the old-line notes job. The
  collision ends at the `23.0.0` gate, when main moves to Angular 23 and
  leaves the 22.x space to the frozen line.
- **22.1.1 has no surviving commit.** It was published 2026-09-01, nineteen
  seconds after 22.1.0, during the icon-feature mass release; no branch or
  tag records its bump (the v22 line was rewritten around it). Its changelog
  section says exactly that.
- **21.0.x churn.** The v21 stream published 13 patches in 4 days
  (2026-08-24 → 08-28), each a hand bump folded into or appended to fix
  commits — the decorative-changesets era the Version PR flow replaces.
- **0.1.0 predates the repo layout.** `projects/orc-ds` was created at
  `395357b` (22.0.0); no source snapshot for the initial 2026-08-17
  publication survives.

## Default branch (remote procedure)

The GitHub default branch is still the legacy `master` (PrimeNG-wrapper app
era). Switching it is a GitHub settings change — never executed by an agent:

1. GitHub → `OpenCIAg/orchestra` → Settings → Branches → switch default
   branch `master` → `main`.
2. Check branch protection rules exist for `main` (required checks: the ci.yml
   gates) and that none are attached to `master` that should move.
3. Optionally mark `master` historical: push one commit to `master` replacing
   its README with a banner pointing to `main` (also a remote action — the
   branch is untouched locally).
4. Update any external links/docs that reference `master`
   (`https://github.com/OpenCIAg/orchestra/blob/master/...`).

## Remote actions

Not executed locally by the implementer (per the overhaul standing rules);
each is safe to run from a clone that has the overhaul branch merged:

```bash
# 1. Delete the two phantom tags (local-only; they exist on no remote —
#    deleting the local refs prevents them ever being pushed).
git tag -d v20.2.0 v21.2.0

# 2. Tag the already-published 22.2.0 on GitHub (4cf3692 = main's
#    "chore(release): prepare orchestra 22.2.0").
git fetch github
git tag -a v22.2.0 4cf3692 -m "Release @ciag/orchestra 22.2.0"
git push github refs/tags/v22.2.0

#    ...and create the matching GitHub Release (the tag push alone will NOT
#    create it: 4cf3692 is on the current line, so tag-release.yml's
#    old-line job defers to a main-push job that will never come).
node tools/release/release-notes.mjs 22.2.0 > /tmp/notes-22.2.0.md
gh release create v22.2.0 -R OpenCIAg/orchestra \
  --target 4cf3692 \
  --title "@ciag/orchestra 22.2.0" \
  --notes-file /tmp/notes-22.2.0.md

# 3. Push this runbook: merge the overhaul integration branch and push main
#    to GitHub (RELEASE.md, the backfilled changelog, tag-release.yml and the
#    package README all ride along).
git push github main

# 4. Switch the GitHub default branch master -> main (Settings → Branches,
#    see the procedure above).
```

Considered but deliberately not requested: tagging `v22.2.1` at `4b9d289`
(published, untagged) and pushing the three on-trunk historical tags
(v19.1.0, v19.2.0, v22.0.0) to GitHub. Harmless, but the tag+Release job
makes them optional; decide when the default-branch switch lands.
