# Agent instructions for this repository

This repository distributes portable marketing analysis skills. Read [docs/AUTHORING.md](docs/AUTHORING.md) before changing skill content and [docs/RELEASING.md](docs/RELEASING.md) before preparing a release.

The installable source is exactly the directories listed in [skills/manifest.json](skills/manifest.json). Keep generated catalog output under ignored dist/. The schema-2 portable allowlist includes SKILL.md, CSV templates/examples, input/business/example references and optional byte-identical scripts/marketing_math.py. Evaluation fixtures and raw results stay outside installable folders. Do not add private internal procedures, customer data, credentials or environment-specific setup. Read docs/QUALITY_PLAN.md and evaluations/README.md for distinct source, runtime, review and release acceptance.

For a source change, run:

~~~sh
npm test
npm run validate
~~~

Use npm run build:catalog only when exact source SHA and installer version are available. Never invent those provenance values. Tracked content is English.
