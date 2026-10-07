# Fictional example output

The reports differ by 10 Google Ads credits versus GA4 events and 5 GA4 events versus accepted CRM orders, but those differences are not validated duplicate or missing purchases.

| Source | Observed count | Non-comparable feature |
| --- | ---: | --- |
| Google Ads | 100 | Attributed credits by click date with 7-day window |
| GA4 | 90 | Observed purchase event IDs by event date |
| CRM | 85 | Accepted unique orders by order date without ad attribution |

First reconcile event/order mapping, status exclusions, date basis, consent coverage, and attribution. No deduplicated cross-source total exists from aggregate counts; adding them to 275 would triple-count unlike representations. Tracking health remains unknown until aligned diagnostics or an authorized pseudonymous join is supplied. No reporting configuration changed.
