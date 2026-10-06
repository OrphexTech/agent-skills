# Authoring and catalog contract

## Skill source

An installable skill is a directory under skills/ with a matching directory name and SKILL.md frontmatter:

~~~yaml
---
name: orphex-example-skill
description: "A specific sentence describing the task and when the skill applies."
license: MIT
metadata:
  version: "1.1.0"
---
~~~

Keep name equal to the directory slug. Keep description identical in the manifest and frontmatter so discovery and the installed instructions agree. The metadata version is a quoted string and matches the catalog version. Put actionable task-specific guidance in the Markdown body. Add references only when substantial material is useful in a narrower context.

Do not include executable SKILL.md examples in production skill directories. Use short, fictional data examples where they materially clarify calculations or output. Include enough context to show the period, definitions, and limitations behind a conclusion.

## Manifest lifecycle

The source manifest at skills/manifest.json defines each directory's title, matching description, outcome, category, tags, update date, requirements, and related skills. Categories are performance, creative, conversion, and measurement. Keep all listed relationships pointed at existing installable slugs; no skill may relate to itself.

The package version, changelog heading, manifest skill versions, and skill frontmatter versions move together. The public release version is v-prefixed in the generated catalog. Source dates use ISO calendar dates.

## Generated catalog

The frozen catalog schema is schemas/catalog.schema.json. The ignored output path is dist/catalog.json. Its keys and per-skill fields are part of the distribution contract; change them only with an intentional schema version change.

Catalog output is built from SKILL.md and the manifest. Each skill's contentHash is SHA-256 of its complete UTF-8 SKILL.md source. instructions contains only the Markdown body after the closing frontmatter delimiter. Catalog skills are sorted by slug, object keys follow the schema declaration order, and JSON output ends with one newline.

Build requires provenance from the caller:

~~~sh
ORPHEX_SKILLS_SOURCE_SHA=$(git rev-parse HEAD) ORPHEX_SKILLS_INSTALLER_VERSION=1.7.0 npm run build:catalog
~~~

The source SHA must identify the exact committed input tree. Installer version is the version of the skills CLI used by the public install flow. Do not substitute an estimate, working-tree hash, or current latest version for the pinned inputs.
