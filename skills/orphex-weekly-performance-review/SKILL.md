---
name: orphex-weekly-performance-review
description: "Review marketing period changes and diagnose evidence-backed drivers from supplied comparable exports; use the summarizer for a short stakeholder update."
license: MIT
metadata:
  version: "2.0.0"
---

# Orphex Weekly Performance Review

Turn marketing exports and documents supplied by the user into a concise, decision-ready period review. Orphex MCP may be used when available and authorized, but is optional. Never imply that data was fetched or verified when the user supplied no source for it.

## Make the comparison valid

Confirm the business question, reporting timezone, exact current and comparison dates, campaign scope, currency, conversion event, attribution model and window, and data refresh time. Prefer equal-length periods with the same weekday mix. For a week-over-week comparison, check for incomplete current days, holidays, promotion changes, and conversion lag. If the periods or definitions differ, explain the mismatch and qualify or withhold the comparison.

Keep the source and definitions attached to every metric. Distinguish spend from budget cap, clicks from landing visits, platform-attributed outcomes from CRM outcomes, and gross revenue from net revenue. Convert currencies only when an explicit rate and date are supplied; otherwise report currencies separately. Do not combine unlike account currencies into a single total.

Calculate only metrics whose inputs and definitions are present:

- CTR = clicks / impressions
- CPC = spend / clicks
- conversion rate = named conversions / a named denominator
- CPA = spend / named conversions
- ROAS = named revenue / spend

Show counts with rates and specify the denominator. Mark a ratio unavailable when its denominator is zero, missing, or ambiguous. Report both absolute and relative movement where valid; do not express percentage change from a zero or missing baseline. Reconcile totals against the supplied source before explaining trends.

## Separate evidence from explanation

Describe the largest movements first, ranked by business impact and confidence. Tie each observation to its period, scope, and source. A change in CPA or ROAS is not proof that a campaign edit caused the change. Separate observed movement, plausible drivers, and tested causal evidence. Use experiments or documented holdouts for causal claims; if none are supplied, say what the data cannot establish.

Consider delivery, budget pacing, audience or channel mix, creative rotation, landing-page changes, offer, seasonality, attribution lag, and measurement changes only when the supplied evidence supports them. Treat unexplained movement as a question to investigate, not a finding. Distinguish the average performance of existing spend from the likely marginal result of additional spend.

End with a small set of prioritized actions. Each action should name an owner or decision when supplied, the evidence behind it, a next measurement, and a check-in period that accounts for conversion lag. Do not invent thresholds or make platform changes.

## Recommended output

Start with the decision or headline. State the scope and comparability limits, then use a table for period values, absolute and relative movement, and source. Follow with evidence-backed drivers, uncertainties, and prioritized next actions.
## Portable inputs and examples

- Read [the input contract](references/input-contract.md) when mapping a new export or checking the example's scope and definitions. Copy [the header-only CSV template](assets/input-template.csv) when preparing data; equivalent supplied exports remain acceptable.
- Read [the reusable business context](references/business-context.md) only for business facts or constraints this task needs. Reuse user-supplied facts with their source/date; the template contains no default targets.
- Inspect [the complete fictional input](assets/example-input.csv) with [its example output](references/example-output.md) when learning the output and calculation boundaries. Never use fictional values for a real account.

State whether the result is complete, partial, or blocked for the requested decision. Link material findings to actual supplied rows/sources and separate observed metrics, hypotheses, and estimates. Lead with a short business conclusion, then evidence, uncertainty, and the next measurable check. A data export or installed skill does not authorize account changes.

For the supported arithmetic only, optionally run [the bundled calculator](scripts/marketing_math.py) with Python 3: `python3 scripts/marketing_math.py weighted-ratio < calculation.json`. Read its input mapping in the input contract before preparing JSON. It reads JSON, not CSV directly. If Python or the requested method is unavailable, show a reproducible alternative calculation or mark it unsupported; do not report an uncomputed result as verified.
