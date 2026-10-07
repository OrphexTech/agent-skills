---
name: orphex-experiment-result-reviewer
description: "Review a supplied experiment against its declared design, mature outcomes, uncertainty, and guardrails; allow inconclusive or invalid results without forcing a winner."
license: MIT
metadata:
  version: "2.0.0"
---

# Orphex Experiment Result Reviewer

Evaluate the supplied experiment against its predeclared design and business decision. A higher observed metric is not automatically a statistically supported or economically acceptable winner.

## Verify what was tested

Read the hypothesis, primary outcome/denominator, assignment unit and method, allocation, dates, maturation, exclusion rules, effect criterion, confidence/method, and guardrail thresholds. Check assignment integrity and unexpected sample imbalance without treating its cause as known; identify repeated exposures, contamination, concurrent edits, early stops, or unplanned exclusions. Analyze assigned eligible units under the supplied intention-to-treat rule when appropriate. Platform-optimized ad delivery and simple before/after reports do not establish randomization.

Reconcile arm counts and numerator boundaries, then show absolute rates/counts, absolute effect in percentage points, and relative effect only with a nonzero baseline. Prefer the supplied valid platform/statistical report with its method and scope. The optional helper offers only an independent-binary fixed-horizon normal approximate difference interval. It is unsuitable for small/extreme counts, clustered assignment, revenue/CPA ratios, fractional attribution credits, multiple comparisons, or sequential peeking; do not silently reuse it. Compute with a valid method or explicitly leave inferential status unavailable.

A confidence interval including zero is inconclusive, not evidence of equivalence. Equivalence/noninferiority needs a predeclared meaningful margin and appropriate analysis. Statistical support alone does not satisfy profitability or guardrails. Check mature secondary/guardrail outcomes and do not certify a guardrail without its declared rule. Adjust or disclose multiplicity and the consequences of post-hoc segment picking.

## Decide within scope

Classify the result as supported benefit, supported harm, inconclusive, or invalid under the documented method; describe any unknowns. Recommend rollout only when design, primary effect, maturity, and business guardrails support it. Any follow-up needs a planned decision rule, not indefinite extension until a winner appears. Preserve the current control and keep applying experiments or shifting traffic within explicit authorization.

## Official reference

- [Google experiment scorecards and confidence settings](https://support.google.com/google-ads/answer/6318747?hl=en)

## Portable inputs and examples

- Read [the input contract](references/input-contract.md) when mapping a new export or checking the example's scope and definitions. Copy [the header-only CSV template](assets/input-template.csv) when preparing data; equivalent supplied exports remain acceptable.
- Read [the reusable business context](references/business-context.md) only for business facts or constraints this task needs. Reuse user-supplied facts with their source/date; the template contains no default targets.
- Inspect [the complete fictional input](assets/example-input.csv) with [its example output](references/example-output.md) when learning the output and calculation boundaries. Never use fictional values for a real account.

State whether the result is complete, partial, or blocked for the requested decision. Link material findings to actual supplied rows/sources and separate observed metrics, hypotheses, and estimates. Lead with a short business conclusion, then evidence, uncertainty, and the next measurable check. A data export or installed skill does not authorize account changes.

For the supported arithmetic only, optionally run [the bundled calculator](scripts/marketing_math.py) with Python 3: `python3 scripts/marketing_math.py experiment < calculation.json`. Read its input mapping in the input contract before preparing JSON. It reads JSON, not CSV directly. If Python or the requested method is unavailable, show a reproducible alternative calculation or mark it unsupported; do not report an uncomputed result as verified.
