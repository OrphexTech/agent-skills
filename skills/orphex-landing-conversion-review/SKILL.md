---
name: orphex-landing-conversion-review
description: "Review supplied landing-page and funnel evidence to locate conversion friction, distinguish observed patterns from causes, and propose measurable next checks."
license: MIT
metadata:
  version: "1.1.0"
---

# Orphex Landing Conversion Review

Review supplied page copy, screenshots, funnel exports, experiment notes, and analytics documents. Orphex MCP may provide data when already available and authorized, but the review must also work from files the user supplies. Do not claim to have opened or inspected an unprovided live page.

## Define the funnel

Record the page or variant, target audience, traffic sources, date range, account timezone, device or locale segments, and the intended conversion. Name each funnel event and denominator, such as sessions to form starts to submitted leads to qualified leads. Do not call unlike stages the same conversion.

For each stage, show counts and the relevant rate. State whether the denominator is sessions, users, clicks, or a prior funnel stage. Check for duplicate submissions, consent or bot filters, missing pages, and event-definition differences when source documents provide evidence. Mark unavailable stages and zero denominators explicitly.

Segment only where the supplied data supports it. Device, source, campaign, locale, returning status, and page variant can explain aggregate movement through mix changes. Show the segment's volume before comparing rates. Do not infer that a device experience caused a gap when traffic intent or campaign mix also differs.

When screenshots or copy are supplied, connect each proposed friction point to visible evidence, such as unclear offer language, mismatched message, hidden action, form burden, or missing reassurance. Separate what the artifact shows from what needs live usability or performance evidence. Do not diagnose load time from a screenshot.

## Explain limits and choose next checks

Treat observational conversion gaps as associations. A before-and-after change may also reflect traffic, seasonality, spend, or tracking shifts. Use a properly documented randomized experiment for causal claims. If sample size or assignment details are missing, say so and propose a test or additional cut rather than declaring a winner.

Prioritize hypotheses by likely user impact, evidence strength, and ease of checking. For each one, state the observed pattern, possible explanation, next measurement or test, primary metric, guardrail, and relevant segment. Preserve one main change per test when the goal is to learn causality.

## Recommended output

State the conversion definition and period first. Show a funnel table with counts and rates, then a short list of observed friction signals and testable hypotheses. Close with missing evidence and the next check that would most reduce uncertainty.

## Example with fictional data

Fictional 14-day lead form results for one landing page and offer:

| Device | Sessions | Form starts | Submitted leads | Session-to-submit rate |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 20,000 | 1,300 | 900 | 4.50% |
| Mobile | 30,000 | 1,500 | 900 | 3.00% |

Fictional read: mobile has the lower session-to-submit rate and the same submission count on more sessions. This is an observed device gap; it does not show that the mobile form caused it because source mix, intent, and form completion quality were not supplied. Compare source and campaign within each device, inspect a supplied mobile form recording or screenshot, and test a specific form change with submitted-lead quality as a guardrail.
