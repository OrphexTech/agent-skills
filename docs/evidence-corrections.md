# Native evidence documentation correction — 2026-10-07

The [supplemental documentation release](https://github.com/OrphexTech/agent-skills/releases/tag/docs-2026-10-07) provides `skills-v2-native-evidence-docs-2026-10-07.zip`. Its root UI review uses relative links to the three included screenshots. The earlier player-loading image was absent from the original published ZIP; it remains explicitly unavailable. The review describes a historical local inspection and does not establish a new live deployment or accessibility audit.

This is a documentation correction, not a skill version or new behavioral evaluation. All 195 installed skill files remain unchanged from v2.0.0. The original v2.0.0 source commit is `83dc5a20963f9990e42f329acdc41f94258dc6eb`. The original catalog and ZIP stay on the [v2.0.0 release](https://github.com/OrphexTech/agent-skills/releases/tag/v2.0.0).

## Preserved evidence

- All 319 entries bound by `record-manifest.json`, including 142 selected final records, remain byte-identical to the original published ZIP. Answers, task data, native errors, tool traces, timestamps, grades, source/resource hashes and screenshot bytes are unchanged.
- Only the root `README.md` and `skills-v2-ui-review.md` presentation changes. Their original bytes remain in `historical/README-v2.0.0.md` and `historical/skills-v2-ui-review.md`.
- `documentation-corrections.json` identifies the original archive SHA-256, installed skill source SHA, corrected paths, original/corrected document hashes, three included images and the unavailable image.
- Normalized public records remain distinct from raw local originals, as disclosed in the [behavioral evaluation report](../evaluations/README.md). Synthetic tests do not establish real-account performance or human advertiser acceptance.

## Reproduce the supplement

Requires Python 3 standard libraries. Download the original published ZIP and verify its SHA-256 is `adf91deda5fbc352d392c17d0256aa5c845e2d409f4b526176d822871689abda`. The packager checks this pinned digest, safe archive entries, all 319 record hashes, the 142 final records and the included screenshots. It refuses to overwrite an output file and does not extract, execute or edit native records.

From the documentation tag checkout:

~~~sh
python3 -B scripts/package_evidence_docs.py --input /path/to/skills-v2-native-evidence.zip --output /path/to/skills-v2-native-evidence-docs-2026-10-07.zip
~~~

The command prints the output SHA-256. Compare it with the digest reported on the supplemental release. The same pinned input and script produce the same archive bytes.

To reproduce strict scoring, extract the supplemental ZIP, run its unchanged `python3 prepare-selected.py`, and use `scripts/grade_evaluations.mjs` from the exact **v2.0.0** source tag on the resulting `selected-results` directory. Independent narrative adjudication remains separate from strict machine results; no failed decision label becomes an automatic pass.

## Publication protections

The `main` ruleset requires a pull request, the latest-base `validate` GitHub Actions check and resolved review threads, and blocks force pushes/deletion. The PR gate requires zero separate approving reviews; it does not assert independent human review. Every tag is protected against updates/deletion. Neither ruleset has actor bypasses. Administrators retain authority to change repository settings.

GitHub immutable releases are enabled for future publications. Supplemental assets are uploaded and verified on a draft before publication; publication locks that release's tag and assets. This setting does not retrofit historical releases. Historical assets are preserved unchanged rather than deleted and republished. Read the [release process](RELEASING.md) for the required read-back checks.
