---
name: orphex-measurement-consistency-check
description: "Reconcile event, attribution, date, identity, and revenue definitions across reports before treating differing totals as tracking failure."
license: MIT
metadata:
  version: "2.0.0"
---

# Orphex Measurement Consistency Check

Compare reports, exports, event dictionaries, and measurement notes supplied by the user. Orphex MCP is optional when it is already available and authorized. The task is to explain what can and cannot be compared from the evidence; do not assume a tracking defect because two systems show different totals.

## Build a definition map

For each source, record:

- event or metric name and business meaning;
- reporting period, timezone, and whether dates describe event, click, or conversion time;
- population and denominator, including filters, deduplication, consent, and bot rules when documented;
- attribution model and lookback window;
- currency and any conversion rate or rounding rule;
- identity or join key and whether counts represent events, sessions, people, or accepted records;
- refresh time, late-arriving data behavior, and export time.

Preserve the source's exact labels, then add a plain-language interpretation. Do not silently normalize two different events into one metric. If a field is missing, mark it unknown. Keep observed values, definition differences, hypotheses, and verification requests in separate columns.

## Reconcile in a useful order

First align dates, timezone, currency, and filters. Then compare the same event and denominator. Next account for attribution, identity, deduplication, and processing delay. Calculate absolute and percentage gaps only when both values are numeric and the comparison basis is clear. Define the direction of the gap, and use an unavailable result when the reference value is zero or missing.

A difference can be expected when systems answer different questions, such as ad-platform attributed conversions versus analytics form events versus CRM accepted leads. Do not describe such a difference as lost conversions or a broken pixel without evidence that the definitions should agree. If definitions align but values still differ, identify a specific test: inspect event IDs across systems, replay a supplied sample, compare timestamps, or check a documented filter. Do not invent identifiers, logs, or backend access.

## Recommended output

Use a source-definition matrix followed by a reconciliation table. Label each row as comparable, comparable with caveat, or not directly comparable, and explain why. Prioritize unresolved discrepancies by impact and testability. State exactly which document, export, sample record, or owner input is needed next.
## Portable inputs and examples

- Read [the input contract](references/input-contract.md) when mapping a new export or checking the example's scope and definitions. Copy [the header-only CSV template](assets/input-template.csv) when preparing data; equivalent supplied exports remain acceptable.
- Read [the reusable business context](references/business-context.md) only for business facts or constraints this task needs. Reuse user-supplied facts with their source/date; the template contains no default targets.
- Inspect [the complete fictional input](assets/example-input.csv) with [its example output](references/example-output.md) when learning the output and calculation boundaries. Never use fictional values for a real account.

State whether the result is complete, partial, or blocked for the requested decision. Link material findings to actual supplied rows/sources and separate observed metrics, hypotheses, and estimates. Lead with a short business conclusion, then evidence, uncertainty, and the next measurable check. A data export or installed skill does not authorize account changes.
