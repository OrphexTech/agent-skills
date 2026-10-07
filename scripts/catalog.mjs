import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSkillZip } from './skill_zip.mjs';

export const REPOSITORY_URL = 'https://github.com/OrphexTech/agent-skills';
export const SCHEMA_VERSION = 2;
export const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REQUIRED_RESOURCES = ['assets/input-template.csv', 'assets/example-input.csv', 'references/input-contract.md', 'references/business-context.md', 'references/example-output.md'];
export const OPTIONAL_RESOURCES = ['scripts/marketing_math.py'];
const ALL_RESOURCES = new Set([...REQUIRED_RESOURCES, ...OPTIONAL_RESOURCES]);
const SEMVER = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
const SLUG = /^orphex-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_PROVENANCE = { sourceSha: '0000000000000000000000000000000000000000', installerVersion: '1.7.0' };

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function hash(content) { return createHash('sha256').update(content).digest('hex'); }
function sortedUnique(values, label, errors, allowEmpty = false) {
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0)) { errors.push(label + ' must be a non-empty array'); return; }
  if (new Set(values).size !== values.length) errors.push(label + ' must not contain duplicates');
  if (JSON.stringify(values) !== JSON.stringify([...values].sort())) errors.push(label + ' must be sorted lexically');
}

function parseFrontmatter(content, filePath, errors) {
  if (content.includes('\r')) {
    errors.push(filePath + ' must use LF line endings');
    return null;
  }
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    errors.push(filePath + ' must start with a YAML frontmatter block');
    return null;
  }
  const lines = match[1].split('\n');
  if (lines.length !== 5) {
    errors.push(filePath + ' frontmatter must contain only name, description, license, metadata, and metadata.version');
    return null;
  }
  const nameMatch = lines[0].match(/^name: ([a-z0-9-]+)$/);
  const descriptionMatch = lines[1].match(/^description: (".*")$/);
  const licenseMatch = lines[2].match(/^license: ([A-Za-z0-9.-]+)$/);
  const metadataMatch = lines[3] === 'metadata:';
  const versionMatch = lines[4].match(/^  version: (".*")$/);
  if (!nameMatch || !descriptionMatch || !licenseMatch || !metadataMatch || !versionMatch) {
    errors.push(filePath + ' frontmatter does not match the supported standard YAML shape');
    return null;
  }
  let description;
  let version;
  try {
    description = JSON.parse(descriptionMatch[1]);
    version = JSON.parse(versionMatch[1]);
  } catch {
    errors.push(filePath + ' frontmatter quoted values must be valid JSON-compatible YAML strings');
    return null;
  }
  if (typeof description !== 'string' || typeof version !== 'string') {
    errors.push(filePath + ' description and metadata.version must be strings');
    return null;
  }
  const body = match[2].replace(/^\n/, '');
  if (!content.endsWith('\n')) errors.push(filePath + ' must end with a newline');
  if (!body.trim()) errors.push(filePath + ' must contain Markdown instructions after frontmatter');
  if (/\b(?:TODO|TBD|PLACEHOLDER|LOREM IPSUM)\b/i.test(body)) {
    errors.push(filePath + ' contains an unfinished placeholder');
  }
  return {
    name: nameMatch[1],
    description,
    license: licenseMatch[1],
    version,
    body
  };
}


// Deliberately implements the finite schema vocabulary checked into this repo.
// Unsupported schema keywords fail instead of being silently ignored.
function validateSchemaValue(value, schema, location, errors) {
  if (Object.hasOwn(schema, 'const') && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push(location + ' must equal ' + JSON.stringify(schema.const)); return;
  }
  const type = schema.type;
  if (type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { errors.push(location + ' must be an object'); return; }
    for (const key of schema.required || []) if (!Object.hasOwn(value, key)) errors.push(location + ' is missing ' + key);
    for (const key of Object.keys(value)) {
      if (Object.hasOwn(schema.properties || {}, key)) validateSchemaValue(value[key], schema.properties[key], location + '.' + key, errors);
      else if (schema.additionalProperties === false) errors.push(location + ' has unexpected property ' + key);
    }
  } else if (type === 'array') {
    if (!Array.isArray(value)) { errors.push(location + ' must be an array'); return; }
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(location + ' has fewer than ' + schema.minItems + ' items');
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(location + ' has more than ' + schema.maxItems + ' items');
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(location + ' must not contain duplicate items');
    value.forEach((item, index) => validateSchemaValue(item, schema.items || {}, location + '[' + index + ']', errors));
  } else if (type === 'string') {
    if (typeof value !== 'string') { errors.push(location + ' must be a string'); return; }
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(location + ' is too short');
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(location + ' is too long');
    if (schema.pattern && !(new RegExp(schema.pattern)).test(value)) errors.push(location + ' does not match its required pattern');
  } else if (type === 'boolean') {
    if (typeof value !== 'boolean') errors.push(location + ' must be a boolean');
  } else if (type === 'integer') {
    if (!Number.isSafeInteger(value)) { errors.push(location + ' must be an integer'); return; }
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(location + ' is below ' + schema.minimum);
  } else if (type !== undefined) {
    errors.push(location + ' uses unsupported schema type ' + type);
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(location + ' is not an allowed value');
}
export function validateCatalogSchema(value, schema) {
  const errors = []; validateSchemaValue(value, schema, '$', errors); return errors;
}

export function parseCsv(content) {
  const rows = []; let row = []; let cell = ''; let quoted = false; let closed = false;
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (quoted) {
      if (char === '"') { if (content[index + 1] === '"') { cell += '"'; index += 1; } else { quoted = false; closed = true; } }
      else cell += char;
    } else if (char === '"') {
      if (cell || closed) throw new Error('quote must begin a CSV field'); quoted = true;
    } else if (char === ',' || char === '\n') {
      row.push(cell); cell = ''; closed = false;
      if (char === '\n') { rows.push(row); row = []; }
    } else {
      if (closed) throw new Error('characters after a closed quoted CSV field'); cell += char;
    }
  }
  if (quoted) throw new Error('unclosed quoted CSV field');
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export async function readPortableFiles(directory) {
  const files = new Map();
  async function visit(relative = '') {
    const entries = await readdir(path.join(directory, relative), { withFileTypes: true });
    for (const entry of entries) {
      const name = relative ? relative + '/' + entry.name : entry.name;
      if (entry.isSymbolicLink()) throw new Error('symlinks are forbidden: ' + name);
      if (entry.isDirectory()) {
        if (!['assets', 'references', 'scripts'].includes(name)) throw new Error('unexpected resource directory: ' + name);
        await visit(name);
      } else if (entry.isFile()) {
        if (name !== 'SKILL.md' && !ALL_RESOURCES.has(name)) throw new Error('unexpected portable resource: ' + name);
        const bytes = await readFile(path.join(directory, name));
        if (bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))) throw new Error(name + ' must not contain a UTF-8 BOM');
        let text;
        try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
        catch { throw new Error(name + ' is not valid UTF-8'); }
        if (text.includes('\r') || !text.endsWith('\n')) throw new Error(name + ' must use LF and end in a newline');
        if (!text.trim()) throw new Error(name + ' must not be empty');
        files.set(name, { bytes, text, contentHash: hash(bytes) });
      } else throw new Error('resource must be a regular file: ' + name);
    }
  }
  await visit();
  for (const name of ['SKILL.md', ...REQUIRED_RESOURCES]) if (!files.has(name)) throw new Error('missing portable resource: ' + name);
  return files;
}

function validateManifest(manifest, packageJson, changelog, schema, errors) {
  const schemaErrors = validateCatalogSchema(manifest, schema);
  errors.push(...schemaErrors.map((error) => 'manifest ' + error));
  if (schemaErrors.length) return [];
  if (!Array.isArray(manifest.skills)) return [];
  if (packageJson.private !== true) errors.push('package.json must remain private to prevent accidental npm publication');
  if (typeof packageJson.version !== 'string' || !SEMVER.test(packageJson.version)) errors.push('package.json version must be semantic version text');
  const slugs = manifest.skills.map((entry) => entry?.slug);
  if (slugs.some((slug) => typeof slug !== 'string')) return [];
  sortedUnique(slugs, 'manifest skill slugs', errors);
  const known = new Set(slugs); let releaseDate;
  for (const entry of manifest.skills) {
    for (const field of ['tags', 'platforms', 'businessTypes', 'relatedSkills']) sortedUnique(entry[field], entry.slug + ' ' + field, errors, field === 'relatedSkills');
    for (const related of entry.relatedSkills || []) {
      if (!known.has(related)) errors.push(entry.slug + ' references an unknown skill: ' + related);
      if (related === entry.slug) errors.push(entry.slug + ' cannot relate to itself');
    }
    if (!validDate(entry.updatedAt)) errors.push(entry.slug + ' updatedAt must be a valid ISO calendar date');
    else if (releaseDate && releaseDate !== entry.updatedAt) errors.push('all skills in a release must use the same lifecycle date');
    else releaseDate = entry.updatedAt;
    const inputNames = (entry.inputs || []).map((input) => input?.name);
    if (new Set(inputNames).size !== inputNames.length) errors.push(entry.slug + ' input column names must be unique');
  }
  if (!changelog.includes('## ' + packageJson.version + ' - ' + releaseDate)) errors.push('CHANGELOG.md release version/date must match package.json and manifest lifecycle');
  const bundleIds = (manifest.bundles || []).map((bundle) => bundle.id);
  sortedUnique(bundleIds, 'bundle IDs', errors);
  for (const bundle of manifest.bundles || []) for (const slug of bundle.skills || []) if (!known.has(slug)) errors.push(bundle.id + ' references an unknown skill: ' + slug);
  return manifest.skills;
}

function resourceKind(name) {
  if (name === 'assets/input-template.csv') return 'template';
  if (name === 'assets/example-input.csv' || name === 'references/example-output.md') return 'example';
  if (name === 'scripts/marketing_math.py') return 'calculator';
  return 'reference';
}
export function makeCatalog(manifestSkills, loadedSkills, packageVersion, sourceSha, installerVersion, bundles = []) {
  const skills = [...manifestSkills].sort((a, b) => a.slug.localeCompare(b.slug, 'en')).map((entry) => {
    const loaded = loadedSkills.get(entry.slug);
    const archive = buildSkillZip(entry.slug, loaded.files);
    const download = { url: REPOSITORY_URL + '/releases/download/v' + packageVersion + '/' + entry.slug + '.zip', sha256: hash(archive), size: archive.length };
    return { ...entry, agents: ['codex', 'claude-code'], version: loaded.frontmatter.version, license: loaded.frontmatter.license,
      sourcePath: 'skills/' + entry.slug + '/SKILL.md', contentHash: loaded.files.get('SKILL.md').contentHash, instructions: loaded.frontmatter.body,
      resources: [...loaded.files.keys()].filter((name) => name !== 'SKILL.md').sort().map((name) => ({ path: name, kind: resourceKind(name), contentHash: loaded.files.get(name).contentHash })), download };
  });
  return { schemaVersion: SCHEMA_VERSION, releaseVersion: 'v' + packageVersion, repository: REPOSITORY_URL, sourceSha, installerVersion, skills, bundles };
}

export async function inspectSource(root = DEFAULT_ROOT, provenance = DEFAULT_PROVENANCE) {
  const errors = []; let manifest, packageJson, changelog, schema, manifestSchema;
  try {
    [manifest, packageJson, schema, manifestSchema] = await Promise.all(['skills/manifest.json', 'package.json', 'schemas/catalog.schema.json', 'schemas/manifest.schema.json'].map(async (name) => JSON.parse(await readFile(path.join(root, name), 'utf8'))));
    changelog = await readFile(path.join(root, 'CHANGELOG.md'), 'utf8');
  } catch (error) { return { errors: ['cannot read source contracts: ' + error.message], catalog: null }; }
  const manifestSkills = validateManifest(manifest, packageJson, changelog, manifestSchema, errors);
  try {
    const directory = await readdir(path.join(root, 'skills'), { withFileTypes: true });
    const names = directory.filter((item) => item.name !== 'manifest.json').map((item) => item.name).sort();
    const expected = manifestSkills.map((entry) => entry.slug).sort();
    if (JSON.stringify(names) !== JSON.stringify(expected)) errors.push('skills/ directories must match installable manifest slugs');
    for (const item of directory) if (item.isSymbolicLink() || (item.name === 'manifest.json' ? !item.isFile() : !item.isDirectory())) errors.push('unexpected skills/ path type: ' + item.name);
  } catch (error) { errors.push('cannot read skill directories: ' + error.message); }
  const loadedSkills = new Map();
  for (const entry of manifestSkills) {
    if (typeof entry.slug !== 'string' || !SLUG.test(entry.slug) || entry.slug.length > 63) continue;
    try {
      const files = await readPortableFiles(path.join(root, 'skills', entry.slug));
      const content = files.get('SKILL.md').text;
      const frontmatter = parseFrontmatter(content, entry.slug + '/SKILL.md', errors);
      if (!frontmatter) continue;
      if (frontmatter.name !== entry.slug) errors.push(entry.slug + ' frontmatter name must match its directory slug');
      if (frontmatter.description !== entry.description) errors.push(entry.slug + ' frontmatter description must match manifest');
      if (frontmatter.license !== 'MIT') errors.push(entry.slug + ' must declare MIT');
      if (frontmatter.version !== packageJson.version) errors.push(entry.slug + ' metadata.version must match package.json');
      for (const resource of files.keys()) if (resource !== 'SKILL.md' && !content.includes(resource)) errors.push(entry.slug + ' SKILL.md must explain when to load ' + resource);
      if (files.has('scripts/marketing_math.py')) {
        const canonical = await readFile(path.join(root, 'resources/marketing_math.py'));
        if (!canonical.equals(files.get('scripts/marketing_math.py').bytes)) errors.push(entry.slug + ' calculator bytes must match canonical resources/marketing_math.py');
      }
      if (entry.example?.inputCsv !== files.get('assets/example-input.csv').text) errors.push(entry.slug + ' example input must byte-match assets/example-input.csv');
      if (entry.example?.outputMarkdown !== files.get('references/example-output.md').text) errors.push(entry.slug + ' example output must byte-match references/example-output.md');
      for (const resource of ['assets/input-template.csv', 'assets/example-input.csv']) {
        const rows = parseCsv(files.get(resource).text);
        const inputNames = (entry.inputs || []).map((input) => input.name);
        if (JSON.stringify(rows[0]) !== JSON.stringify(inputNames)) errors.push(entry.slug + ' ' + resource + ' header must exactly match manifest inputs');
        if (resource.endsWith('input-template.csv') && rows.length !== 1) errors.push(entry.slug + ' template must contain a header only');
        if (resource.endsWith('example-input.csv') && rows.length < 2) errors.push(entry.slug + ' example must include complete data rows');
        if (rows.some((row) => row.length !== inputNames.length)) errors.push(entry.slug + ' CSV row width does not match inputs');
      }
      loadedSkills.set(entry.slug, { content, frontmatter, files });
    } catch (error) { errors.push('cannot validate ' + entry.slug + ': ' + error.message); }
  }
  let catalog = null;
  if (loadedSkills.size === manifestSkills.length && manifestSkills.length) {
    catalog = makeCatalog(manifestSkills, loadedSkills, packageJson.version, provenance.sourceSha, provenance.installerVersion, manifest.bundles);
    errors.push(...validateCatalogSchema(catalog, schema));
  }
  return { errors, catalog };
}
export async function validateSource(root = DEFAULT_ROOT, provenance) { return inspectSource(root, provenance); }
export async function readSchema(root = DEFAULT_ROOT) { return JSON.parse(await readFile(path.join(root, 'schemas/catalog.schema.json'), 'utf8')); }
