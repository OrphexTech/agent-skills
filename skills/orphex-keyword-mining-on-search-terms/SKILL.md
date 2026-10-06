---
name: orphex-keyword-mining-on-search-terms
description: "Mine supplied Search terms for converting or high-intent demand that may merit keyword coverage, with evidence-ranked candidates and eligibility checks."
license: MIT
metadata:
  version: "1.1.0"
---

# Orphex Keyword Mining on Search Terms

Use this skill to identify observed queries that could justify a keyword test or a more deliberate ad-group mapping. Analyze only user-supplied exports and documents unless an already-authorized read-only source is available. Produce candidates and checks; do not add keywords or change campaigns.

## Minimum evidence and fallback

Request a Search terms export with dates and timezone, currency, campaign/ad-group identifiers, query, matched keyword, reported match type, impressions, clicks, cost, conversions and value where available. For coverage review, also request the current keyword inventory with configured match type, status, scope, final URL or landing page, negatives and relevant campaign eligibility settings. Ask for the business goal, target regions/languages, approved product names, conversion definition, attribution window and expected conversion lag.

Without the keyword inventory, label all coverage conclusions “unverified” and present only observed query candidates. Without conversion or lag context, describe intent from the query text and available engagement, not as proven business value. Search term reports can omit low-activity queries for privacy, and conversion totals can shift while attribution settles. A visible list is evidence of reported queries, not a complete map of demand. Google's [Search terms report guide](https://support.google.com/google-ads/answer/2472708?hl=en) explains the report's keyword and match-type columns and its visibility limits.

## Test coverage semantically, not by string lookup

Group repeated rows by normalized query while preserving the original query, date, network, and entity. Keep brand and nonbrand separate when the user supplied a reliable brand definition. Rank evidence using observed conversions/value, cost, click volume, query intent against the supplied offer, recency, and repeat occurrence. Do not invent a numeric score or call a candidate “high intent” from lexical resemblance alone. State which evidence makes each candidate stronger or weaker.

Compare each query with eligible existing keywords and the reported triggering keyword. Search matching can include close variants and meaning-based matching, so a phrase not literally present in a keyword is not necessarily uncovered. The report's match type may describe a narrower relationship than the configured keyword type. Check active/paused status, campaign and ad-group scope, negative keywords, geography/language, network, landing-page relevance, and any supplied budget or policy limits. If eligibility details are missing, report “served through existing matching” or “coverage unknown,” not “uncovered.” Review [keyword matching options](https://support.google.com/google-ads/answer/7478529?hl=en) for current positive-match behavior.

## Recommend a candidate and test shape

Prefer a candidate when the observed query shows business-relevant conversions or value and the current mapping is unclear, weakly aligned, or not intentionally managed. Suggest exact match to isolate a proven query; use phrase or broad only for an accepted exploration with a query-review plan. This is a test design, not a universal rule. Suggest an ad group only when its theme and landing page align with the query; otherwise state what destination or structure needs review first. Include negative conflicts and potential duplication with current coverage.

For every recommendation, preserve observed counts and denominators: conversions per query, cost per conversion only when conversions are nonzero and comparable, and conversion value/cost only when both definitions and currency match. Do not project future clicks, conversion volume, or savings from the historical row. A single query's average outcome does not establish incremental lift from adding a keyword.

## Output and authorization

Start with scope, date range, currency, conversion definition, lag status, and missing eligibility evidence. Use a table with candidate query; evidence and source rows; matched keyword and reported type; current coverage assessment; negative/eligibility conflicts; suggested keyword text and match type; proposed ad group/landing page; observed metrics; risk; confidence; and next review. Distinguish “candidate,” “already covered,” “coverage uncertain,” and “do not add.” Include a short validation plan using query-level delivery and business outcomes after the conversion window.

Fictional example: “industrial hose inspection service” produced three leads in a supplied 60-day export, but the visible matched keyword is a broad “hose repair” term. If the campaign inventory and negatives confirm the candidate is eligible but not deliberately mapped, propose a reviewed exact-match test in the matching service ad group. Three historic leads support investigation; they do not forecast future leads or prove incremental demand.

Adding, pausing, or editing keywords requires explicit authorization for the account and exact campaign action; installation and exports grant none.
