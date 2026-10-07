---
name: orphex-creative-signal-review
description: "Compare creative results for the business objective and plan the next test; optimized delivery does not establish an A/B winner."
license: MIT
metadata:
  version: "2.0.1"
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
## Portable inputs and examples

- Read [the input contract](references/input-contract.md) when mapping a new export or checking the example's scope and definitions. Copy [the header-only CSV template](assets/input-template.csv) when preparing data; equivalent supplied exports remain acceptable.
- Read [the reusable business context](references/business-context.md) only for business facts or constraints this task needs. Reuse user-supplied facts with their source/date; the template contains no default targets.
- Inspect [the complete fictional input](assets/example-input.csv) with [its example output](references/example-output.md) when learning the output and calculation boundaries. Never use fictional values for a real account.

State whether the result is complete, partial, or blocked for the requested decision. Link material findings to actual supplied rows/sources and separate observed metrics, hypotheses, and estimates. Lead with a short business conclusion, then evidence, uncertainty, and the next measurable check. A data export or installed skill does not authorize account changes.

For the supported arithmetic only, optionally run [the bundled calculator](scripts/marketing_math.py) with Python 3: `python3 scripts/marketing_math.py weighted-ratio < calculation.json`. Read its input mapping in the input contract before preparing JSON. It reads JSON, not CSV directly. If Python or the requested method is unavailable, show a reproducible alternative calculation or mark it unsupported; do not report an uncomputed result as verified.
