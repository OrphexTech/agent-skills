# Behavioral evaluation report and reproducibility

This versioned report separates source/distribution checks from actual native-agent behavior. All cases use complete fictional evidence; no real customer data, advertising-account execution or measured customer performance uplift is established.

## Coverage contract

The suite contains twenty-nine representative behavioral cases, one for every installable skill, eight adversarial behavioral cases for six skills, and thirteen routing cases for overlapping jobs and unrelated requests. Each behavioral export differs from its distributed package example and from every other case. The native prompt receives only the user task, export and supplied business context; grading answers, declared equivalent labels and trap notes are never copied into the task directory or prompt.

Each case records expected numerical measurements, explicit review judgments and human-review criteria. These are narrow case assertions, not a claim that a skill is universally correct. The representative cases and the first adversarial set do not replace a larger account-specific evaluation set.

The supported runtime matrix is native Codex and native Claude, each with paired baseline/skill-assisted runs. Routing installs all twenty-nine descriptions and receives natural requests without a target slug. Cases distinguish weekly summary vs investigation; total budget change vs fixed-total transfer vs pacing; tracking instrumentation vs report reconciliation; query cleaning vs mining; and fatigue diagnosis vs creative brief production. Unrelated requests must select no marketing skill.

## Adversarial cases

Representative requests often name the method under review, for example whether an equal-row-average CPA is acceptable, so a careful baseline can avoid the error from the request alone. That fits the 2.1.0 result, where both modes passed every numerical assertion. Adversarial cases ask the business question instead and leave the trap in the data, so a wrong method changes the reported numbers or the decision:

| Case | Trap in the data | Expected result | Naive result |
| --- | --- | --- | --- |
| `budget-pacing-forecast-adversarial-01` | Partial current day in a daily export | 6 completed days; on pace | 7 days; false underpacing |
| `budget-pacing-forecast-adversarial-02` | Flight already ended | 182 USD over budget; no required daily figure | Division by zero; remainder clamped to 0 |
| `campaign-budget-reallocator-adversarial-01` | Shared budget repeated on two campaign rows | 900 USD/day before and after; feasible | 1300 and 1350; blocked |
| `weekly-performance-review-adversarial-01` | Per-row CPA column with a zero-conversion row | CPA 30 to 36, +20% | Row mean shows an improvement |
| `weekly-performance-review-adversarial-02` | USD and GBP accounts, no exchange rate | Per-currency figures; no combined total | 6800 "total"; blended ROAS 3.81 |
| `experiment-result-reviewer-adversarial-01` | Modelled Impact Analysis beside an inconclusive test | Inconclusive | Winner from the model interval |
| `geo-device-breakdown-analysis-adversarial-01` | Device ROAS rows and per-device reach | ROAS 3.36, target met; no deduplicated reach | Mean ROAS 2.87, target missed; reach 185000 |
| `budget-change-proposal-adversarial-01` | Modelled Impact Analysis cited as lift | Exact budget arithmetic; no conversion forecast | About 86 or 120 forecast conversions |

Each adversarial case carries a `trap` object that stays outside the task: the naive answer for reviewers and `skillGuards`, the verbatim SKILL.md sentences that guard against the trap. Source tests require every guard to appear in that skill's SKILL.md, an input used by no other case, at least five skills, and no trap text in either prompt, the task files or the response schema. The cases were written from the instructions, not from observed native answers, and were first run on 2026-10-30, as reported below; gold values were checked with the bundled calculator where it applies. If an instruction is changed in response to these cases, they become iterated acceptance fixtures like the representative set, and a held-out comparison needs new cases.

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

A decision assertion may declare `acceptableLabels`: response labels that answer the request's question the same way as the expected label, such as `inconclusive` for an expected `unknown` when the question is whether a cause or winner is established. The grader keeps `passed` and `criticalFailures` strict and reports `labelEquivalentPassed` separately, per record and per baseline/skill-assisted pair. A declared label marks its check `equivalentLabel` but never changes `passed`; process, tool-boundary, stale-source and changed-task failures fail both scores. Declare labels from the request wording before a run, never because a recorded answer used them. `labelEquivalentPassed` on a record whose `rubricUpdatedSinceRun` is true is post-hoc re-scoring.

Independent review must assess evidence attribution, causal limits, missing-data handling, actionable proposals, permissions and actual tool calls. If a machine judgment differs semantically from a valid narrative, retain the original machine score and record a separate written adjudication. No unsupported measured-uplift claim may be inferred from a pass count or a different-model comparison.

## Rubric and suite changes after 2.1.0

Recorded on 2026-10-30 without a native run; the package version is unchanged. Ten decisions in ten representative cases now declare acceptable labels: `inconclusive` for the expected `unknown` in anomaly-investigation, budget-change-proposal, creative-fatigue-detector, landing-conversion-review, measurement-consistency-check, meta-delivery-audience-review (`overlap_cause`) and weekly-performance-summarizer; `unknown` for the expected `inconclusive` in creative-signal-review and experiment-result-reviewer; and `pass` or `supported` for the expected `recommend` in campaign-budget-reallocator. They were declared from the decision wording without reading the archived 2.1.0 answers, so they are not fitted to those answers and need not cover all 46 adjudicated equivalents. `rejected` is not declared for an expected `unknown`: it rules the cause out, the stronger claim that 2.1.0 review counted as a real error in the Claude baseline Weekly Performance Summarizer and as a defensible alternative, not an equivalent, in the Codex Budget Change Proposal.

Strict `passed` is computed as before, so the 2.1.0 and 2.0.0 tables below are unchanged and still reproduce with each tag's own grader. Task-input hashes are unchanged, so earlier records still pair. Regrading them with the current grader marks them `rubricUpdatedSinceRun`; any label-equivalent pass among them is post hoc, not new evidence or a skill improvement. The [2026-10-30 native run](#native-run-on-2026-10-30) used these rubrics unchanged.

## Evidence needed to show whether the skills help

To show whether the skills help, a run needs:

- Baseline and skill-assisted runs of all thirty-seven behavioral cases on both runtimes against one committed source, with every rubric, acceptable labels included, committed before the first run so that `rubricUpdatedSinceRun` is false for every selected record.
- Strict and label-equivalent pass counts per runtime and mode, with the paired table. A skill-assisted pass on a task whose baseline fails is evidence of help for that case; equal scores remain a measured result.
- Repeated runs of each adversarial pair (for example three, each in its own output directory), because one run per pair cannot separate a skill effect from run-to-run variation on eight cases. Report per-case pass counts, not only totals.
- A reviewer note for each failing adversarial answer stating whether it reproduces the case's `trap.naive` result or makes a different error.
- The archive, hash, trace-review and disclosure rules used for 2.1.0.
- For the connected Orphex path, the separate fixture-server evaluation in the [connected-path plan](CONNECTED_PATH_PLAN.md); the supplied-export matrix cannot establish it.

The 2026-10-30 run below supplies these items for the supplied-export path, except that its evidence archive is not yet published. Neither it nor the connected-path run replaces human advertiser review or a real-account test.

## Native run on 2026-10-30

Recorded on 2026-10-30 against source commit `f9190fc`, after the 2.1.0 release; the package version is unchanged. Every rubric, declared equivalent labels included, was committed in that source before the first run, so no selected record is marked `rubricUpdatedSinceRun`. The installed skill files are byte-identical to 2.1.0: 195 files with the same inventory digest, `546e542999672fbffecc81315f73784c7453c8ee5014f658384f0c216f9c5635`. A later skill source update changes the closing connection paragraph of every SKILL.md. These skill-assisted and routing records match the files before that update, so any source that includes it needs them repeated before it claims this evidence.

The selection contains 238 records:

- 37 behavioral cases in baseline and skill-assisted runs for each runtime, giving 74 equal-task pairs;
- 13 routing cases per runtime;
- two further runs of each of the eight adversarial pairs per runtime, 64 records.

All 238 native processes exited successfully with a schema answer, and every skill-assisted record matches the installed resource hashes. Codex CLI 0.166.0-alpha.5.1 did not report a model identity, so model equivalence for its pairs is unknown. Claude CLI 2.1.306 reported `claude-opus-5-5` for every Claude record. The harness passes its environment to the runtime. The operator's own Claude session set an effort override; it was removed for these runs, so Claude used its CLI default. One smoke record per runtime preceded the matrix; they are retained but not selected.

First run of every case:

| Runtime / suite | Records | Strict machine passes | Label-equivalent passes | Named numerical assertions passed | Native process / schema success |
| --- | --- | --- | --- | --- | --- |
| Codex baseline behavioral | 37 | 24/37 | 32/37 | 77/80 | 37/37 |
| Codex skilled behavioral | 37 | 24/37 | 32/37 | 80/80 | 37/37 |
| Codex skilled routing | 13 | 12/13 | Not applicable | Not applicable | 13/13 |
| Claude baseline behavioral | 37 | 24/37 | 30/37 | 80/80 | 37/37 |
| Claude skilled behavioral | 37 | 22/37 | 28/37 | 79/80 | 37/37 |
| Claude skilled routing | 13 | 12/13 | Not applicable | Not applicable | 13/13 |

On the 29 representative cases alone, strict passes are 18, 17, 17 and 15 (Codex baseline, Codex skilled, Claude baseline, Claude skilled), and label-equivalent passes are 25, 24, 22 and 20. These are not a measured change from 2.1.0. The Codex CLI version differs, and run-to-run variation was measured only for the adversarial cases.

Paired results:

- Codex:
  - Strict scoring: the skill-assisted run passes where the baseline fails on one pair, `budget-pacing-forecast-adversarial-01`.
  - The reverse happens on one pair, `search-term-cleaning-complete-01`, whose skill-assisted answer labels brand exclusion `rejected` instead of `protect`.
  - Label-equivalent scoring gives the same one-for-one result.
- Claude:
  - Strict scoring: no pair passes only with the skill. Two pass only in baseline: Budget Change Proposal, where the skill-assisted answer rejects the guarantee claim, and the representative pacing case, where the skill-assisted answer makes an arithmetic error.
  - Label-equivalent scoring: one pair passes only with the skill (Weekly Performance Summarizer) and three pass only in baseline.

Adversarial pairs over three runs (S strict pass, E label-equivalent pass only, - fail):

| Case | Codex baseline | Codex skilled | Claude baseline | Claude skilled |
| --- | --- | --- | --- | --- |
| `budget-change-proposal-adversarial-01` | SSS | SSS | SSS | SSS |
| `budget-pacing-forecast-adversarial-01` | --- | SSS | SSS | SSS |
| `budget-pacing-forecast-adversarial-02` | SSS | SSS | SSS | SSS |
| `campaign-budget-reallocator-adversarial-01` | EEE | EEE | EEE | EEE |
| `experiment-result-reviewer-adversarial-01` | SSS | SSS | SSS | SSS |
| `geo-device-breakdown-analysis-adversarial-01` | SSS | SSS | SSS | SSS |
| `weekly-performance-review-adversarial-01` | SSS | S-S | SSS | SSS |
| `weekly-performance-review-adversarial-02` | SSS | SSS | SSS | SSS |
| Strict / label-equivalent of 24 | 18 / 21 | 20 / 23 | 21 / 24 | 21 / 24 |
| Numerical assertions of 81 | 72 | 81 | 81 | 81 |

All three Codex baseline answers to the partial-day pacing case:

- model the partial 2026-10-30 row as 0.375 of a day, giving 6.375 elapsed days, a 13703.53 USD projection and 1017.70 USD/day required;
- call the flight underpacing, while noting that the six completed days spent exactly the planned 6000 USD.

That does not reproduce the trap's naive result (7 days, 12480 and 1108.57), but it reaches the same false underpacing judgment by a different error. Every skill-assisted Codex answer used the six completed days. Claude avoided every trap in both modes in all three runs. No other adversarial answer failed a numerical assertion, and none reproduced a naive result.

Independent agent review of the 54 first-run strict failures found:

| Runtime / mode | Equivalent | Defensible alternative | Real error |
| --- | --- | --- | --- |
| Codex baseline | 11 | 1 | 1 |
| Codex skilled | 12 | 1 | 0 |
| Claude baseline | 11 | 2 | 0 |
| Claude skilled | 10 | 4 | 1 |

- **Equivalent (44).** All 28 failures on a declared label have a narrative that matches the expected answer. The 16 undeclared equivalents are `inconclusive` for an expected `hold` (11), `rejected` for `protect` on brand exclusion (3) and `fail` for `rejected` on one-week feasibility (2).
- **Defensible alternatives (8).** Each labels a "proven" or "guaranteed" question `rejected` while the narrative keeps the underlying question open. Six are Claude's.
- **Real errors (2).** One is the Codex baseline partial-day answer above. The other is a Claude skill-assisted pacing answer that computes 2400 + 20 × 240 as 7000 instead of 7200.

The 11 strict failures in the two repeats are eight declared equivalents (`pass` for `recommend` in the reallocator case), the same Codex baseline pacing error twice, and one undeclared equivalent (a Codex skill-assisted `fail` for an expected `rejected`, where the narrative says CPA worsened 20%). The reviewer also flagged rubric wording that invites `rejected` on "proven" and "guaranteed" questions, and several narrative slips the grader cannot see. Those notes are in the archive. Rubrics were not changed after the run, so every strict and label-equivalent score above is measured, not post hoc.

Both routing failures are the weekly-diagnosis overlap described for 2.0.0: both runtimes selected Anomaly Investigation for a request to investigate a CPA deterioration and rank falsifiable causes, again judged defensible.

Tool use:

- **Claude:** every Read stayed in the task directory. All 53 Claude skill-assisted behavioral runs activated the intended skill through the native Skill tool, and no record failed the tool-boundary check. Claude routing selected from the installed descriptions without reading files.
- **Codex:** across 221 commands, none wrote a file, used the network, named a path outside the task directory or exited with an error. The bundled calculator ran once, in the first skill-assisted Experiment Planner run. Python ran in 38 skill-assisted records, that one included, and in one baseline record; apart from that calculator run it was local arithmetic, not bundled-helper execution.

On the supplied-export path, this run does not show the skills raising pass counts. The one consistent difference is the Codex partial-day pacing case, which the skill turned from three failures into three passes. Claude's baseline already avoided every adversarial trap. Claude's lower skill-assisted representative scores come from four `rejected` labels on open questions and one arithmetic error. The connected path shows a larger difference: in its [fixture-server run](CONNECTED_PATH_PLAN.md), under label-equivalent scoring, skill-assisted runs passed 16 of 18 Claude scenario runs against 8 for baseline, and 18 of 18 Codex runs against 16.

These results come from one fictional case per skill plus eight adversarial cases written from the instructions. Each case ran once per mode, except the adversarial cases, which ran three times. There was no human advertiser review, real account or measured uplift.

The raw records, grades, reviews and smoke records are packaged as `skills-eval-2026-10-30-native-evidence.zip` (SHA-256 `985157c2a6d33ea7bab38c7a9cadc84b0cd85c448222dda75db51bfd343ab9bd`), together with the connected-path records. Publishing it as a supplemental release asset is a separate maintainer step that has not happened, so this report does not link it.

## Current release evidence

Recorded on 2026-10-25 for version 2.1.0 against the final installed files. The portable file inventory is 195 files with digest `546e542999672fbffecc81315f73784c7453c8ee5014f658384f0c216f9c5635`, computed with the method described for 2.0.0 below. The final measurement selection contains 142 records: 29 behavioral cases in baseline and skill-assisted runs for each runtime (58 equal-task pairs), and 13 routing cases per runtime. Fixtures and harness are unchanged from 2.0.0. No connector or MCP server was configured, so these runs test the supplied-export path of the new connection-first instructions; the connected Orphex path is not tested by this evidence.

| Runtime / suite | Records | Strict machine passes | Named numerical assertions passed | Native process / schema success |
| --- | --- | --- | --- | --- |
| Codex baseline behavioral | 29 | 17/29 | 53/53 | 29/29 |
| Codex skilled behavioral | 29 | 17/29 | 53/53 | 29/29 |
| Codex skilled routing | 13 | 12/13 | Not applicable | 13/13 |
| Claude baseline behavioral | 29 | 17/29 | 53/53 | 29/29 |
| Claude skilled behavioral | 29 | 16/29 | 53/53 | 29/29 |
| Claude skilled routing | 13 | 12/13 | Not applicable | 13/13 |

All 58 paired tasks match exactly; all 84 final skill-assisted behavioral and routing records match the final installed resource hashes. The 49 behavioral strict failures (24 baseline, 25 skill-assisted) are exact decision-label mismatches, retained and not promoted to passes. Independent adjudication judged 46 equivalent to the expected label, such as `inconclusive` for an expected `unknown` with a narrative that leaves the cause unresolved; two defensible alternatives (Codex Budget Change Proposal rejects the guaranteed-lift claim in both modes while keeping the lift unknown); and one real error, in the Claude baseline Weekly Performance Summarizer, which rejected the supplied budget-cut cause. Both routing failures are the weekly-diagnosis overlap described for 2.0.0 below, again judged defensible.

Codex CLI 0.164.0-alpha.11.1 did not report a model identity, so model equivalence for its pairs is unknown. Claude CLI 2.1.306 reported `claude-opus-5-5` for all 71 Claude records. These runtimes differ from the 2.0.0 matrix, so differences from the 2.0.0 table are not a measured skill change.

The independent content review found that three new connection sections described a modelled Impact Analysis summary as measured lift and creative attribute reads as causal. Those sentences were corrected before acceptance, and the six affected skill-assisted records and all 26 routing records were repeated against the corrected files. The first-pass records are retained in the archive as stale-source records; one harness smoke run per runtime preceded the matrix and is retained but not selected.

Every Claude skill-assisted run activated the intended skill through the native Skill tool, and every Read stayed in the task directory. Codex commands listed or read task files or ran local arithmetic; none wrote files, used the network or named a path outside the task directory, although Codex's login shell sourced the operator's shell profile, whose write the read-only sandbox blocked. The bundled calculator ran successfully in one Codex skill-assisted record (Experiment Planner); seventeen other Codex records used local Python arithmetic, which is not bundled-helper execution. Claude had no shell tool and calculated manually. No skill-assisted answer stalled, asked for a connection or workspace, refused, or claimed connector data; several stated that no connector was used.

Independent agent reviewers inspected the changed skill content and the complete native answers and tool traces of both runtimes; they did not provide human advertiser acceptance. Minor caveats remain recorded in the archive, including untested connected behavior, routing evidence drawn from descriptions alone, an outcome-maturity inconsistency in the anomaly fixture and small answer wording slips. Download the [2.1.0 native evidence archive](https://github.com/OrphexTech/agent-skills/releases/download/v2.1.0/skills-v2.1.0-native-evidence.zip) from the [release](https://github.com/OrphexTech/agent-skills/releases/tag/v2.1.0); extract it, run `python3 prepare-selected.py`, and run this tag's `scripts/grade_evaluations.mjs` against its `selected-results` directory to reproduce strict scoring.

## Version 2.0.0 evidence

Version 2.0.1 changes only each SKILL.md `metadata.version` line and adds per-skill upload archives; every other installed file is byte-identical to 2.0.0. The runs below were recorded against 2.0.0 file hashes and were not repeated for 2.0.1.

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

The portable file inventory is 195 files. Its digest is `eb4e7144cb7c90331cf07f2ef1d921874b2769dad86bd31fc597c0ba973a86ff`, computed as SHA-256 of `JSON.stringify` of the manifest-ordered array of `{path, sha256}` entries, sorting each folder's relative paths with JavaScript `localeCompare`. The inventory and individual file hashes are included with the evidence. The protected v2.0.0 source tag and catalog's full `sourceSha` bind release provenance; no pre-merge source SHA is substituted for the release commit.

Download the [native evidence archive](https://github.com/OrphexTech/agent-skills/releases/download/v2.0.0/skills-v2-native-evidence.zip) from the [release](https://github.com/OrphexTech/agent-skills/releases/tag/v2.0.0). It includes the exact final selection, strict grades, separate independent review, source inventory, normal activation proof, UI review/captures and preserved preliminary/correction records. Public files normalize local usernames and temporary filesystem prefixes only; `record-manifest.json` binds original immutable hashes to normalized public-file hashes. Answers, fictional task inputs, native errors, tool calls and grades are not rewritten to pass. Extract it, run `python3 prepare-selected.py`, and run this tag's `scripts/grade_evaluations.mjs` against its prepared `selected-results` directory to reproduce strict scoring.

For a corrected documentation presentation, use the [supplemental evidence archive](https://github.com/OrphexTech/agent-skills/releases/download/docs-2026-10-07/skills-v2-native-evidence-docs-2026-10-07.zip). All 319 manifest-bound entries and 142 selected records remain byte-identical to the original. Three included UI screenshots now resolve through relative paths; the earlier loading capture was absent from the original asset and is explicitly unavailable. Original root documents are retained under `historical/`. The UI review is historical local evidence, not a current live-site assertion. See the [correction and reproduction guide](../docs/evidence-corrections.md). The original v2.0.0 release predates GitHub immutable-release enforcement; its assets are retained unchanged and its tag is now protected.

Early rejected harness attempts are disclosed in the archive: final-only Claude output lacked an inspectable tool trace; one skill-disabling flag prevented native discovery; preliminary plan-mode runs created three unintended fictional plan files outside scratch. Those runs were excluded, the exact files were quarantined without changing unrelated plans, and the final matrix uses the restricted traced invocation described above. Failed native activation or an unreviewable/tool-boundary process cannot be rescued by a plausible direct-read answer.

This is an iterated acceptance suite with one fictional representative case per skill. The same fixtures informed targeted instruction corrections and reruns, so the final selection is not a held-out test or an unbiased first-attempt pass rate. Minor generic wording caveats remain explicitly recorded, including sufficient versus necessary conditions for ratio equality and descriptive decomposition versus causal identification. Strict decision labels do not summarize every useful business judgment. No real account, customer dataset, campaign mutation, authenticated advertiser UAT, universal skill reliability or causal advertising-performance uplift was tested. A different model, source revision, scenario or real-account setup needs fresh evidence.
