import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_ROOT, validateSource } from './catalog.mjs';

function readArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      return { help: true };
    }
    if (arg === '--source-sha' || arg === '--installer-version') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(arg + ' requires a value');
      const key = arg === '--source-sha' ? 'sourceSha' : 'installerVersion';
      if (options[key]) throw new Error(arg + ' may be supplied only once');
      options[key] = value;
      index += 1;
      continue;
    }
    throw new Error('unknown argument: ' + arg);
  }
  return options;
}

function usage() {
  return [
    'Usage: node scripts/build_catalog.mjs --source-sha <git-commit> --installer-version <semver>',
    'Or set ORPHEX_SKILLS_SOURCE_SHA and ORPHEX_SKILLS_INSTALLER_VERSION.',
    'The output is dist/catalog.json and is ignored by Git.'
  ].join('\n');
}

try {
  const options = readArguments(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    process.exit(0);
  }
  const sourceSha = options.sourceSha || process.env.ORPHEX_SKILLS_SOURCE_SHA;
  const installerVersion = options.installerVersion || process.env.ORPHEX_SKILLS_INSTALLER_VERSION;
  if (!sourceSha) throw new Error('source SHA is required through --source-sha or ORPHEX_SKILLS_SOURCE_SHA');
  if (!installerVersion) throw new Error('installer version is required through --installer-version or ORPHEX_SKILLS_INSTALLER_VERSION');
  const { errors, catalog } = await validateSource(DEFAULT_ROOT, { sourceSha, installerVersion });
  if (errors.length) throw new Error(errors.join('\n'));

  const outputPath = path.join(DEFAULT_ROOT, 'dist/catalog.json');
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log('Wrote ' + path.relative(DEFAULT_ROOT, outputPath) + ' for ' + catalog.sourceSha + ' with installer ' + catalog.installerVersion + '.');
} catch (error) {
  console.error('Catalog build failed: ' + error.message);
  process.exitCode = 1;
}
