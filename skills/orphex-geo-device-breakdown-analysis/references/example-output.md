# Fictional example output

Each dimension reconciles to $700 spend and 35 leads: account CPA is $20.00. Do not add geo and device totals: they describe the same $700.

| Dimension/bucket | Spend | Leads | CPA | Click-to-lead rate |
| --- | ---: | ---: | ---: | ---: |
| Geo / US | $600 | 30 | $20.00 | 5.00% |
| Geo / Unknown | $100 | 5 | $20.00 | 5.00% |
| Device / mobile | $500 | 20 | $25.00 | 4.00% |
| Device / desktop | $200 | 15 | $13.33 | 7.50% |

Keep the Unknown location bucket in totals; it is not missing numeric data. Mobile's observed rate is lower, but no matched trend, joint geo-device export, or causal test is present. We cannot conclude that US mobile has the same rates or prescribe a device bid adjustment under this strategy. Check mobile funnel instrumentation and comparable periods, then confirm available targeting controls. No changes applied.
