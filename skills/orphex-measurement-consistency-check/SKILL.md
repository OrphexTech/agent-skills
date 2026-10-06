---
name: orphex-measurement-consistency-check
description: "Reconcile marketing metric and event definitions across supplied reports so apparent differences are explained by scope before being treated as tracking failures."
license: MIT
metadata:
  version: "1.0.0"
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

## Example with fictional data

Fictional exports for the same seven calendar days and UTC dates:

| Source | Reported total | Event meaning | Attribution or identity rule |
| --- | ---: | --- | --- |
| Ad platform | 102 | Attributed lead conversion | 7-day click, 1-day view |
| Web analytics | 91 | Form submit event | Session last non-direct |
| CRM | 84 | Unique accepted leads | Deduplicated by CRM lead ID |

Fictional read: the totals differ, but their definitions also differ. The 102 attributed conversions are not directly comparable to 84 unique accepted leads, and the 91 form events may include repeat submissions. The reports alone do not establish data loss. Request a shared event-date export with documented deduplication and, if permitted, a privacy-safe sample of event-to-CRM join outcomes before classifying a tracking defect.
