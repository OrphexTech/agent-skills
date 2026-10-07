---
name: orphex-anomaly-investigation
description: "Investigate an unexpected spend, outcome, CPA, or ROAS shift; rank falsifiable causes without treating coincident changes as proof."
license: MIT
metadata:
  version: "2.0.0"
---

# Orphex Anomaly Investigation

Use this skill when someone asks why a marketing metric changed suddenly, whether it is an incident, or what to check first. Work from supplied exports, diagnostics, change records, and documents. Optional Orphex MCP reads may be used within the user's authorized scope. A change log shows timing, not causation or authority to change settings.

## Establish whether the shift is comparable

Record metric and scope, timezone, dates, refresh time, currency, event and denominator, attribution model/window, and whether dates refer to interaction or conversion. Prefer equal-length periods with the same weekdays. Mark partial periods, unsettled conversions, holidays, promotions, or scope changes. Call immature results provisional and name a recheck point. Without a defensible baseline, describe the value without labeling it an anomaly.

Minimum evidence is the metric numerator and denominator, a named comparison period, and the source definition. Daily or campaign rows, delivery status, creative changes, and timestamped changes improve diagnosis. If evidence is missing, ask or leave the question unresolved; do not invent account facts.

Use the supplied values to calculate an absolute difference as current minus reference. Calculate relative change only when the reference is numeric and nonzero. If a baseline is zero, report the movement as “from 0 to N”; do not invent a percentage. Compute CPA as spend divided by the named conversions and ROAS as the consistently attributed revenue divided by spend. A zero or missing denominator makes the ratio unavailable. Recompute portfolio ratios from summed numerators and denominators; never average campaign CPA or ROAS. Component changes add only for the same additive metric and mutually exclusive components. Ratio movements do not have additive campaign contributions.

## Rank causes and test them

Verify the metric and data path first. Check for dropped or duplicated primary events, reporting/import delay, definition or currency changes, or broken joins when evidence points there. A short zero-conversion period alone is not an outage. If diagnostics confirm a primary event stopped, prioritize tracking or delivery before budget tuning.

Compare delivery, pacing, campaign mix, creative, audience/placement, landing or offer changes, seasonality, and conversion lag. Rank hypotheses by impact, evidence, and test speed. State the fact, possible explanation, contrary evidence, falsifiable check, and high/medium/low confidence. Avoid universal alert thresholds. Use a median and dispersion only with sufficient stable matched history, and name the sample size; otherwise keep the comparison descriptive.

Align change-log times to account timezone and event-time basis. A nearby change is a test lead, not causal proof. State what would disconfirm each hypothesis. Experiments or documented holdouts can support causal claims; observational exports support association only.

## Report

Lead with the shift and period maturity. Show current and reference values, absolute and valid relative change, denominator, period, and source. Then list ranked hypotheses, confidence, supporting/contrary evidence, and next checks. Name unresolved currency, timezone, attribution, freshness, or denominator issues. Execute a change only when a current or prior instruction explicitly authorizes the exact account scope and action, and an available write path permits it; otherwise provide a proposal.

Fictional boundary case: a dashboard shows 0 purchases for a partial Tuesday versus 2 the prior Tuesday, while conversions can arrive after the report refresh. Mark CPA unavailable for the current day and keep the finding provisional. A budget edit recorded Monday raises a testable hypothesis but does not establish the cause. Request a mature same-weekday export and the event diagnostic before escalating it as an outage.

## Official references

- [Google Ads conversion tracking status and troubleshooting](https://support.google.com/google-ads/answer/12674892?hl=en)
- [Google Analytics cross-channel conversion reporting](https://support.google.com/analytics/answer/16638051?hl=en)

## Portable inputs and examples

- Read [the input contract](references/input-contract.md) when mapping a new export or checking the example's scope and definitions. Copy [the header-only CSV template](assets/input-template.csv) when preparing data; equivalent supplied exports remain acceptable.
- Read [the reusable business context](references/business-context.md) only for business facts or constraints this task needs. Reuse user-supplied facts with their source/date; the template contains no default targets.
- Inspect [the complete fictional input](assets/example-input.csv) with [its example output](references/example-output.md) when learning the output and calculation boundaries. Never use fictional values for a real account.

State whether the result is complete, partial, or blocked for the requested decision. Link material findings to actual supplied rows/sources and separate observed metrics, hypotheses, and estimates. Lead with a short business conclusion, then evidence, uncertainty, and the next measurable check. A data export or installed skill does not authorize account changes.

For the supported arithmetic only, optionally run [the bundled calculator](scripts/marketing_math.py) with Python 3: `python3 scripts/marketing_math.py weighted-ratio < calculation.json`. Read its input mapping in the input contract before preparing JSON. It reads JSON, not CSV directly. If Python or the requested method is unavailable, show a reproducible alternative calculation or mark it unsupported; do not report an uncomputed result as verified.
