# Behavioral evaluation report and reproducibility

This versioned report separates source/distribution checks from actual native-agent behavior. All cases use complete fictional evidence; no real customer data, advertising-account execution or measured customer performance uplift is established.

## Coverage contract

The suite contains twenty-nine independent behavioral cases, one for every installable skill, plus thirteen routing cases for overlapping jobs and unrelated requests. Each behavioral export differs from its distributed package example. The native prompt receives only the user task, export and supplied business context; grading answers are never copied into the task directory or prompt.

Each case records expected numerical measurements, explicit review judgments and human-review criteria. These are narrow case assertions, not a claim that a skill is universally correct. The single representative case per skill does not replace a larger future adversarial or account-specific evaluation set.

The supported runtime matrix is native Codex and native Claude, each with paired baseline/skill-assisted runs. Routing installs all twenty-nine descriptions and receives natural requests without a target slug. Cases distinguish weekly summary vs investigation; total budget change vs fixed-total transfer vs pacing; tracking instrumentation vs report reconciliation; query cleaning vs mining; and fatigue diagnosis vs creative brief production. Unrelated requests must select no marketing skill.

## Run safely

Requires an authenticated native runtime, Node.js 22 and an isolated local temporary directory. Codex uses the app-provided executable by default, ignores user configuration, uses an ephemeral session and native read-only sandbox. Claude uses project-only settings, empty strict MCP configuration, no persistent session, plan permissions and a limited Read/Bash/Skill surface. Baseline disables slash skills; skilled tasks copy the exact portable folder into the runtime's project skill directory. No user global skills are overwritten and no advertising tools are configured. Raw tool traces must still be reviewed before acceptance.

~~~sh
npm run evaluate -- --runtime codex --mode baseline --cases all --output /tmp/orphex-v2-baseline-codex
npm run evaluate -- --runtime codex --mode skilled --cases all --output /tmp/orphex-v2-skilled-codex
npm run evaluate -- --runtime claude --mode baseline --cases all --output /tmp/orphex-v2-baseline-claude
npm run evaluate -- --runtime claude --mode skilled --cases all --output /tmp/orphex-v2-skilled-claude
npm run evaluate -- --runtime codex --mode skilled --suite routing --cases all --output /tmp/orphex-v2-routing-codex
npm run evaluate -- --runtime claude --mode skilled --suite routing --cases all --output /tmp/orphex-v2-routing-claude
npm run evaluate:grade -- /tmp/orphex-v2-skilled-codex
~~~

Use a fresh output directory for reruns; the harness refuses to overwrite an actual run record. `--binary PATH` selects an available native executable without changing the user's installation. `--timeout MILLISECONDS` bounds each process. Preserve baseline and skilled records together in a review directory to generate paired results. Do not alter raw responses to satisfy the rubric.

## Evidence and grading

Actual-run records retain the task, input, supplied context, raw stdout/stderr, native response metadata, structured answer, command invocation, timestamps, process state and instruction/resource hashes. Runtime-reported model metadata is recorded when available; absent model metadata stays explicitly unknown rather than guessed. A CLI version is separate from a model identity.

Machine checks score calculations and explicit case judgments, not headings or keyword counts. Failed/timed-out/spawn-error/native-error processes cannot pass, even if they contain a plausible answer. Skilled runs must match every final installed file hash; changed instructions/resources require a rerun. Exact task-input hashes establish paired comparability. Corrected scoring rubrics are separately disclosed without changing the original raw evidence.

Independent review must assess evidence attribution, causal limits, missing-data handling, actionable proposals, permissions and actual tool calls. If a machine judgment differs semantically from a valid narrative, retain the original machine score and record a separate written adjudication. No unsupported measured-uplift claim may be inferred from a pass count or a different-model comparison.

## Current release evidence

The release owner fills this section with actual matrix counts, reviewed findings, source digest and reproducible run/report links after the native runs finish. Source-format tests, portable-file checks and evaluation-fixture availability do not count as behavioral completion. Until actual reviewed results are recorded, the suite is prepared and behavioral acceptance remains pending.
