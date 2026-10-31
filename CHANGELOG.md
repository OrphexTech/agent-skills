# Changelog

## Skill source update - 2026-10-30

- Point Impression Share & Auction Insights Review at the `budget` and `brand` guide topics, and let Anomaly Investigation rule out a change through `change_history.read` and the `change_history` guides when the connection returns them.
- Extend the shared connection paragraph in every skill: read brand memory when the search returns it and Knowledge Library `context` entries, cite memory entries by number, and treat a declared target as a goal rather than a measured value.
- Quality Score Reviewer still names no guide topic: no published guide covers Quality Score or its components.
- Fix spacing typos in README.md and docs/AUTHORING.md.
- Not released: `metadata.version` stays 2.1.0. The native harness runs without a connector, so no evaluation covers these connection changes.

## Evaluation suite update - 2026-10-30

- Let decision assertions declare `acceptableLabels` and report a separate `labelEquivalentPassed` grade; strict `passed` is unchanged, and the labels declared on ten existing decisions are disclosed in the evaluation report.
- Add eight adversarial behavioral cases for six skills, built on traps their instructions guard against: partial current days, zero remaining days, repeated shared budgets, row-averaged ratios, mixed currencies and modelled Impact Analysis read as measured lift. No native run is claimed for them.
- Plan a connected-path evaluation against a local fixture MCP server.
- Skill instructions, resources and the package version are unchanged.

## 2.1.0 - 2026-10-25

- Make every skill connection-first: when an Orphex connector reaches the workspace's data, skills use the matching Orphex warehouse or live platform reads, playbooks and Knowledge Library guides before asking for exports, and fall back to supplied exports otherwise. Modelled Impact Analysis and creative attribute reads are described as modelled or associative evidence, not measured lift.
- Move the weekly skills' method paragraphs out of their resources sections; their text is unchanged.
- Name the advertising domain in twenty skill descriptions so general assistants can match requests to them, keeping every trigger distinction between overlapping skills.
- Rewrite every catalog "Try asking" prompt to name the ad platform or domain, the question and the deliverable without naming a data source.
- Repeat the native baseline, skill-assisted and routing runs against the 2.1.0 installed files.

## 2.0.1 - 2026-10-07

- Attach one upload-ready `<slug>.zip` per skill to the release and record its tag-pinned URL, SHA-256 and size in the catalog `download` field, for Claude (Customize › Skills › Upload a skill) and ChatGPT skill upload.
- Skill instructions and resources are unchanged from 2.0.0 apart from `metadata.version`; no new behavioral evaluation is claimed.

## Documentation correction - 2026-10-07

- Disclose optional offline Python calculators and distinguish terminal Claude installation from Claude web chat.
- Correct native evidence screenshot links, disclose the absent earlier capture, and preserve all hash-bound records and original root documents in a supplemental archive.
- Add deterministic correction packaging and integrity tests; keep all 195 installed files and v2.0.0 skill metadata unchanged.
- Document validated-PR and tag protections, future immutable releases, and historical release limitations.

## 2.0.0 - 2026-10-07

- Expand the collection to twenty-nine portable skills with ten growth, experiment, commerce, CRM, and Meta workflows.
- Migrate the manifest and catalog to schema 2 with six job categories, platform and business-type facets, complete fictional examples, explicit CSV inputs, supplementary resource hashes, and three starter bundles.
- Add supplied reusable business context, input templates, optional offline deterministic calculators, and task-specific evidence and approval guidance to every skill.
- Add reproducible native-agent baseline and skill-assisted evaluation fixtures, routing cases, raw-run provenance, strict numerical/decision grading, and independent review requirements. Synthetic runtime tests and distribution checks remain separate from real-account business results.
- Extend installation verification to all portable resource files and bundle commands; reject uncommitted catalog inputs and preserve immutable exact-source provenance.

## 1.1.0 - 2026-10-07

- Add fourteen portable skills for search terms, placements, creative fatigue, quality score, anomaly investigation, account structure, geo and device breakdowns, fixed-total budget reallocation, conversion tracking, weekly summaries, RSA assets, PMax assets and search themes, and auction insights.
- Define required evidence, attribution and reporting limits, domain-specific review methods, and approval boundaries for each task.
- Keep the existing five workflows and publish a manifest-driven nineteen-skill catalog with the same pinned installer and catalog schema.

## 1.0.0 - 2026-10-06

- Add five portable marketing analysis skills for weekly performance, creative signals, budget proposals, landing conversion, and measurement consistency.
- Add a versioned catalog contract, deterministic catalog builder, source validation, install guidance, and CI checks.
- Mark all sample figures and scenarios as fictional; no runtime compatibility claim is made.
