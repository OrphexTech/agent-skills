# Agent instructions for this repository

This repository distributes portable marketing analysis skills. Read [docs/AUTHORING.md](docs/AUTHORING.md) before changing skill content and [docs/RELEASING.md](docs/RELEASING.md) before preparing a release.

The installable source is exactly the five directories listed in [skills/manifest.json](skills/manifest.json). Keep generated catalog output under ignored dist/. Do not add executable fixtures, private internal procedures, customer data, or environment-specific setup to skill directories.

For a source change, run:

~~~sh
npm test
npm run validate
~~~

Use npm run build:catalog only when exact source SHA and installer version are available. Never invent those provenance values. Tracked content is English.
