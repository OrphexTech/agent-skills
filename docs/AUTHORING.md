# Authoring and catalog contract

## Portable source

Each manifest-listed folder under `skills/` is installable. The slug equals the frontmatter name and stays at most63 characters. Description is identical in frontmatter and manifest. License is MIT; quoted `metadata.version` matches package.json. Tracked source uses English, UTF-8, LF and a final newline.

~~~yaml
---
name: orphex-example-skill
description: "Perform a specific marketing task when a concrete user need applies."
license: MIT
metadata:
  version: "2.0.1"
---
~~~

Every folder contains exactly these required files:

- `SKILL.md`: concise task instructions, trigger distinctions, evidence/decision method, output and when to load resources.
- `assets/input-template.csv`: one header row matching manifest `inputs` names in the same order.
- `assets/example-input.csv`: complete fictional rows with that exact header.
- `references/input-contract.md`: column semantics, units, freshness, attribution and non-CSV configuration.
- `references/business-context.md`: a reusable profile containing supplied facts and explicit unknowns, never invented defaults or secrets.
- `references/example-output.md`: useful bounded output for the fictional input, byte-matching manifest `example.outputMarkdown`.

Relevant quantitative folders may also contain `scripts/marketing_math.py`, byte-identical to `resources/marketing_math.py`. This optional Python 3 helper is offline and does not fetch data or mutate accounts. It returns explicit unsupported-input errors, including currencies outside its reviewed minor-unit allocation range. `SKILL.md` links every supplementary file and explains when it is useful. No other installable files, subdirectories, symlinks, binary blobs, hidden fixtures or evaluation results are allowed.

A skill whose task matches an Orphex warehouse read or Knowledge Library guide carries a `## With an Orphex connection` section before its first method section. Its first sentences and closing paragraph are shared verbatim (enforced by `tests/catalog.test.mjs`); only the named reads, playbooks and guide topics differ. The section gates every read on `capability_search` returning its id, names guides by topic rather than by stored id, and falls back to live platform reads or supplied exports. Skills whose evidence is only live platform settings or user files (account structure, bid strategy, landing pages, CRM leads, Merchant Center feeds, Google placements) have no such section. The native evaluation harness runs with an empty MCP configuration, so its matrix covers the no-connector path only.

Use task-specific progressive disclosure. Avoid duplicating large references in the main instructions. Keep baseline and skill-assisted evaluation inputs outside skill folders and different from worked package examples so correctness cannot be inferred by replaying an answer.

## Manifest and discovery

The strict schema is `schemas/manifest.schema.json` with `schemaVersion: 2`. Every skill declares the existing title/description/outcome/tags/lifecycle/requirements/related fields plus `platforms`, `businessTypes`, `useWhen`, `inputs` and `example`. Unknown fields, wrong types, duplicate input names and unsupported enum values fail validation.

Primary categories are reporting-diagnostics, campaign-optimization, creative-messaging, budget-growth, measurement-data-quality and conversion-experiments. Platforms and business types are separate facets, not additional counted categories. Facet arrays, tags, related slugs and manifest skills are lexically sorted and unique. Relationships target existing slugs and cannot point to the same skill.

Top-level `bundles` contain exactly weekly-account-review, search-optimization and experiment-cycle, sorted by ID. Their ordered skill arrays describe an intended conditional workflow; validate no duplicates or unknown slugs. Bundles are bounded instructions and installation sets, not extra installable skills. No bundle grants permission to write campaign settings.

All twenty-nine skill metadata versions and lifecycle dates advance together with package.json and the CHANGELOG release heading. Source dates are valid ISO calendar dates. A future independent per-skill lifecycle needs an intentional contract change.

## Catalog and exact provenance

The frozen strict generated schema is `schemas/catalog.schema.json`, version2. Output stays ignored under `dist/catalog.json`. Every manifest field is copied; generated fields add agent compatibility labels, version/license, Markdown instruction body, canonical source path, complete SKILL.md SHA-256 and supplementary `resources` path/kind/UTF-8 SHA-256. Supplementary paths are lexically sorted; output is stable JSON with a final newline. Examples must byte-match the corresponding resource files. Each skill also gets `download` (tag-pinned release URL, SHA-256 and byte size) for `dist/<slug>.zip`: a single top-level `<slug>/` folder holding SKILL.md and its resources, the layout Claude and ChatGPT skill upload expects. Archives store entries uncompressed in lexical order with a fixed timestamp and modes, so identical source bytes give an identical SHA-256.

Build only after committing final inputs:

~~~sh
ORPHEX_SKILLS_SOURCE_SHA=$(git rev-parse HEAD) ORPHEX_SKILLS_INSTALLER_VERSION=1.7.0 npm run build:catalog
~~~

The builder requires a full exact checked-out HEAD commit, rejects modified or untracked catalog inputs and enforces installer1.7.0. Never substitute a working-tree digest, estimated commit, branch name or latest installer. Source validation may use an explicit zero provenance sentinel internally; no distribution build accepts it.

## Quality changes

Read `docs/QUALITY_PLAN.md`, `docs/BUSINESS_CONTEXT.md` and `evaluations/README.md`. Add/adjust complete cases and human criteria when changing a decision method. Source validation and installer hashes prove packaging; actual reviewed native runs prove behavior only within their tested data/runtime scope. Preserve failing run evidence and record fixes/reruns rather than relabeling a failure.
