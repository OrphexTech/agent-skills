import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildSkillZip } from '../scripts/skill_zip.mjs';
import {
  validateCatalogSchema,
  validateSource,
  readSchema,
  readPortableFiles
} from '../scripts/catalog.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readSlugs(root) {
  const manifest = JSON.parse(await readFile(path.join(root, 'skills/manifest.json'), 'utf8'));
  return manifest.skills.map((entry) => entry.slug);
}

async function makeFixture() {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'orphex-agent-skills-'));
  const root = path.join(parent, 'repo');
  await cp(repositoryRoot, root, {
    recursive: true,
    filter(source) {
      const relative = path.relative(repositoryRoot, source);
      return !['.git', 'dist', 'node_modules'].some((blocked) =>
        relative === blocked || relative.startsWith(blocked + path.sep)
      );
    }
  });
  return { parent, root };
}

test('manifest source directories build schema-valid catalog data in stable order', async () => {
  const { errors, catalog } = await validateSource(repositoryRoot);
  const slugs = await readSlugs(repositoryRoot);
  assert.deepEqual(errors, []);
  assert.deepEqual(catalog.skills.map((skill) => skill.slug), [...slugs].sort());
  assert.equal(new Set(catalog.skills.map((skill) => skill.slug)).size, slugs.length);
  const packageJson = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
  assert.equal(catalog.releaseVersion, 'v' + packageJson.version);
  assert.equal(catalog.installerVersion, '1.7.0');
  assert.equal(catalog.skills[0].sourcePath, 'skills/' + slugs[0] + '/SKILL.md');
  assert.equal(catalog.skills[0].instructions.startsWith('# '), true);
});

test('frontmatter name must match the installable directory', async () => {
  const { parent, root } = await makeFixture();
  try {
    const [slug] = await readSlugs(root);
    const skillPath = path.join(root, 'skills', slug, 'SKILL.md');
    const original = await readFile(skillPath, 'utf8');
    await writeFile(skillPath, original.replace('name: ' + slug, 'name: orphex-wrong-name'), 'utf8');
    const { errors } = await validateSource(root);
    assert.ok(errors.some((error) => error.includes('frontmatter name must match')));
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('unknown related skills and non-source fixtures are rejected', async () => {
  const { parent, root } = await makeFixture();
  try {
    const manifestPath = path.join(root, 'skills/manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    manifest.skills[0].relatedSkills[0] = 'orphex-not-in-this-release';
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    await writeFile(path.join(root, 'skills', manifest.skills[1].slug, 'fixture.js'), 'export {};\n', 'utf8');
    const { errors } = await validateSource(root);
    assert.ok(errors.some((error) => error.includes('references an unknown skill')));
    assert.ok(errors.some((error) => error.includes('unexpected portable resource')));
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('manifest allowlist supports a new installable directory', async () => {
  const { parent, root } = await makeFixture();
  try {
    const manifestPath = path.join(root, 'skills/manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const originalCount = manifest.skills.length;
    const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
    const template = manifest.skills[0];
    const entry = { ...template, slug: 'orphex-search-query-review', title: 'Orphex Search Query Review', description: 'Review supplied paid-search query evidence and propose a bounded follow-up.' };
    manifest.skills.push(entry);
    manifest.skills.sort((left, right) => left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    const dirPath = path.join(root, 'skills', entry.slug);
    await cp(path.join(root, 'skills', template.slug), dirPath, { recursive: true });
    const original = await readFile(path.join(dirPath, 'SKILL.md'), 'utf8');
    await writeFile(path.join(dirPath, 'SKILL.md'), original.replace('name: ' + template.slug, 'name: ' + entry.slug).replace('description: ' + JSON.stringify(template.description), 'description: ' + JSON.stringify(entry.description)), 'utf8');
    const { errors, catalog } = await validateSource(root);
    assert.deepEqual(errors, []);
    assert.equal(catalog.skills.length, originalCount + 1);
    assert.ok(catalog.skills.some((skill) => skill.slug === entry.slug));
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('package version and manifest lifecycle date can advance together', async () => {
  const { parent, root } = await makeFixture();
  try {
    const packagePath = path.join(root, 'package.json');
    const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
    const oldVersion = packageJson.version;
    const [major, minor] = oldVersion.split('.').map(Number);
    const nextVersion = major + '.' + (minor + 1) + '.0';
    packageJson.version = nextVersion;
    await writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    const changelogPath = path.join(root, 'CHANGELOG.md');
    const changelog = await readFile(changelogPath, 'utf8');
    await writeFile(changelogPath, changelog.replace('# Changelog\n', '# Changelog\n\n## ' + nextVersion + ' - 2030-01-01\n'), 'utf8');
    const manifestPath = path.join(root, 'skills/manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    for (const entry of manifest.skills) entry.updatedAt = '2030-01-01';
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    for (const slug of await readSlugs(root)) {
      const skillPath = path.join(root, 'skills', slug, 'SKILL.md');
      const content = await readFile(skillPath, 'utf8');
      await writeFile(skillPath, content.replace('version: ' + JSON.stringify(oldVersion), 'version: ' + JSON.stringify(nextVersion)), 'utf8');
    }
    const { errors, catalog } = await validateSource(root);
    assert.deepEqual(errors, []);
    assert.equal(catalog.releaseVersion, 'v' + nextVersion);
    assert.ok(catalog.skills.every((skill) => skill.updatedAt === '2030-01-01'));
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('catalog schema rejects unexpected fields', async () => {
  const { catalog } = await validateSource(repositoryRoot);
  const schema = await readSchema(repositoryRoot);
  catalog.skills[0].verified = true;
  const errors = validateCatalogSchema(catalog, schema);
  assert.ok(errors.some((error) => error.includes('unexpected property verified')));
});

test('catalog builder emits byte-identical output for identical provenance', async () => {
  const { parent, root } = await makeFixture();
  try {
    execFileSync('git', ['init', '--quiet'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'Fixture source'], { cwd: root });
    const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const scriptPath = path.join(root, 'scripts/build_catalog.mjs');
    const firstRun = spawnSync(process.execPath, [
      scriptPath,
      '--source-sha',
      sourceSha,
      '--installer-version',
      '1.7.0'
    ], { encoding: 'utf8' });
    assert.equal(firstRun.status, 0, firstRun.stderr);
    const firstOutput = await readFile(path.join(root, 'dist/catalog.json'), 'utf8');
    await rm(path.join(root, 'dist'), { recursive: true, force: true });
    const secondRun = spawnSync(process.execPath, [
      scriptPath,
      '--source-sha',
      sourceSha,
      '--installer-version',
      '1.7.0'
    ], { encoding: 'utf8' });
    assert.equal(secondRun.status, 0, secondRun.stderr);
    const secondOutput = await readFile(path.join(root, 'dist/catalog.json'), 'utf8');
    assert.equal(firstOutput, secondOutput);
    assert.equal(JSON.parse(firstOutput).sourceSha, sourceSha);
    for (const skill of JSON.parse(firstOutput).skills) {
      const archive = await readFile(path.join(root, 'dist', skill.slug + '.zip'));
      assert.equal(createHash('sha256').update(archive).digest('hex'), skill.download.sha256);
      assert.equal(archive.length, skill.download.size);
    }
    assert.equal(firstOutput.endsWith('\n'), true);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('schema 2 rejects unknown fields, wrong boolean types and unsupported facets', async () => {
  const { catalog } = await validateSource(repositoryRoot);
  const schema = await readSchema(repositoryRoot);
  const invalid = structuredClone(catalog);
  invalid.skills[0].inputs[0].required = 'true';
  invalid.skills[0].platforms = ['invented-network'];
  invalid.skills[0].resources[0].path = '../escape.txt';
  invalid.bundles[0].unexpected = true;
  const errors = validateCatalogSchema(invalid, schema);
  assert.ok(errors.some((error) => error.includes('must be a boolean')));
  assert.ok(errors.some((error) => error.includes('platforms') && error.includes('not an allowed')));
  assert.ok(errors.some((error) => error.includes('resources') && error.includes('not an allowed')));
  assert.ok(errors.some((error) => error.includes('unexpected property')));
});
test('portable resources and worked examples carry exact UTF-8 byte hashes', async () => {
  const { errors, catalog } = await validateSource(repositoryRoot);
  assert.deepEqual(errors, []);
  for (const skill of catalog.skills) {
    const files = await readPortableFiles(path.join(repositoryRoot, 'skills', skill.slug));
    assert.equal(skill.contentHash, files.get('SKILL.md').contentHash);
    assert.deepEqual(skill.resources.map((item) => item.path), [...files.keys()].filter((item) => item !== 'SKILL.md').sort());
    for (const resource of skill.resources) assert.equal(resource.contentHash, files.get(resource.path).contentHash);
    assert.equal(skill.example.inputCsv, files.get('assets/example-input.csv').text);
    assert.equal(skill.example.outputMarkdown, files.get('references/example-output.md').text);
  }
});
test('BOM-prefixed portable source cannot silently change hashed bytes', async () => {
  const { parent, root } = await makeFixture();
  try {
    const [slug] = await readSlugs(root);
    const file = path.join(root, 'skills', slug, 'SKILL.md');
    await writeFile(file, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), await readFile(file)]));
    const { errors } = await validateSource(root);
    assert.ok(errors.some((error) => error.includes('UTF-8 BOM')));
  } finally { await rm(parent, { recursive: true, force: true }); }
});
test('example mismatch, changed header and symlink resources are rejected', async () => {
  const { parent, root } = await makeFixture();
  try {
    const slugs = await readSlugs(root);
    await writeFile(path.join(root, 'skills', slugs[0], 'assets/example-input.csv'), 'wrong_header\n10\n');
    const { symlink } = await import('node:fs/promises');
    const resource = path.join(root, 'skills', slugs[1], 'references/example-output.md');
    await rm(resource);
    await symlink(path.join(root, 'README.md'), resource);
    const { errors } = await validateSource(root);
    assert.ok(errors.some((error) => error.includes('must byte-match')));
    assert.ok(errors.some((error) => error.includes('header must exactly match')));
    assert.ok(errors.some((error) => error.includes('symlinks are forbidden')));
  } finally { await rm(parent, { recursive: true, force: true }); }
});
test('catalog builder refuses an uncommitted or wrong source tree', async () => {
  const { parent, root } = await makeFixture();
  try {
    execFileSync('git', ['init', '--quiet'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'Fixture source'], { cwd: root });
    const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const manifestPath = path.join(root, 'skills/manifest.json');
    const original = await readFile(manifestPath, 'utf8');
    await writeFile(manifestPath, original + '\n');
    const run = spawnSync(process.execPath, [path.join(root, 'scripts/build_catalog.mjs'), '--source-sha', sourceSha, '--installer-version', '1.7.0'], { encoding: 'utf8' });
    assert.equal(run.status, 1);
    assert.ok(run.stderr.includes('must match the committed source tree'));
  } finally { await rm(parent, { recursive: true, force: true }); }
});
test('each skill archive is a deterministic single-folder upload that a standard ZIP reader accepts', async () => {
  const { errors, catalog } = await validateSource(repositoryRoot);
  assert.deepEqual(errors, []);
  const parent = await mkdtemp(path.join(os.tmpdir(), 'orphex-skill-zip-'));
  try {
    for (const skill of catalog.skills) {
      const files = await readPortableFiles(path.join(repositoryRoot, 'skills', skill.slug));
      const archive = buildSkillZip(skill.slug, files);
      assert.ok(archive.equals(buildSkillZip(skill.slug, await readPortableFiles(path.join(repositoryRoot, 'skills', skill.slug)))));
      assert.equal(skill.download.url, 'https://github.com/OrphexTech/agent-skills/releases/download/' + catalog.releaseVersion + '/' + skill.slug + '.zip');
      assert.equal(skill.download.sha256, createHash('sha256').update(archive).digest('hex'));
      assert.equal(skill.download.size, archive.length);
      const zipPath = path.join(parent, skill.slug + '.zip');
      await writeFile(zipPath, archive);
      const read = spawnSync('python3', ['-B', '-c', [
        'import hashlib, json, sys, zipfile',
        'z = zipfile.ZipFile(sys.argv[1])',
        'assert z.testzip() is None',
        'print(json.dumps({i.filename: hashlib.sha256(z.read(i)).hexdigest() for i in z.infolist() if not i.is_dir()}))'
      ].join('\n'), zipPath], { encoding: 'utf8' });
      assert.equal(read.status, 0, read.stderr);
      const expected = Object.fromEntries([...files.keys()].sort().map((name) => [skill.slug + '/' + name, files.get(name).contentHash]));
      assert.deepEqual(JSON.parse(read.stdout), expected);
    }
  } finally { await rm(parent, { recursive: true, force: true }); }
});
test('catalog schema rejects a malformed download entry', async () => {
  const { catalog } = await validateSource(repositoryRoot);
  const schema = await readSchema(repositoryRoot);
  const invalid = structuredClone(catalog);
  invalid.skills[0].download.url = 'https://example.invalid/' + invalid.skills[0].slug + '.zip';
  invalid.skills[1].download.size = 0;
  delete invalid.skills[2].download;
  const errors = validateCatalogSchema(invalid, schema);
  assert.ok(errors.some((error) => error.includes('download.url does not match')));
  assert.ok(errors.some((error) => error.includes('download.size is below 1')));
  assert.ok(errors.some((error) => error.includes('is missing download')));
});
