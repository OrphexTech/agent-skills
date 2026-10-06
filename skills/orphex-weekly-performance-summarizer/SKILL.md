---
name: orphex-weekly-performance-summarizer
description: "Summarize supplied weekly marketing results into a concise stakeholder update with comparable metrics, evidence-backed movement, caveats, and the next useful action."
license: MIT
metadata:
  version: "1.1.0"
---

# Orphex Weekly Performance Summarizer

Use this skill when someone needs a short weekly or period update for a stakeholder, team meeting, or decision brief. It turns supplied reports into a clear narrative, not a full diagnostic review. Optional Orphex MCP reads may be used within the user's authorized scope. Never imply that the account was checked when the only evidence is user-provided.

## Confirm scope and maturity

Record the business objective, included accounts and channels, current and comparison dates, timezone, refresh time, currency, conversion event and denominator, attribution model/window, and whether dates mean ad interaction or conversion. Prefer equal-length periods with the same weekday mix. If the current week is partial, label it partial and compare equal elapsed days only when their weekday mix is comparable. If conversion lag or reporting delay is material, call results preliminary and name the recheck date. With no sound comparison period, write a current-state update rather than inventing a trend.

Minimum input is a named reporting period, a source, and at least one objective-linked metric with its numerator and denominator. Campaign or channel detail, budget constraints, major promotion dates, and change records help explain movement. If reports mix currencies, show separate currency rows; convert only with a supplied exchange rate and date. If an input is missing, name it in one caveat and keep the summary useful with the evidence that exists.

## Calculate the story accurately

For additive measures such as spend, impressions, clicks, or distinct event counts, sum only non-overlapping rows with aligned scope. Do not sum the same attributed conversion claimed by multiple platforms into a cross-channel total. Recompute aggregate CTR, conversion rate, CPA, or ROAS from aligned total numerators and denominators; never average campaign rates. Label every conversion-rate denominator. Calculate absolute change as current minus prior. Relative change is `(current − prior) / prior` only when prior is numeric and nonzero. For a zero baseline, state “from 0 to N” and omit the percentage. Distinguish percentage points in a rate from percent change in the rate.

Explain only what the evidence supports. A spend increase alongside more conversions is a movement, not proof that spend caused the increase. Attribute additive contributions only across comparable, disjoint components and only for the same metric. Treat budget-change timestamps as context rather than causal proof. Use plain language for likely drivers and mark them as hypotheses when no experiment, holdout, or direct diagnostic establishes cause. Do not add an arbitrary alert threshold.

## Write the update

Lead with the business result in one sentence. Add a compact table with the few metrics that answer the stated question: current, previous, absolute or valid relative change, unit/denominator, period, and source. Include one to three prioritized next actions when evidence supports them; if evidence is thin, recommend one best next check instead of manufacturing a list. Each action should name an owner if supplied, the condition to monitor, and when to revisit after data matures. Label confidence as high, medium, or low based on source quality, comparability, and maturity. Adapt length to the user; a 300–500 word update is a useful default, not a fixed requirement.

Fictional boundary case: Monday–Wednesday is incomplete. Search spend is USD and Social spend is EUR; both platforms claim the same fictional purchases under different attribution windows. Do not publish a combined spend or conversion total, and do not claim a cross-channel cause. Report separate currency rows, label the period partial, and make one next action: rerun the same-scope comparison after the conversion window settles, with event definitions aligned.

## Official references

- [Google Analytics cross-channel conversion reporting](https://support.google.com/analytics/answer/16638051?hl=en)
- [Google Ads conversion tracking status, reporting latency, and attribution date](https://support.google.com/google-ads/answer/12674892?hl=en)
