# Security policy

Do not put API keys, customer exports, personal data, account identifiers, or other confidential information in issues, pull requests, examples, or skill files.

Report a security issue through GitHub's private vulnerability reporting for this repository. Do not publish an exploitable issue before maintainers have had a reasonable chance to assess it.

The installer guidance invokes the pinned skills CLI to copy a selected skill into an agent directory. Review the command and target before confirming an interactive install. Skill packages contain Markdown instructions and supporting resources. Some include an optional Python calculator at scripts/marketing_math.py.

The calculator reads JSON from stdin and writes JSON results to stdout. It performs offline arithmetic without network access, file writes, subprocesses, or advertising-account changes. It runs only when explicitly invoked with Python 3. Review every installed file, including scripts, against the pinned release; checking only SKILL.md does not establish resource integrity.

Installing a skill does not grant account access or permission to change an advertising account. Skill instructions require separate authorization for specific changes; the connected agent and tools must independently enforce account scope and permissions. Use read-only access for an initial live-account review.

Supported security fixes are handled on the current release line. Maintainers should state affected versions and the first fixed version in the release notes.
