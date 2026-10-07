# Release process

This repository publishes portable skill sources through protected, versioned tags. Repository visibility and release publication are separate maintainer actions. Active repository rulesets must require a pull request and the latest-base `validate` GitHub Actions check for `main`, resolve review threads, block force pushes/deletion, and block updates/deletion of every tag. No actor bypass is configured. The PR gate does not require a separate human approval; it is not evidence of independent human review.

Enable repository immutable releases before creating a new release. GitHub applies this setting only to future publications; do not claim older releases are retroactively immutable. Tag protection covers historical tags, while historical release assets remain preserved by maintainer policy. Create a draft, upload and verify every asset, then publish. Read back `immutable: true`, the exact tag commit, asset names and SHA-256 digests. Do not delete or recreate older tags/releases/assets to retrofit immutability. Administrators can change repository settings; these rules do not remove administrative authority.

## Skill version releases

Before a skill version release:

1. Review every directory under skills/ against skills/manifest.json and make sure only intended skills are installable.
2. Complete the scope ledger in docs/QUALITY_PLAN.md, actual native baseline/skilled and routing runs, independent review, and all correction/rerun evidence. Publish an honest versioned evaluations/README.md report with no pending behavioral acceptance. Run npm test and npm run validate after final source edits.
3. Ensure package.json, CHANGELOG.md, manifest entries, and all skill metadata use the same release version.
4. Commit the final source. Read back the resulting full commit SHA.
5. Generate dist/catalog.json using that source SHA and the pinned installer version 1.7.0. The output is intentionally ignored by Git and must not be committed.
6. Review the generated catalog, schema validation result, skill examples, and exact source paths.
7. Tag the reviewed source commit with the matching v-prefixed package version only after the owner authorizes release publication.

Pushing a matching v-prefixed tag runs the source validation and catalog-artifact workflow. The automatic installer smoke uses checked-out local skill directories. After the tag is publicly reachable, run the `Validate skills` workflow manually on that exact tag with the `published-release` smoke source. That run installs every manifest-listed, tag-pinned public skill folder, checks every installed SKILL.md/template/reference/calculator hash and list entry, verifies all three bundle commands, and removes the skills afterward. Both Codex and Claude project and global scopes run on the disposable GitHub-hosted runner; global checks skip with an explicit message outside that verified runner.

The catalog-artifact job builds with the tag commit as sourceSha and skills CLI 1.7.0 as installerVersion, then uploads dist/catalog.json as a workflow artifact. Inspect that artifact against the tag before distributing it.

Do not change repository visibility, publish a GitHub release, or deploy catalog output as a side effect of running local validation. Runtime checks require immutable raw records, actual task-input and final instruction/resource hashes, native process success, numerical/decision grading and independent narrative/tool review. Any source change after a skilled run invalidates that run for the changed files. Source-format validation alone does not establish runtime compatibility. Preserve prior release tags and assets.

## Documentation corrections

A documentation-only tag such as `docs-2026-10-07` is distinct from a `v*` skill release. Keep package, manifest, portable skill versions and public installation commands on the tested skill version when every installed file is unchanged. Run the source gates and PR CI, then bind the documentation tag to the exact merged commit. This tag does not trigger the `v*` catalog artifact job, replace the skill catalog, or establish new native behavior.

Publish corrections as supplemental assets on a new immutable release with `latest: false`. Preserve the original assets and raw records. Any corrected presentation must retain the original documents, identify changed paths and old/new hashes, and verify unchanged evidence against its existing record manifest. Reproduce strict grading with the original skill tag's grader. The [2026-10-07 evidence correction](evidence-corrections.md) fixes archive-relative screenshot links and discloses the absent earlier image without changing native answers, grades, timestamps, source hashes or selected records.
