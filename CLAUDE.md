# Release rules

Every commit that changes behavior must update `CHANGELOG.md` in the same commit.

- Add entries under `## [Unreleased]` using Keep a Changelog groups: Added, Changed, Fixed, Removed, Setup.
- When a push ships a release, rename `[Unreleased]` to `## [x.y.z] - YYYY-MM-DD`, add a fresh empty `[Unreleased]`, and set the same version in `package.json` (and `package-lock.json`).
- SemVer, pre-1.0: new feature = bump MINOR, fix only = bump PATCH.
- Tag the release after pushing: `git tag vX.Y.Z && git push origin vX.Y.Z`.
- Skip the changelog only for changes with no user-visible effect (docs, comments, tooling).
