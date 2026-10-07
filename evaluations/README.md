# Behavioral evaluation report and reproducibility

This versioned report separates source/distribution checks from actual native-agent behavior. All cases use complete fictional evidence; no real customer data, advertising-account execution or measured customer performance uplift is established.

## Coverage contract

The suite contains twenty-nine independent behavioral cases, one for every installable skill, plus thirteen routing cases for overlapping jobs and unrelated requests. Each behavioral export differs from its distributed package example. The native prompt receives only the user task, export and supplied business context; grading answers are never copied into the task directory or prompt.

Each case records expected numerical measurements, explicit review judgments and human-review criteria. These are narrow case assertions, not a claim that a skill is universally correct. The single representative case per skill does not replace a larger future adversarial or account-specific evaluation set.

The supported runtime matrix is native Codex and native Claude, each with paired baseline/skill-assisted runs. Routing installs all twenty-nine descriptions and receives natural requests without a target slug. Cases distinguish weekly summary vs investigation; total budget change vs fixed-total transfer vs pacing; tracking instrumentation vs report reconciliation; query cleaning vs mining; and fatigue diagnosis vs creative brief production. Unrelated requests must select no marketing skill.

## Run safely

Requires an authenticated native runtime, Node.js 22 and an isolated local temporary directory. Codex uses the app-provided executable by default, ignores user configuration, uses an ephemeral session and native read-only sandbox. Claude uses restricted mode, project-only settings, empty strict MCP configuration, no persistent session, manual permissions with automatic denial of prompts, and only Read (baseline) or Read/Skill (skilled). Shell, code, writing, agent and network tools are explicitly denied. This is a restricted native tool surface, not an OS sandbox; every actual tool call and absolute canonical task read path is independently checked. Claude does not execute the optional calculator in this evaluation; Codex can execute it in its read-only sandbox.

Baseline disables slash skills. Codex skilled tasks copy exact portable folders into its project skill directory. For the restricted Claude runtime, the runner copies the same byte-identical public folders into a temporary session-only plugin and explicitly loads it with `--plugin-dir`. The evaluation wrapper supplies the `orphex-eval:` namespace only for this run; public source slugs and installer commands are unchanged. Behavioral Claude acceptance requires the actual native Skill result to confirm activation. Routing requires native initialization to discover all installed descriptions, permits no activation for unrelated requests, and returns original source slugs. A direct Read fallback after failed activation is rejected as final native activation evidence. Records preserve wrapper metadata, identity mappings, native discovery and all instruction/resource hashes. No user global skills are overwritten and no advertising tools are configured. Raw tool traces must still be reviewed before acceptance.

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

Recorded on 2026-10-07 for version 2.0.0. The final measurement selection contains 142 records: 29 behavioral cases in baseline and skill-assisted runs for each runtime (58 equal-task pairs), and 13 routing cases per runtime. The exact numerical/decision results below are retained independently of narrative adjudication.

| Runtime / suite | Records | Strict machine passes | Named numerical assertions passed | Native process / schema success |
| --- | --- | --- | --- | --- |
| Codex baseline behavioral | 29 | 17/29 | 53/53 | 29/29 |
| Codex skilled behavioral | 29 | 17/29 | 53/53 | 29/29 |
| Codex skilled routing | 13 | 12/13 | Not applicable | 13/13 |
| Claude baseline behavioral | 29 | 14/29 | 49/53 | 28/29 |
| Claude skilled behavioral | 29 | 16/29 | 53/53 | 29/29 |
| Claude skilled routing | 13 | 12/13 | Not applicable | 13/13 |

All 58 paired tasks match exactly; all 84 final skill-assisted behavioral/routing records match the final installed resource hashes. The 25 assisted behavioral strict failures are exact decision-label mismatches, retained with separate review; they are not promoted to automatic passes. The two routing strict failures are the overlap described below. The selected Claude baseline Creative Signal Review attempt ended with `error_max_structured_output_retries` and no valid final schema. Baseline failure is a measured result, not accepted analysis.

Codex CLI 0.160.1 did not report a model identity, so model equivalence for its pairs is unknown. Claude CLI 2.1.261 reported `claude-opus-5[1m]` and auxiliary `claude-haiku-4-5-20251001` usage for the final behavior runs; auxiliary model use, native retries and runtime metadata are preserved in the records. A CLI version is not a model identifier. Successful routing can recover from failed scoped Read attempts or structured-output retries; the archive retains those intermediate tool errors, and this report does not claim zero tool errors. The restricted Claude matrix uses the disclosed temporary plugin wrapper; a separate ordinary `.claude/skills` activation proof confirms the current public reallocator folder is discovered and activated without that wrapper.

Independent agent reviewers inspected skill content, calculator boundaries, the harness, complete native answers and tool traces, and the rendered frontend. They did not provide human advertiser acceptance. Eleven instruction bodies were strengthened after actual answer findings, including observed spend versus budget settings, unique budget capacity versus delivered costs, aggregate ratios and source definitions, unsupported causal ranking, CRM missingness bounds, feed approval versus serving, and enrollment/maturation feasibility. All affected successful final runs match the installed instruction/resource hashes. Earlier material failures, stale-source runs and process/schema recoveries are preserved rather than overwritten.

The product-profitability rubric originally expected -200 USD when the supplied arithmetic is 2000 - 100 - 100 - 1200 - 150 - 50 - 500 = -100 USD. The gold expectation was corrected, with unchanged native task inputs and raw answers. The grader records the current rubric hash and marks older fixture hashes; this correction is not counted as a skill improvement. Decision-label equivalence is written separately from strict machine passes. In both runtimes, the weekly-diagnosis routing case selects Anomaly Investigation rather than the expected Weekly Performance Review; both cover the supplied request to investigate CPA deterioration and rank falsifiable causes, so the alternative is defensible while its strict failure remains.

Actual successful bundled-helper execution was observed in one Codex skill-assisted record (one command), with a successful `ok:true` calculator output. Nineteen Codex assisted records used local Python arithmetic, including that helper record; local arithmetic is not claimed as bundled-helper execution. Claude had no shell tool in this matrix and performed manual calculations. The optional calculator was tested separately by its arithmetic suite; native use of all 21 bundled helper copies was not established.

The portable file inventory is 195 files. Its digest is `eb4e7144cb7c90331cf07f2ef1d921874b2769dad86bd31fc597c0ba973a86ff`, computed as SHA-256 of `JSON.stringify` of the manifest-ordered array of `{path, sha256}` entries, sorting each folder's relative paths with JavaScript `localeCompare`. The inventory and individual file hashes are included with the evidence. The immutable v2.0.0 source tag and catalog's full `sourceSha` bind release provenance; no pre-merge source SHA is substituted for the release commit.

Download the [native evidence archive](https://github.com/OrphexTech/agent-skills/releases/download/v2.0.0/skills-v2-native-evidence.zip) from the [release](https://github.com/OrphexTech/agent-skills/releases/tag/v2.0.0). It includes the exact final selection, strict grades, separate independent review, source inventory, normal activation proof, UI review/captures and preserved preliminary/correction records. Public files normalize local usernames and temporary filesystem prefixes only; `record-manifest.json` binds original immutable hashes to normalized public-file hashes. Answers, fictional task inputs, native errors, tool calls and grades are not rewritten to pass. Extract it, run `python3 prepare-selected.py`, and run this tag's `scripts/grade_evaluations.mjs` against its prepared `selected-results` directory to reproduce strict scoring.

Early rejected harness attempts are disclosed in the archive: final-only Claude output lacked an inspectable tool trace; one skill-disabling flag prevented native discovery; preliminary plan-mode runs created three unintended fictional plan files outside scratch. Those runs were excluded, the exact files were quarantined without changing unrelated plans, and the final matrix uses the restricted traced invocation described above. Failed native activation or an unreviewable/tool-boundary process cannot be rescued by a plausible direct-read answer.

This is an iterated acceptance suite with one fictional representative case per skill. The same fixtures informed targeted instruction corrections and reruns, so the final selection is not a held-out test or an unbiased first-attempt pass rate. Minor generic wording caveats remain explicitly recorded, including sufficient versus necessary conditions for ratio equality and descriptive decomposition versus causal identification. Strict decision labels do not summarize every useful business judgment. No real account, customer dataset, campaign mutation, authenticated advertiser UAT, universal skill reliability or causal advertising-performance uplift was tested. A different model, source revision, scenario or real-account setup needs fresh evidence.
