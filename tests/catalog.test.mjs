import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  validateCatalogSchema,
  validateSource,
  readSchema
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
  assert.equal(catalog.releaseVersion, 'v1.0.0');
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
    assert.ok(errors.some((error) => error.includes('must contain only its SKILL.md')));
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('manifest allowlist supports a new installable directory', async () => {
  const { parent, root } = await makeFixture();
  try {
    const manifestPath = path.join(root, 'skills/manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const entry = {
      slug: 'orphex-search-query-review',
      title: 'Orphex Search Query Review',
      description: 'Review search query evidence to separate useful demand signals from irrelevant traffic and propose measurable exclusions.',
      outcome: 'A query-level review with observed intent patterns, supporting volumes, and a prioritized follow-up.',
      category: 'performance',
      tags: ['marketing', 'performance', 'queries'],
      updatedAt: '2026-10-06',
      requirements: ['User-supplied search query export with dates, spend, and outcomes'],
      relatedSkills: ['orphex-weekly-performance-review']
    };
    manifest.skills.push(entry);
    manifest.skills.sort((left, right) => left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    const dirPath = path.join(root, 'skills', entry.slug);
    await mkdir(dirPath, { recursive: true });
    await writeFile(path.join(dirPath, 'SKILL.md'), [
      '---',
      'name: ' + entry.slug,
      'description: ' + JSON.stringify(entry.description),
      'license: MIT',
      'metadata:',
      '  version: "1.0.0"',
      '---',
      '',
      '# Orphex Search Query Review',
      '',
      'Review supplied query rows against the campaign objective, spend, and qualified outcomes.',
      ''
    ].join('\n'), 'utf8');
    const { errors, catalog } = await validateSource(root);
    assert.deepEqual(errors, []);
    assert.equal(catalog.skills.length, 6);
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
    packageJson.version = '1.1.0';
    await writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    const changelogPath = path.join(root, 'CHANGELOG.md');
    const changelog = await readFile(changelogPath, 'utf8');
    await writeFile(changelogPath, changelog.replace('## 1.0.0 - 2026-10-06', '## 1.1.0 - 2026-11-06'), 'utf8');
    const manifestPath = path.join(root, 'skills/manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    for (const entry of manifest.skills) entry.updatedAt = '2026-11-06';
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    for (const slug of await readSlugs(root)) {
      const skillPath = path.join(root, 'skills', slug, 'SKILL.md');
      const content = await readFile(skillPath, 'utf8');
      await writeFile(skillPath, content.replace('version: "1.0.0"', 'version: "1.1.0"'), 'utf8');
    }
    const { errors, catalog } = await validateSource(root);
    assert.deepEqual(errors, []);
    assert.equal(catalog.releaseVersion, 'v1.1.0');
    assert.ok(catalog.skills.every((skill) => skill.updatedAt === '2026-11-06'));
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
  const sourceSha = 'abcdef0123456789abcdef0123456789abcdef01';
  try {
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
    assert.equal(firstOutput.endsWith('\n'), true);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
