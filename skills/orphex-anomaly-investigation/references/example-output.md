# Fictional example output

CPA doubled from $20 to $40 (+100%). Spend rose 20%, clicks rose 20%, and leads fell 40%; click-to-lead rate fell from 5.00% to 2.50% (−2.50pp). CPC remained $1.00 and CTR remained 2.00%.

| Hypothesis | Evidence | Missing test |
| --- | --- | --- |
| Landing conversion-path regression | Release timing coincides with the rate drop | Test form completion and server acceptance before/after with safe diagnostics |
| Conversion measurement change | Lead reporting is the changing outcome | Compare event configuration and import timestamps |
| Less qualified click mix | Stable CPC/CTR does not rule out intent changes | Compare query and segment composition |

The chronology prioritizes investigation; it does not prove the release caused the drop. Metrics are mature and comparable. Check instrumentation and actual lead completion first, then compare traffic mix. Do not roll back the page or adjust bids from this correlation alone. No mutations performed.
