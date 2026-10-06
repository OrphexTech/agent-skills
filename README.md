# Orphex Agent Skills

Nineteen portable skills for reviewing marketing performance, paid-search demand, creative, budget allocation, tracking, and measurement from exports and documents supplied by the user.

Each skill is a self-contained directory under [skills](skills/). Orphex MCP can provide data when it is available and authorized, but none of these skills requires it. Examples use fictional data and do not represent verified customer results.

## Browse the skills

The source directories are also the installable directories:

| Skill | Use it for |
| --- | --- |
| [Account Structure Audit](skills/orphex-account-structure-audit/SKILL.md) | A ranked account-structure audit with evidence-linked operational risks, bounded performance implications, a staged cleanup plan, approvals, and rollback mapping. |
| [Anomaly Investigation](skills/orphex-anomaly-investigation/SKILL.md) | A ranked anomaly assessment with comparable metric movement, falsifiable causes, confidence, evidence gaps, and next checks. |
| [Budget Change Proposal](skills/orphex-budget-change-proposal/SKILL.md) | A reviewable budget proposal with per-campaign deltas, portfolio impact, assumptions, risks, and an explicit approval boundary. |
| [Campaign Budget Reallocator](skills/orphex-campaign-budget-reallocator/SKILL.md) | A feasible fixed-total allocation with reconciled deltas, evidence, bounded impact estimates, and an approval boundary. |
| [Conversion Tracking Health Check](skills/orphex-conversion-tracking-health-check/SKILL.md) | A privacy-safe event-path assessment with pass, fail, not-tested, or unknown findings and scoped verification steps. |
| [Creative Fatigue Detector](skills/orphex-creative-fatigue-detector/SKILL.md) | A ranked creative fatigue assessment that distinguishes supported decline, watch signals, no observed signal, and unknowns, with a bounded refresh test. |
| [Creative Signal Review](skills/orphex-creative-signal-review/SKILL.md) | A creative comparison grounded in the stated objective, comparable delivery, observed metrics, and a concrete next test. |
| [Geo & Device Breakdown Analysis](skills/orphex-geo-device-breakdown-analysis/SKILL.md) | An aligned location/device analysis with weighted aggregate metrics, overlap and lag caveats, confidence-bounded segment rankings, and supported next checks. |
| [Impression Share & Auction Insights Review](skills/orphex-impression-share-auction-insights-review/SKILL.md) | A scope-aware delivery review that preserves metric denominators and availability limits, separates budget from rank loss, and frames missed impressions without profit forecasts. |
| [Keyword Mining on Search Terms](skills/orphex-keyword-mining-on-search-terms/SKILL.md) | A ranked, reviewable set of keyword test candidates with observed query evidence, current-coverage checks, suggested match types, ad-group fit, and explicit uncertainty. |
| [Landing Conversion Review](skills/orphex-landing-conversion-review/SKILL.md) | A funnel review that identifies observed drop-offs, relevant segment differences, evidence gaps, and testable page hypotheses. |
| [Measurement Consistency Check](skills/orphex-measurement-consistency-check/SKILL.md) | A source-by-source reconciliation of event, denominator, attribution, time, currency, and identity rules with bounded findings. |
| [Placement Cleaning](skills/orphex-placement-cleaning/SKILL.md) | A scoped placement review that separates suitability from efficiency, quantifies only observed spend, and presents verified exclusions with coverage and confidence limits. |
| [PMax Asset Group & Search Themes Audit](skills/orphex-pmax-asset-group-search-themes-audit/SKILL.md) | A campaign-aware audit of PMax group, asset, URL, theme, and Search-overlap evidence that separates platform signals from targeting controls and causal conclusions. |
| [Quality Score Reviewer](skills/orphex-quality-score-reviewer/SKILL.md) | A diagnostic review of keyword-level expected CTR, ad relevance, and landing-page experience patterns, tied to business exposure and testable follow-up hypotheses. |
| [RSA Ad Copy & Asset Review](skills/orphex-rsa-ad-copy-asset-review/SKILL.md) | An asset-by-asset RSA review with directional performance evidence, approved-claim sourcing, pinning risk, and clearly labeled copy-test proposals. |
| [Search Term Cleaning](skills/orphex-search-term-cleaning/SKILL.md) | An evidence-linked negative keyword proposal that protects converting and relevant queries, states historical spend exposure, and makes match-type and scope risks reviewable. |
| [Weekly Performance Review](skills/orphex-weekly-performance-review/SKILL.md) | A concise period-over-period review with comparable metrics, evidence-linked explanations, uncertainty, and prioritized next actions. |
| [Weekly Performance Summarizer](skills/orphex-weekly-performance-summarizer/SKILL.md) | A concise, evidence-linked weekly update with correctly aggregated metrics, confidence, caveats, and prioritized next actions. |

Weekly Summarizer produces a short stakeholder update; Weekly Performance Review provides a deeper investigation. Campaign Budget Reallocator balances transfers under a fixed total; Budget Change Proposal evaluates a broader budget change. Conversion Tracking Health Check tests instrumentation and configuration; Measurement Consistency Check reconciles reporting definitions.

## Install one skill

Install a skill for Codex:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.1.0/skills/orphex-weekly-performance-review --agent codex
~~~

Install it for Claude:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.1.0/skills/orphex-weekly-performance-review --agent claude-code
~~~

Replace the final path segment to install another v1.1.0 skill. To browse that release's installable skills first, run:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v1.1.0/skills --list
~~~

To verify an installed skill, list the selected agent's skills and compare the installed SKILL.md with the corresponding file from the checked-out source tag. The pinned CLI has no dedicated verify or check command:

~~~sh
npx skills@1.7.0 list --agent codex --json
cmp -s skills/orphex-weekly-performance-review/SKILL.md .agents/skills/orphex-weekly-performance-review/SKILL.md
~~~

Remove one skill from a specific agent and scope with:

~~~sh
npx skills@1.7.0 remove orphex-weekly-performance-review --agent codex
npx skills@1.7.0 remove --global orphex-weekly-performance-review --agent codex
~~~

The Skills CLI may retain a copied Codex skill in its shared canonical directory when another detected universal agent uses that path. See [installation guidance](docs/INSTALL.md) for the correct Codex global path and a hash-checked manual cleanup for that case.

See [installation guidance](docs/INSTALL.md) for project and user scope, reviewed-tag updates, and direct file installation.

## Build and validate

Requires Node.js 22 or newer. The repository uses Node standard libraries and has no package dependencies.

~~~sh
npm test
npm run validate
~~~

To generate the ignored catalog, provide the exact source commit and the pinned installer version:

~~~sh
ORPHEX_SKILLS_SOURCE_SHA=$(git rev-parse HEAD) ORPHEX_SKILLS_INSTALLER_VERSION=1.7.0 npm run build:catalog
~~~

Runtime compatibility inside Codex and Claude has not yet been verified. Automated checks validate the source format, skill metadata, relationships, and generated catalog contract.

## Project status

The source repository is public. Versioned tags pin the installable skill bytes, and [the directory](https://mcp.orphex.co/skills) publishes a reviewed catalog snapshot. Installer checks verify file hashes and registration in Codex and Claude project/global scopes on disposable runners; agent reasoning and real-account operation remain separate checks.
