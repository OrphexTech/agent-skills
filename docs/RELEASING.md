# Release process

This repository publishes portable skill sources through immutable, versioned tags. Repository visibility and release tagging are separate maintainer actions.

Before a release:

1. Review every directory under skills/ against skills/manifest.json and make sure only intended skills are installable.
2. Run npm test and npm run validate.
3. Ensure package.json, CHANGELOG.md, manifest entries, and all skill metadata use the same release version.
4. Commit the final source. Read back the resulting full commit SHA.
5. Generate dist/catalog.json using that source SHA and the pinned installer version 1.7.0. The output is intentionally ignored by Git and must not be committed.
6. Review the generated catalog, schema validation result, skill examples, and exact source paths.
7. Tag the reviewed source commit with the matching v-prefixed package version only after the owner authorizes release publication.

Pushing a matching v-prefixed tag runs the source validation and catalog-artifact workflow. The automatic installer smoke uses checked-out local skill directories. After the tag is publicly reachable, run the `Validate skills` workflow manually on that exact tag with the `published-release` smoke source. That run installs every manifest-listed, tag-pinned public skill folder, checks each installed file hash and list entry, and removes the skills afterward. Both Codex and Claude project and global scopes run on the disposable GitHub-hosted runner; global checks skip with an explicit message outside that verified runner.

The catalog-artifact job builds with the tag commit as sourceSha and skills CLI 1.7.0 as installerVersion, then uploads dist/catalog.json as a workflow artifact. Inspect that artifact against the tag before distributing it.

Do not change repository visibility, publish a GitHub release, or deploy catalog output as a side effect of running local validation. Record any runtime agent checks as separate evidence; source-format validation alone does not establish runtime compatibility.
