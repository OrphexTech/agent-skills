---
name: orphex-bid-strategy-learning-review
description: "Review Google Ads bidding goals, reported learning status, conversion delay, and delivery constraints before proposing strategy or target changes."
license: MIT
metadata:
  version: "2.1.0"
---

# Orphex Bid Strategy & Learning Review

Review the fit between the user's business goal, biddable conversion signal, actual strategy, and observed delivery. Preserve current platform strategy names; label changes do not establish behavior changes.

## With an Orphex connection

If an Orphex connector is available, check it before asking for exports. Run `capability_search` with platform `orphex` and limit 100; use a read only if that search returns its id, and ask which workspace to use when several are bound. Read `controller.catalog` then `controller.fetch` at level `campaign` for mature spend, conversions and value over equal intervals. Strategy, target, goal and status are live Google Ads reads: run `capability_search` with platform `google` and use `platform_management.configuration_read` for delivery, bidding and budget settings, `platform_management.conversion_goals_read` for the biddable goals, `platform_management.changes_read` for strategy, target and goal edit dates, and `platform_management.simulation_read` for Google's modelled target scenarios, only when that search returns them. Then list guides with `skill_catalog` (kind `guide`, topic `platform_reads`, then `measurement`) and follow a matching one through `skill_read`; choose by title, never by a stored id.

If a read is not returned, this connection cannot reach that Orphex data for the workspace: say so, then use the live platform reads it offers or the supplied exports. An absent, refused or empty read is not evidence of zero, none or healthy. Describe each read with `capability_describe` before `run_read`, keep `date_end` no later than yesterday, disclose request adjustments, and name each number's source, workspace and window. When the search returns `brand_memory.read`, read the entries that bear on this task and cite them by number; list `skill_catalog` entries of kind `context` for declared facts and targets, and treat a declared target as a goal, not a measured value. This skill's evidence rules still govern any guide, insight, playbook label, memory entry or context, and no read authorizes account changes. Ask the user only for what is still missing.

## Assess the supplied strategy

Establish the primary versus secondary conversion goals, value definition, conversion/import delay, strategy scope (campaign/portfolio), target and average target over the interval, budgets, status reason, eligibility, and change dates. Distinguish a missing goal or import problem from a restrictive target, capped spend, policy/eligibility issue, or ordinary reporting delay. Compare mature equal-length intervals; do not treat recent incomplete conversions as deterioration.

Read the actual strategy status and its reason. A strategy/composition or goal change can require calibration; a target edit does not universally reset Smart Bidding learning. Do not recommend a fixed percentage step, conversion threshold, or universal waiting period as a rule. Use the supplied reporting cycle, platform guidance for the actual strategy, and the account's business constraints. A target CPA is not a per-conversion ceiling; target ROAS and attributed values are not profit.

Rank constraints using observed evidence. Historical average CPA/ROAS and target simulators have different meanings; simulator outputs are modeled scenarios with stated dates/scope, not guarantees. Recommend a target change only when its objective, bound, feasibility, and monitoring condition are supported. If goals or measurement are unreliable, resolve that before economically interpreting bidding performance.

## Deliver a decision

Report strategy fit, actual status, mature metrics, supported constraints, unknowns, and a review point after conversions/imports mature. Keep strategy, target, and goal changes as proposals unless the specific changes and account write path are authorized. Preserve prior settings for a requested rollback; do not switch goals merely to collect more events.

## Official references

- [Google Smart Bidding learning and target changes](https://support.google.com/google-ads/answer/10970825?hl=en)
- [Google learning status reasons](https://support.google.com/google-ads/answer/13020501?hl=en)

## Portable inputs and examples

- Read [the input contract](references/input-contract.md) when mapping a new export or checking the example's scope and definitions. Copy [the header-only CSV template](assets/input-template.csv) when preparing data; equivalent supplied exports remain acceptable.
- Read [the reusable business context](references/business-context.md) only for business facts or constraints this task needs. Reuse user-supplied facts with their source/date; the template contains no default targets.
- Inspect [the complete fictional input](assets/example-input.csv) with [its example output](references/example-output.md) when learning the output and calculation boundaries. Never use fictional values for a real account.

State whether the result is complete, partial, or blocked for the requested decision. Link material findings to actual supplied rows/sources and separate observed metrics, hypotheses, and estimates. Lead with a short business conclusion, then evidence, uncertainty, and the next measurable check. A data export or installed skill does not authorize account changes.

For the supported arithmetic only, optionally run [the bundled calculator](scripts/marketing_math.py) with Python 3: `python3 scripts/marketing_math.py weighted-ratio < calculation.json`. Read its input mapping in the input contract before preparing JSON. It reads JSON, not CSV directly. If Python or the requested method is unavailable, show a reproducible alternative calculation or mark it unsupported; do not report an uncomputed result as verified.
