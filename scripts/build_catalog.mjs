import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_ROOT, readPortableFiles, validateSource } from './catalog.mjs';
import { buildSkillZip } from './skill_zip.mjs';

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
    'The output is dist/catalog.json plus one dist/<slug>.zip per skill and is ignored by Git.'
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
  const committedSha = execFileSync('git', ['rev-parse', '--verify', sourceSha + '^{commit}'], { cwd: DEFAULT_ROOT, encoding: 'utf8' }).trim();
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: DEFAULT_ROOT, encoding: 'utf8' }).trim();
  if (committedSha !== sourceSha || head !== sourceSha) throw new Error('source SHA must be the full exact checked-out HEAD commit');
  const inputPaths = ['package.json', 'CHANGELOG.md', 'skills', 'schemas', 'resources', 'scripts'];
  const changed = execFileSync('git', ['diff', '--name-only', sourceSha, '--', ...inputPaths], { cwd: DEFAULT_ROOT, encoding: 'utf8' }).trim();
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', ...inputPaths], { cwd: DEFAULT_ROOT, encoding: 'utf8' }).trim();
  if (changed || untracked) throw new Error('catalog input files must match the committed source tree; commit source edits before building');
  const { errors, catalog } = await validateSource(DEFAULT_ROOT, { sourceSha, installerVersion });
  if (errors.length) throw new Error(errors.join('\n'));

  const outputPath = path.join(DEFAULT_ROOT, 'dist/catalog.json');
  await mkdir(path.dirname(outputPath), { recursive: true });
  for (const skill of catalog.skills) {
    const archive = buildSkillZip(skill.slug, await readPortableFiles(path.join(DEFAULT_ROOT, 'skills', skill.slug)));
    if (createHash('sha256').update(archive).digest('hex') !== skill.download.sha256) throw new Error(skill.slug + ' archive does not match its catalog sha256');
    await writeFile(path.join(DEFAULT_ROOT, 'dist', skill.slug + '.zip'), archive);
  }
  await writeFile(outputPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log('Wrote ' + path.relative(DEFAULT_ROOT, outputPath) + ' and ' + catalog.skills.length + ' skill upload archives for ' + catalog.sourceSha + ' with installer ' + catalog.installerVersion + '.');
} catch (error) {
  console.error('Catalog build failed: ' + error.message);
  process.exitCode = 1;
}
