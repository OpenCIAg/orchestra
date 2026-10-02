# Changesets

This repository releases `@ciag/orchestra` through the changesets Version-PR
flow.

## Adding a changeset

After a consumer- or contributor-visible change, run:

```bash
npm run changeset
```

Pick the bump kind and commit the generated `.changeset/*.md` file together
with your work. Bump kinds follow the versioning scheme documented in the
root README: versions are `22.y.z` — the Angular major is the semver major —
and breaking changes land only at Angular-major boundaries (`23.0.0` next).
Use `minor` or `patch` here; a `major` changeset cannot release while
Angular 22 is the current line, because `compatibility/versions.json` pins
the package major and the release guards enforce it.

## Release flow

1. Merged changeset proposals accumulate on `main` — that pending state is
   the standing "next release" queue.
2. The Version PR workflow (`.github/workflows/version-pr.yml`) consumes the
   proposals with `changeset version` and opens/refreshes a single Version
   PR containing the version bump and the generated changelog section.
3. Merging the Version PR produces the governed release commit: the package
   version differs from the previous commit and zero proposals remain.
4. The guarded release workflow (`.github/workflows/release.yml`) recognizes
   that commit shape, builds the library, validates the package
   distribution, and publishes to npm under the `latest` dist-tag. It never
   publishes any other main push.
