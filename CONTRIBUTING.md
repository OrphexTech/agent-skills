# Contributing

Contributions should make a specific marketing-analysis task more accurate or easier to complete. Keep skills useful with user-supplied exports and documents; integrations may be mentioned only as optional capabilities that already exist in the user's environment.

## Before opening a change

- Read [AGENTS.md](AGENTS.md) and [authoring guidance](docs/AUTHORING.md).
- Keep tracked content in English and do not include private customer data, credentials, internal runbooks, or infrastructure details.
- Label invented figures, brands, and scenarios as fictional. Never imply a fictional result was measured or independently verified.
- Preserve user authorization boundaries. In particular, the budget proposal skill must not mutate advertising accounts without clear authorization for the specific changes.
- Update the manifest when adding or changing skill metadata, categories, tags, lifecycle dates, or relationships.

## Validation

Run the complete local source checks:

~~~sh
npm test
npm run validate
~~~

The validation workflow checks source structure and generated-catalog rules. Run the upstream skill-format quick validator on each changed skill when it is available in the authoring environment. A passing structural validator does not prove runtime behavior in an agent product.

Pull requests should explain the user task improved, the evidence or scenario used to review the change, and any remaining uncertainty.
