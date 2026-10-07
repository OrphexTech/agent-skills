# Fictional example output

| Item/destination | Finding | Next verification |
| --- | --- | --- |
| sku-a / Shopping ads | Reported disapproval plus observed $90 feed / $100 landing price mismatch | Reconcile source-of-truth price and destination/crawl timestamp; correct the authorized feed source, then recheck diagnostics |
| sku-b / Shopping ads | Status says eligible, but supplied stock observations conflict | Verify stock freshness, variant and checkout consistency; eligibility may lag current data |
| sku-c / free listings | No supplied mismatch or diagnostic issue | Preserve this scoped observation; it does not certify all attributes/destinations |

One of three supplied item-destination rows is disapproved (33.33%). One of two Shopping-ad rows is disapproved (50.00%); free listings must not be silently counted as ad eligibility. Historical spend for sku-a is $400 exposure, not lost sales or recoverable revenue. No merchant-wide health guarantee, appeal, product exclusion, or price change was made.
