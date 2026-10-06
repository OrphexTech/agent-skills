---
name: orphex-weekly-performance-review
description: "Review weekly or monthly marketing performance from supplied exports and documents, aligning comparison periods, metric definitions, currency, and attribution limits."
license: MIT
metadata:
  version: "1.0.0"
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

## Example with fictional data

Fictional paid search account, same campaigns, USD, account timezone America/Los_Angeles, Monday-Sunday weeks, same lead event and 7-day click window:

| Metric | Sep 7-13 | Sep 14-20 | Change |
| --- | ---: | ---: | ---: |
| Spend | $12,000 | $13,800 | +$1,800 (+15.0%) |
| Leads | 360 | 380 | +20 (+5.6%) |
| Cost per lead | $33.33 | $36.32 | +$2.99 (+9.0%) |

Fictional read: spend rose faster than leads, so average cost per lead increased about 9.0%. This comparison does not identify the cause; no campaign-level changes, mix, or lag breakdown was supplied. Check campaign and query mix after the 7-day lead window settles before deciding whether to trim or reallocate budget.
