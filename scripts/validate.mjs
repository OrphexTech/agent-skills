import { DEFAULT_ROOT, validateSource } from './catalog.mjs';

const { errors, catalog } = await validateSource(DEFAULT_ROOT);
if (errors.length) {
  for (const error of errors) console.error('ERROR: ' + error);
  process.exitCode = 1;
} else {
  console.log('Validated ' + catalog.skills.length + ' skill sources, UTF-8 resources, examples, input headers, facets, lifecycle, relationships, bundles and catalog schema.');
}
