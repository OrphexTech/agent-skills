---
name: orphex-budget-change-proposal
description: "Prepare a quantified marketing budget change proposal from supplied performance data, including portfolio arithmetic, forecast limits, and a clear approval boundary."
license: MIT
metadata:
  version: "1.1.0"
---

# Orphex Budget Change Proposal

Prepare a decision-ready proposal from budgets, performance exports, and planning documents supplied by the user. Orphex MCP may be used when it is already available and the user has authorized that data access; it is optional. A proposal is not permission to change an advertising account.

## Build the proposal

First identify the scope: account or portfolio, campaigns or other budget units, budget type (daily, lifetime, or total), currency, current limits, proposed effective dates, and the user's spend or performance constraint. If a material field is missing, label the assumption or ask for the missing input before presenting a precise change.

Use like-for-like evidence. Check reporting dates and account timezone, attribution window, conversion definition, currency, and whether the input is spend, budget cap, or both. A budget cap is not a spend forecast: delivery may underspend or exceed a daily amount under the platform's pacing rules. Keep revenue and conversion comparisons aligned to the same attribution basis where possible.

For each proposed change, show the current value, proposed value, absolute delta, percentage delta, currency or unit, and effective period. Reconcile portfolio totals before and after. Explain whether the proposal reallocates a fixed amount or increases total exposure. Round only to the platform's stated unit and show the rounding.

Support each recommendation with the supplied marginal evidence, such as recent cost per qualified lead, incremental return, volume, or pacing. Do not assume that adding budget will preserve average efficiency. Average CPA or ROAS does not establish marginal CPA or ROAS. Treat small samples, delayed conversions, mixed objectives, missing spend, and unsettled attribution as limits. If the supplied evidence cannot support a numerical forecast, present a directional hypothesis and the data needed to estimate it.

Rank the proposed changes by expected value and risk. Include a stop or review condition that can be measured, an observation window long enough for the stated conversion lag, and a rollback value. Distinguish an operational guardrail from a predicted outcome.

## Keep account changes authorized

Default to preparing a proposal only. Do not change budgets, bids, campaign status, pacing, or account configuration merely because a proposed change appears in the analysis or an MCP tool is available.

If the user separately asks to apply a change, confirm that their instruction clearly covers the exact account, campaign or budget unit, current and new values, currency, effective time, and any requested stop condition. When any of those details are ambiguous, ask before acting. Use a write-capable tool only if it is available in the current environment and its own authorization rules allow the operation. Report the exact requested and completed changes after an authorized mutation; if no such tool is available, provide the proposal without claiming execution.

## Recommended output

Start with the decision requested and the total portfolio impact. Follow with a table of each change, its evidence, and its key uncertainty. Then state the assumptions, risks, monitoring condition, rollback value, and whether the result is proposal-only or was applied under explicit authorization.

## Example with fictional data

Fictional 14-day data, account timezone America/Los_Angeles, same purchase event and 7-day click window:

| Campaign | Daily cap | Spend | Purchases | Average CPA |
| --- | ---: | ---: | ---: | ---: |
| Search - Brand | $400 | $5,320 | 140 | $38.00 |
| Social - Prospecting | $300 | $3,900 | 78 | $50.00 |

Fictional proposal: move $40/day from Social - Prospecting to Search - Brand, giving daily caps of $440 and $260 and leaving the portfolio cap at $700/day. This is a reallocation hypothesis based on the supplied average CPAs, not a forecast that Search's next purchases will cost $38. Review after the stated purchase lag and restore the prior caps if the agreed efficiency guardrail is breached. Status: proposal only; no account change was made.
