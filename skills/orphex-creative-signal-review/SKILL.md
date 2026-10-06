---
name: orphex-creative-signal-review
description: "Review paid creative results against the campaign objective and delivery context, separating early signals from evidence strong enough to guide a next test."
license: MIT
metadata:
  version: "1.0.0"
---

# Orphex Creative Signal Review

Compare creative results using data and creative descriptions supplied by the user. Orphex MCP is optional when available and authorized. Do not assume access to an ad account, asset library, or unprovided creative files.

## Establish a fair comparison

Ask what decision the review should support: generate awareness, qualified traffic, leads, purchases, or another stated objective. Record the optimization event and the metric that should decide the next step. A high click-through rate may help diagnose a traffic ad, but it does not make a creative a conversion winner when the objective is qualified leads or sales.

For an awareness objective, prioritize supplied reach to the intended audience, frequency distribution, and brand-lift or recall measures when their survey design and comparison basis are documented. Treat CTR as a secondary creative diagnostic; by itself it does not show that more of the intended audience noticed or remembered the message.

For each asset, collect its ID or supplied name, concept or format, dates, spend, impressions, reach or frequency when available, clicks, landing visits, and downstream outcomes. Compare assets only after checking audience, placement, bid or optimization event, offer, landing page, attribution window, currency, and delivery period. If these differ, segment or state why the comparison is directional.

Calculate only metrics supported by the supplied fields. Common examples are CTR = clicks / impressions, CPC = spend / clicks, conversion rate = conversions / clicks or visits (name the denominator), and CPA = spend / conversions. Show counts and denominators alongside rates. Mark undefined ratios as unavailable instead of inventing a value. Separate platform-attributed outcomes from CRM-accepted outcomes.

Use delivery volume to describe maturity, not to apply a universal minimum. There is no single impression, click, or conversion threshold that proves a creative has won. If random assignment and experiment design are not documented, do not present small observed differences as causal or statistically conclusive. Note that early data may change as spend, placement, frequency, or delayed conversions accumulate.

## Turn signals into a next test

Classify each conclusion as an observed result, a plausible explanation, or a proposed test. Identify the strongest signal for the stated objective and the main counter-signal. Check whether apparent fatigue is supported by time-series movement in frequency and outcomes; do not infer it from age alone.

Recommend a bounded next test that changes a clear creative element, keeps audience and delivery conditions comparable where practical, and names the primary metric and guardrail. Avoid changing concept, offer, landing page, and targeting together if the goal is to learn which change mattered. Keep the recommendation proportional to spend and sample uncertainty.

## Recommended output

Give the objective and comparison scope first. Use a table with creative, delivery, primary outcome, observed signal, and confidence limit. End with the next test, the metric that will decide it, and the evidence needed before scaling.

## Example with fictional data

Fictional 7-day purchase campaign; two assets received the same audience, placement mix, optimization event, and attribution window:

| Asset | Spend | Impressions | Clicks | Purchases | CTR | CPA |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Cedar - product demo | $2,400 | 120,000 | 1,920 | 96 | 1.60% | $25.00 |
| Harbor - founder story | $2,400 | 120,000 | 2,400 | 72 | 2.00% | $33.33 |

Fictional read: Harbor has the higher CTR, while Cedar has more purchases at lower average CPA. With no documented random assignment or uncertainty analysis, treat Cedar as the stronger observed purchase signal rather than a proven causal winner. A useful next test is to retain Cedar's opening demonstration and vary only its closing offer, with purchase CPA primary and click-through rate as a diagnostic.
