# Fictional example output

| Check | Status | Evidence |
| --- | --- | --- |
| t1 browser/server event-name and event-ID alignment | Pass | Both Purchase/test-order-1 with $100 USD |
| t1 actual deduplicated counting | Unknown | Two transport acceptances are not proof of one counted conversion; no dedup result supplied |
| t2 required currency delivery | Fail | Currency blank; diagnostic explicitly rejected missing currency |
| Consent and production end-to-end coverage | Unknown | No safe coverage evidence supplied |

Fix the t2 currency source, then run an authorized synthetic diagnostic and inspect delivery/dedup results. Do not send live customer orders or assume the two accepted t1 transports caused duplicate attribution. Transport acceptance, event configuration, and counted outcomes are separate checks. Missing results leave these two findings unknown; they do not establish that a test has not run or that its source and method are available. No event configuration changed.
