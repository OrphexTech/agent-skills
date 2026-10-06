# Install a skill

The repository follows the skills directory convention: every skill is a directory containing SKILL.md. Install one selected directory with the pinned skills CLI version 1.7.0.

## Choose an agent and scope

Project installation is useful when the skill should be shared with a repository. Run the command from that repository and choose the target agent:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.1.0/skills/orphex-weekly-performance-review --agent codex
~~~

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.1.0/skills/orphex-weekly-performance-review --agent claude-code
~~~

Use the installer's global option when the skill should be available across projects:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.1.0/skills/orphex-weekly-performance-review --agent codex --global
~~~

The installer may ask whether to copy or link files and where to place a project-level skill. Review its displayed target before accepting. List the installable skills in the pinned release without installing:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.1.0/skills --list
~~~

Expected agent skill directories are:

| Agent | Project scope | User scope |
| --- | --- | --- |
| Codex | .agents/skills/<slug>/SKILL.md | ~/.agents/skills/<slug>/SKILL.md |
| Claude | .claude/skills/<slug>/SKILL.md | ~/.claude/skills/<slug>/SKILL.md |

Skills CLI 1.7.0 treats Codex as a universal agent and uses its shared `.agents/skills` directory for both project and user scope. This is the pinned installer's target; it does not use `$CODEX_HOME/skills` for these commands. The installer can use shared source directories and links internally. The selected agent's discovery path and the final target displayed by the installer are the source of truth for a particular installation.

## Verify an installation

The v1.7.0 CLI can list installed skills in JSON, but its command set has no dedicated verify or check command. Use list to confirm registration, then compare the installed file with the checked-out source tag to verify its bytes. For project-scoped Codex:

~~~sh
npx skills@1.7.0 list --agent codex --json
cmp -s skills/orphex-weekly-performance-review/SKILL.md .agents/skills/orphex-weekly-performance-review/SKILL.md
~~~

For Claude, compare with .claude/skills/<slug>/SKILL.md. For a user-scope install, use the corresponding global path from the table above. The CLI list command can filter by agent and global scope:

~~~text
npx skills@1.7.0 list --agent claude-code --json
npx skills@1.7.0 list --global --agent codex --json
npx skills@1.7.0 list --global --agent claude-code --json
~~~

See the pinned [Skills CLI v1.7.0 command help](https://github.com/vercel-labs/skills/blob/v1.7.0/src/cli.ts) for its supported list, add, and remove options.

## Update to a reviewed release

A folder URL remains pinned to its selected tag. An existing v1.0.0 installation does not become v1.1.0 by re-running its old command or using the CLI update command. To move to the reviewed v1.1.0 release, install that tag's skill folder explicitly; the installer will ask before replacing an existing copy:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.1.0/skills/orphex-weekly-performance-review --agent codex
~~~

Replace v1.1.0 with the reviewed release tag and change the skill slug and agent as needed. Run the command from the same project for a project installation. Add --global for user scope.

## Remove an installation

Remove only the selected skill, agent, and scope:

~~~sh
npx skills@1.7.0 remove orphex-weekly-performance-review --agent codex
npx skills@1.7.0 remove --global orphex-weekly-performance-review --agent codex
~~~

Use claude-code to target Claude. The CLI prompts before removal unless --yes is supplied.

The Skills CLI can preserve a canonical skill directory when another detected universal agent shares that location. For Codex, the canonical directory is `.agents/skills/<slug>` in a project and `~/.agents/skills/<slug>` for user scope. The file may therefore remain after `remove --agent codex` even when that command exits successfully. If you intend to remove the skill for every universal agent sharing that location, first compare the retained file to the reviewed source, then remove only that skill directory. For example, from a checkout of the reviewed release:

~~~sh
source_root="/absolute/path/to/reviewed/agent-skills"
project_root="/absolute/path/to/target/project"
skill="orphex-weekly-performance-review"
cmp -s "$source_root/skills/$skill/SKILL.md" "$project_root/.agents/skills/$skill/SKILL.md" && rm -r -- "$project_root/.agents/skills/$skill"
cmp -s "$source_root/skills/$skill/SKILL.md" ~/.agents/skills/$skill/SKILL.md && rm -r -- ~/.agents/skills/$skill
~~~

Each command verifies the installed bytes before deletion and targets only that slug. Deleting a shared Codex canonical copy removes it for all universal agents using the same shared directory. Leave it in place if another agent should continue using the skill. The CLI's preservation behavior is documented in its pinned [v1.7.0 removal source](https://github.com/vercel-labs/skills/blob/v1.7.0/src/remove.ts).

For manual installation, copy the selected skill directory intact into the agent's skills directory. The directory must retain its SKILL.md filename. The skill body may refer to supporting files through relative links; copy those with it if a future release adds them.

These are distribution instructions, not a claim that runtime loading has been tested in either agent product. Confirm agent behavior in the target environment before relying on it for operational decisions.
