# Orphex Agent Skills

Twenty-nine portable skills for reporting and diagnostics, campaign optimization, creative and messaging, budget and growth, measurement quality, and conversion experiments. The collection supports supplied marketing exports and business context; Orphex MCP is optional: when a connected Orphex connector reaches the workspace's Orphex data, skills with a matching read or guide use it before asking for exports, and fall back to supplied exports when it does not.

Browse the [public directory](https://mcp.orphex.co/skills). Each installed folder includes a CSV template, complete fictional input, input and business-context references, and a worked output. Relevant quantitative skills also include an optional offline Python 3 calculator. Examples are illustrative; they do not represent customer results.

## Start with a task

| Skill | Use it when |
| --- | --- |
| [Account Structure Audit](skills/orphex-account-structure-audit/SKILL.md) | When campaign organization, naming, settings, or shared budget ownership needs a review. |
| [Anomaly Investigation](skills/orphex-anomaly-investigation/SKILL.md) | When an unexpected performance movement needs a ranked investigation. |
| [Bid Strategy & Learning Review](skills/orphex-bid-strategy-learning-review/SKILL.md) | Before changing a Google Ads bid strategy, target, or optimization goal. |
| [Budget Change Proposal](skills/orphex-budget-change-proposal/SKILL.md) | When deciding whether to change the total campaign or portfolio budget. |
| [Budget Pacing & Forecast](skills/orphex-budget-pacing-forecast/SKILL.md) | When checking whether spend will fit a supplied period budget. |
| [Campaign Budget Reallocator](skills/orphex-campaign-budget-reallocator/SKILL.md) | When moving campaign allocations while preserving a fixed total. |
| [Conversion Tracking Health Check](skills/orphex-conversion-tracking-health-check/SKILL.md) | When event configuration or safe diagnostics suggest missing, rejected, or duplicated signals. |
| [Creative Fatigue Detector](skills/orphex-creative-fatigue-detector/SKILL.md) | When a creative trend suggests declining effectiveness and a refresh may be needed. |
| [Creative Signal Review](skills/orphex-creative-signal-review/SKILL.md) | When choosing the next creative test from supplied delivery and outcome evidence. |
| [Creative Test Brief Builder](skills/orphex-creative-test-brief-builder/SKILL.md) | When turning approved product facts and audience evidence into an executable creative brief. |
| [Customer Cohort & LTV Review](skills/orphex-customer-cohort-ltv-review/SKILL.md) | When comparing acquired customer value and repeat behavior at the same observed age. |
| [Experiment Planner](skills/orphex-experiment-planner/SKILL.md) | Before launching a test whose business effect, traffic, guardrails, and decision rule need definition. |
| [Experiment Result Reviewer](skills/orphex-experiment-result-reviewer/SKILL.md) | After a supplied experiment has run and mature arm outcomes are available. |
| [Geo & Device Breakdown Analysis](skills/orphex-geo-device-breakdown-analysis/SKILL.md) | When location or device differences need review without conflating separate breakdowns. |
| [Impression Share & Auction Insights Review](skills/orphex-impression-share-auction-insights-review/SKILL.md) | When distinguishing Search delivery loss from budget, rank, and competitor-overlap signals. |
| [Keyword Mining on Search Terms](skills/orphex-keyword-mining-on-search-terms/SKILL.md) | When observed search queries may merit deliberate keyword coverage or a bounded test. |
| [Landing Conversion Review](skills/orphex-landing-conversion-review/SKILL.md) | When a landing page or funnel has observed drop-offs that need diagnostic checks. |
| [Lead Quality & CRM Feedback Review](skills/orphex-lead-quality-crm-feedback-review/SKILL.md) | When low-cost leads need comparison with qualification and closed-won CRM outcomes. |
| [Measurement Consistency Check](skills/orphex-measurement-consistency-check/SKILL.md) | When reports disagree and their event, attribution, date, or identity definitions need reconciliation. |
| [Merchant Feed Health Check](skills/orphex-merchant-feed-health-check/SKILL.md) | When Merchant Center eligibility or feed-versus-site consistency needs a scoped repair queue. |
| [Meta Delivery & Audience Review](skills/orphex-meta-delivery-audience-review/SKILL.md) | When Meta ad-set delivery or audience context needs investigation before account changes. |
| [Placement Cleaning](skills/orphex-placement-cleaning/SKILL.md) | When deciding whether a supplied placement conflicts with suitability rules or warrants an efficiency check. |
| [PMax Asset Group & Search Themes Audit](skills/orphex-pmax-asset-group-search-themes-audit/SKILL.md) | When reviewing PMax group organization, destinations, themes, signals, and Search coverage. |
| [Product Profitability Review](skills/orphex-product-profitability-review/SKILL.md) | When product revenue and advertising returns need reconciliation with returns and variable costs. |
| [Quality Score Reviewer](skills/orphex-quality-score-reviewer/SKILL.md) | When Search keyword diagnostics need prioritized relevance and landing-page checks. |
| [RSA Ad Copy & Asset Review](skills/orphex-rsa-ad-copy-asset-review/SKILL.md) | When RSA claims, asset combinations, or copy proposals need evidence-based review. |
| [Search Term Cleaning](skills/orphex-search-term-cleaning/SKILL.md) | When preparing narrow negative keyword proposals from irrelevant observed queries. |
| [Weekly Performance Review](skills/orphex-weekly-performance-review/SKILL.md) | When a weekly or monthly performance change needs a deeper evidence-backed review. |
| [Weekly Performance Summarizer](skills/orphex-weekly-performance-summarizer/SKILL.md) | When the team needs a brief update from supplied comparable weekly results. |

Weekly Summarizer gives a concise stakeholder update; Weekly Performance Review investigates movement. Budget Pacing projects the current period, Campaign Budget Reallocator preserves an approved total, and Budget Change Proposal reviews a change in that total. Tracking Health checks instrumentation; Measurement Consistency reconciles report definitions. Discovery is also tested with natural-language overlapping requests and unrelated requests.

## Install one skill

Choose Claude or Codex and run these commands in your terminal from the target project. Claude uses the installer identifier `claude-code` for its terminal agent; these commands install local skill files rather than uploading them to a Claude web chat:

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v2.0.1/skills/orphex-weekly-performance-review --agent claude-code
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v2.0.1/skills/orphex-weekly-performance-review --agent codex
~~~

To use a skill in Claude or ChatGPT without a terminal, download its `<slug>.zip` from the [release](https://github.com/OrphexTech/agent-skills/releases/tag/v2.0.1) and upload it: in Claude, Customize › Skills › Upload a skill (code execution must be on for calculators); in ChatGPT, the Skills tab where the plan offers it. Each archive holds one top-level `<slug>/` folder; its SHA-256 is listed in the release catalog.

Add `--global` for user scope across projects. Use the selected reviewed tag to update an older installation. Keep all linked resources with SKILL.md and compare the entire installed folder to that tag. Read [installation guidance](docs/INSTALL.md) for paths, listing, bundle commands, direct installation and carefully scoped removal.

## Starter bundles

Three bounded workflow bundles are defined in the source manifest: Weekly Account Review, Search Optimization and Experiment Cycle. They include conditional steps and natural-language starter prompts. They install existing skills rather than a new all-purpose skill, and they do not authorize advertising-account writes.

~~~sh
npx skills@1.7.0 add https://github.com/OrphexTech/agent-skills/tree/v2.0.1/skills --skill orphex-experiment-planner orphex-experiment-result-reviewer --agent claude-code
~~~

Use the [reusable supplied business context](docs/BUSINESS_CONTEXT.md) across related workflows; unknown goals, unit economics, conversion definitions and brand claims stay unknown.

## Quality and reproducibility

Read the versioned [behavioral evaluation report](evaluations/README.md), [release scope and acceptance stories](docs/QUALITY_PLAN.md), and [authoring contract](docs/AUTHORING.md). Source-format checks, deterministic calculations, full-file installation hashes, native synthetic task behavior and independent review are separate evidence. No real-account business uplift or campaign execution is inferred from a synthetic pass count.

The [documentation correction](docs/evidence-corrections.md) supplies a native evidence ZIP with working relative screenshot links, preserves the original documents and all hash-bound records, and explains the historical review's limits. It does not change the installed v2.0.0 skills or claim a new runtime evaluation.

The source uses Node.js 22+ standard libraries without package dependencies. Optional calculator tests require Python 3.

~~~sh
npm test
npm run validate
~~~

Commit final source before building the ignored exact-source catalog:

~~~sh
ORPHEX_SKILLS_SOURCE_SHA=$(git rev-parse HEAD) ORPHEX_SKILLS_INSTALLER_VERSION=1.7.0 npm run build:catalog
~~~

The builder rejects uncommitted catalog input files and preserves exact committed provenance. Public installation remains pinned to skills CLI1.7.0 and protected version tags; v1.1.0 stays available. See the [release process](docs/RELEASING.md) for future immutable publications and the limits of historical asset protection.
