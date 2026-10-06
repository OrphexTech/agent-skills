import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPOSITORY_URL = 'https://github.com/OrphexTech/agent-skills';
export const SCHEMA_VERSION = 1;
export const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MANIFEST_FIELDS = [
  'slug',
  'title',
  'description',
  'outcome',
  'category',
  'tags',
  'updatedAt',
  'requirements',
  'relatedSkills'
];
const CATEGORIES = new Set(['performance', 'creative', 'conversion', 'measurement']);
const SEMVER = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
const SLUG = /^orphex-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TAG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function exactKeys(value, expected, label, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(label + ' must be an object');
    return false;
  }
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(required)) {
    errors.push(label + ' must contain exactly: ' + expected.join(', '));
    return false;
  }
  return true;
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateSortedUniqueStrings(values, pattern, label, errors) {
  if (!Array.isArray(values) || values.length === 0) {
    errors.push(label + ' must be a non-empty array');
    return;
  }
  const sorted = [...values].sort();
  if (new Set(values).size !== values.length) errors.push(label + ' must not contain duplicates');
  if (JSON.stringify(values) !== JSON.stringify(sorted)) errors.push(label + ' must be sorted lexically');
  for (const value of values) {
    if (typeof value !== 'string' || !pattern.test(value)) {
      errors.push(label + ' contains an invalid value: ' + String(value));
    }
  }
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

function validateManifest(manifest, packageJson, changelog, errors) {
  if (!exactKeys(manifest, ['schemaVersion', 'skills'], 'skills/manifest.json', errors)) return [];
  if (manifest.schemaVersion !== SCHEMA_VERSION) errors.push('manifest schemaVersion must be ' + SCHEMA_VERSION);
  if (!Array.isArray(manifest.skills)) {
    errors.push('manifest skills must be an array');
    return [];
  }
  const slugs = manifest.skills.map((item) => item && item.slug).filter((slug) => typeof slug === 'string');
  if (manifest.skills.length === 0) errors.push('manifest skills must contain at least one installable skill');
  if (JSON.stringify(slugs) !== JSON.stringify([...slugs].sort())) {
    errors.push('manifest skills must be sorted lexically by slug');
  }
  if (new Set(slugs).size !== slugs.length) errors.push('manifest skill slugs must be unique');
  const version = packageJson && packageJson.version;
  if (packageJson && packageJson.private !== true) {
    errors.push('package.json must remain private to prevent accidental npm publication');
  }
  if (typeof version !== 'string' || !SEMVER.test(version)) {
    errors.push('package.json version must be semantic version text');
  }
  if (typeof changelog !== 'string' || !changelog.includes('## ' + version + ' - ')) {
    errors.push('CHANGELOG.md must contain a heading for package.json version ' + String(version));
  }

  const known = new Set(slugs);
  let releaseDate;
  for (const entry of manifest.skills) {
    if (!exactKeys(entry, MANIFEST_FIELDS, 'manifest entry', errors)) continue;
    if (typeof entry.slug !== 'string' || !SLUG.test(entry.slug) || entry.slug.length > 63) {
      errors.push('invalid skill slug: ' + String(entry.slug));
    }
    for (const field of ['title', 'description', 'outcome']) {
      if (typeof entry[field] !== 'string' || !entry[field].trim()) {
        errors.push(entry.slug + ' ' + field + ' must be a non-empty string');
      }
    }
    if (entry.description && entry.description.length > 300) {
      errors.push(entry.slug + ' description must be 300 characters or fewer');
    }
    if (!CATEGORIES.has(entry.category)) errors.push(entry.slug + ' has an unsupported category');
    validateSortedUniqueStrings(entry.tags, TAG, entry.slug + ' tags', errors);
    if (!Array.isArray(entry.requirements) || entry.requirements.length === 0 ||
        entry.requirements.some((value) => typeof value !== 'string' || !value.trim())) {
      errors.push(entry.slug + ' requirements must contain non-empty strings');
    }
    validateSortedUniqueStrings(entry.relatedSkills, SLUG, entry.slug + ' relatedSkills', errors);
    if (Array.isArray(entry.relatedSkills)) {
      if (entry.relatedSkills.includes(entry.slug)) errors.push(entry.slug + ' cannot relate to itself');
      for (const related of entry.relatedSkills) {
        if (!known.has(related)) errors.push(entry.slug + ' references an unknown skill: ' + related);
      }
    }
    if (!validDate(entry.updatedAt)) {
      errors.push(entry.slug + ' updatedAt must be a valid ISO calendar date');
    } else if (releaseDate && releaseDate !== entry.updatedAt) {
      errors.push('all skills in a release must use the same lifecycle date');
    } else {
      releaseDate = entry.updatedAt;
    }
  }
  if (releaseDate && typeof changelog === 'string' &&
      !changelog.includes('## ' + version + ' - ' + releaseDate)) {
    errors.push('CHANGELOG.md release date must match the manifest lifecycle date');
  }
  return manifest.skills;
}

function validateSchemaValue(value, schema, location, errors) {
  if (Object.hasOwn(schema, 'const') && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push(location + ' must equal ' + JSON.stringify(schema.const));
    return;
  }
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(location + ' must be an object');
      return;
    }
    for (const required of schema.required || []) {
      if (!Object.hasOwn(value, required)) errors.push(location + ' is missing ' + required);
    }
    for (const key of Object.keys(value)) {
      if (schema.additionalProperties === false && !Object.hasOwn(schema.properties || {}, key)) {
        errors.push(location + ' has unexpected property ' + key);
      } else if (Object.hasOwn(schema.properties || {}, key)) {
        validateSchemaValue(value[key], schema.properties[key], location + '.' + key, errors);
      }
    }
    return;
  }
  if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(location + ' must be an array');
      return;
    }
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(location + ' has fewer than ' + schema.minItems + ' items');
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(location + ' has more than ' + schema.maxItems + ' items');
    }
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      errors.push(location + ' must not contain duplicate items');
    }
    for (let index = 0; index < value.length; index += 1) {
      validateSchemaValue(value[index], schema.items || {}, location + '[' + index + ']', errors);
    }
    return;
  }
  if (schema.type === 'string' && typeof value !== 'string') {
    errors.push(location + ' must be a string');
    return;
  }
  if (schema.type === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(location + ' is too short');
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(location + ' is too long');
    if (schema.pattern && !(new RegExp(schema.pattern)).test(value)) errors.push(location + ' does not match its required pattern');
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(location + ' is not an allowed value');
}

export function validateCatalogSchema(catalog, schema) {
  const errors = [];
  validateSchemaValue(catalog, schema, '$', errors);
  return errors;
}

export function makeCatalog(manifestSkills, loadedSkills, packageVersion, sourceSha, installerVersion) {
  const skills = [...manifestSkills].sort((a, b) => a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0).map((entry) => {
    const loaded = loadedSkills.get(entry.slug);
    const skill = {
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      outcome: entry.outcome,
      category: entry.category,
      tags: [...entry.tags],
      agents: ['codex', 'claude-code'],
      updatedAt: entry.updatedAt,
      version: loaded.frontmatter.version,
      license: loaded.frontmatter.license,
      requirements: [...entry.requirements],
      relatedSkills: [...entry.relatedSkills],
      sourcePath: 'skills/' + entry.slug + '/SKILL.md',
      contentHash: createHash('sha256').update(loaded.content, 'utf8').digest('hex'),
      instructions: loaded.frontmatter.body
    };
    return skill;
  });
  return {
    schemaVersion: SCHEMA_VERSION,
    releaseVersion: 'v' + packageVersion,
    repository: REPOSITORY_URL,
    sourceSha,
    installerVersion,
    skills
  };
}

export async function inspectSource(root = DEFAULT_ROOT, provenance = {
  sourceSha: '0000000000000000000000000000000000000000',
  installerVersion: '1.7.0'
}) {
  const errors = [];
  let manifest;
  let packageJson;
  let changelog;
  let schema;
  try {
    manifest = JSON.parse(await readFile(path.join(root, 'skills/manifest.json'), 'utf8'));
  } catch (error) {
    errors.push('cannot read skills/manifest.json: ' + error.message);
  }
  try {
    packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  } catch (error) {
    errors.push('cannot read package.json: ' + error.message);
  }
  try {
    changelog = await readFile(path.join(root, 'CHANGELOG.md'), 'utf8');
  } catch (error) {
    errors.push('cannot read CHANGELOG.md: ' + error.message);
  }
  try {
    schema = JSON.parse(await readFile(path.join(root, 'schemas/catalog.schema.json'), 'utf8'));
  } catch (error) {
    errors.push('cannot read schemas/catalog.schema.json: ' + error.message);
  }
  if (!manifest || !packageJson || !schema) return { errors, catalog: null };

  const manifestSkills = validateManifest(manifest, packageJson, changelog, errors);
  try {
    const entries = await readdir(path.join(root, 'skills'), { withFileTypes: true });
    const names = entries.filter((item) => item.name !== 'manifest.json').map((item) => item.name).sort();
    const manifestNames = manifestSkills.map((item) => item && item.slug)
      .filter((slug) => typeof slug === 'string')
      .sort();
    if (JSON.stringify(names) !== JSON.stringify(manifestNames)) {
      errors.push('skills/ directories must match the installable slugs in skills/manifest.json');
    }
    for (const item of entries) {
      if (item.name === 'manifest.json') {
        if (!item.isFile()) errors.push('skills/manifest.json must be a regular file');
      } else if (!item.isDirectory()) {
        errors.push('unexpected non-directory under skills/: ' + item.name);
      }
    }
  } catch (error) {
    errors.push('cannot read skills directory: ' + error.message);
  }

  const loadedSkills = new Map();
  for (const entry of manifestSkills) {
    if (!entry || typeof entry.slug !== 'string' || !SLUG.test(entry.slug) || entry.slug.length > 63) continue;
    const dirPath = path.join(root, 'skills', entry.slug);
    const skillPath = path.join(dirPath, 'SKILL.md');
    try {
      const directory = await readdir(dirPath, { withFileTypes: true });
      if (directory.length !== 1 || directory[0].name !== 'SKILL.md' || !directory[0].isFile()) {
        errors.push(entry.slug + ' directory must contain only its SKILL.md source file');
        continue;
      }
      const content = await readFile(skillPath, 'utf8');
      const frontmatter = parseFrontmatter(content, 'skills/' + entry.slug + '/SKILL.md', errors);
      if (!frontmatter) continue;
      if (frontmatter.name !== entry.slug) errors.push(entry.slug + ' frontmatter name must match its directory slug');
      if (frontmatter.description !== entry.description) errors.push(entry.slug + ' frontmatter description must match the manifest');
      if (frontmatter.license !== 'MIT') errors.push(entry.slug + ' must declare the MIT license');
      if (frontmatter.version !== packageJson.version) errors.push(entry.slug + ' metadata.version must match package.json');
      if (!SEMVER.test(frontmatter.version)) errors.push(entry.slug + ' metadata.version must be semantic version text');
      loadedSkills.set(entry.slug, { content, frontmatter });
    } catch (error) {
      errors.push('cannot read ' + entry.slug + '/SKILL.md: ' + error.message);
    }
  }

  let catalog = null;
  if (loadedSkills.size === manifestSkills.length && manifestSkills.every((entry) => loadedSkills.has(entry.slug))) {
    catalog = makeCatalog(manifestSkills, loadedSkills, packageJson.version, provenance.sourceSha, provenance.installerVersion);
    errors.push(...validateCatalogSchema(catalog, schema));
    for (const skill of catalog.skills) {
      if (!validDate(skill.updatedAt)) errors.push(skill.slug + ' catalog updatedAt is not a valid date');
      if (skill.sourcePath !== 'skills/' + skill.slug + '/SKILL.md') errors.push(skill.slug + ' catalog sourcePath is not canonical');
    }
  }
  return { errors, catalog };
}

export async function validateSource(root = DEFAULT_ROOT, provenance) {
  return inspectSource(root, provenance);
}

export async function readSchema(root = DEFAULT_ROOT) {
  return JSON.parse(await readFile(path.join(root, 'schemas/catalog.schema.json'), 'utf8'));
}
