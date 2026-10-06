import { DEFAULT_ROOT, validateSource } from './catalog.mjs';

const { errors } = await validateSource(DEFAULT_ROOT);
if (errors.length) {
  for (const error of errors) console.error('ERROR: ' + error);
  process.exitCode = 1;
} else {
  console.log('Validated five skill sources, lifecycle metadata, relationships, and catalog schema.');
}
