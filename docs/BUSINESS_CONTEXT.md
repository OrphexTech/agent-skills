# Reusable supplied business context

Each installed skill includes `references/business-context.md`. Fill it once with facts supplied by the operator, then pass the same profile into related analysis tasks. The profile does not contain secrets, advertising tokens, customer identities or assumed target values.

A useful profile states business model and products; primary objective and measured event; currency and timezone; attribution and outcome maturity; unit economics when known; approved offers, claims and brand rules; protected campaigns/queries; budgets, floors, ceilings and frozen entities; data sources and freshness; and who can approve a proposed change. Unknown entries stay unknown. Only request fields that materially affect the current decision.

The analysis should cite supplied profile facts when they affect a recommendation. Contradictory definitions must be reconciled with the current export before combining results. Reusing a profile does not grant account write permissions. Recheck time-sensitive targets, offers, budgets and platform configuration instead of carrying them forward silently.

The portable collection accepts exports and documents. Optional Orphex MCP usage requires actual available tool discovery, field/schema verification, authorized account scope and recorded freshness. Never invent a connector name, tool capability or joined business outcome that the available evidence does not provide.
