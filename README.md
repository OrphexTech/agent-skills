# Orphex Agent Skills

Five portable skills for reviewing marketing performance, creative signals, budget proposals, landing conversion, and measurement consistency from exports and documents supplied by the user.

Each skill is a self-contained directory under [skills](skills/). Orphex MCP can provide data when it is available and authorized, but none of these skills requires it. Examples use fictional data and do not represent verified customer results.

## Browse the skills

The source directories are also the installable directories:

- [Weekly performance review](skills/orphex-weekly-performance-review/SKILL.md) compares aligned periods and explains metric movement.
- [Creative signal review](skills/orphex-creative-signal-review/SKILL.md) weighs creative results against the campaign objective and delivery context.
- [Budget change proposal](skills/orphex-budget-change-proposal/SKILL.md) prepares a quantified proposal with an explicit approval boundary.
- [Landing conversion review](skills/orphex-landing-conversion-review/SKILL.md) finds funnel patterns and testable page hypotheses.
- [Measurement consistency check](skills/orphex-measurement-consistency-check/SKILL.md) reconciles event, attribution, currency, and reporting definitions.

## Install one skill

Install a skill for Codex:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.0.0/skills/orphex-weekly-performance-review --agent codex
~~~

Install it for Claude Code:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.0.0/skills/orphex-weekly-performance-review --agent claude-code
~~~

Replace the final path segment to install another v1.0.0 skill. To browse that release's installable skills first, run:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.0.0/skills --list
~~~

To verify an installed skill, list the selected agent's skills and compare the installed SKILL.md with the corresponding file from the checked-out source tag. The pinned CLI has no dedicated verify or check command:

~~~sh
npx skills@1.7.0 list --agent codex --json
cmp -s skills/orphex-weekly-performance-review/SKILL.md .agents/skills/orphex-weekly-performance-review/SKILL.md
~~~

Remove one skill from a specific agent and scope with:

~~~sh
npx skills@1.7.0 remove orphex-weekly-performance-review --agent codex
npx skills@1.7.0 remove --global orphex-weekly-performance-review --agent codex
~~~

The Skills CLI may retain a copied Codex skill in its shared canonical directory when another detected universal agent uses that path. See [installation guidance](docs/INSTALL.md) for the correct Codex global path and a hash-checked manual cleanup for that case.

See [installation guidance](docs/INSTALL.md) for project and user scope, reviewed-tag updates, and direct file installation.

## Build and validate

Requires Node.js 22 or newer. The repository uses Node standard libraries and has no package dependencies.

~~~sh
npm test
npm run validate
~~~

To generate the ignored catalog, provide the exact source commit and the pinned installer version:

~~~sh
ORPHEX_SKILLS_SOURCE_SHA=$(git rev-parse HEAD) ORPHEX_SKILLS_INSTALLER_VERSION=1.7.0 npm run build:catalog
~~~

Runtime compatibility inside Codex and Claude Code has not yet been verified. Automated checks validate the source format, skill metadata, relationships, and generated catalog contract.

## Project status

This is the private-first source prepared for the v1.0.0 public release. The public release tag and repository visibility are managed separately from source validation.
