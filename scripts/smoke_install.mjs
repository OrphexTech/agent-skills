import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_ROOT, readPortableFiles } from './catalog.mjs';

const installerVersion = '1.7.0';
const repositoryUrl = 'https://github.com/OrphexTech/agent-skills';
const agents = ['codex', 'claude-code'];

function parseSourceMode(args) {
  if (args.length === 0) return 'local';
  if (args.length !== 2 || args[0] !== '--source') {
    throw new Error('Usage: npm run smoke:install -- [--source local|published-release]');
  }
  if (args[1] !== 'local' && args[1] !== 'published-release') {
    throw new Error('Smoke source must be exactly "local" or "published-release".');
  }
  return args[1];
}

function runInstaller(args, cwd, env) {
  try {
    return execFileSync('npx', ['--yes', 'skills@' + installerVersion, ...args], {
      cwd,
      env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024
    });
  } catch (error) {
    const stdout = error.stdout ? String(error.stdout) : '';
    const stderr = error.stderr ? String(error.stderr) : '';
    throw new Error('npx skills@' + installerVersion + ' ' + args.join(' ') + ' failed.\n' + stdout + stderr);
  }
}

function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function isDisposableGitHubRunner() {
  const reasons = [];
  if (process.env.GITHUB_ACTIONS !== 'true') reasons.push('GITHUB_ACTIONS is not true');
  if (process.env.RUNNER_ENVIRONMENT !== 'github-hosted') reasons.push('runner is not identified as GitHub-hosted');
  if (os.homedir() !== '/home/runner') reasons.push('runner home is not /home/runner');
  if (process.env.HOME !== '/home/runner') reasons.push('HOME is not the runner home');

  const expectedRunnerRoot = path.join('/home/runner', 'work') + path.sep;
  const runnerTemp = process.env.RUNNER_TEMP ? path.resolve(process.env.RUNNER_TEMP) : '';
  const workspace = process.env.GITHUB_WORKSPACE ? path.resolve(process.env.GITHUB_WORKSPACE) : '';
  if (!runnerTemp || !runnerTemp.startsWith(expectedRunnerRoot)) {
    reasons.push('RUNNER_TEMP is missing or outside /home/runner/work');
  } else {
    const runnerTempStat = await stat(runnerTemp).catch(() => null);
    if (!runnerTempStat?.isDirectory()) reasons.push('RUNNER_TEMP is not an existing directory');
  }
  if (!workspace || !workspace.startsWith(expectedRunnerRoot)) {
    reasons.push('GITHUB_WORKSPACE is missing or outside /home/runner/work');
  }
  if (process.env.CODEX_HOME) reasons.push('CODEX_HOME is set, so Codex would not use its normal home path');
  if (process.env.CLAUDE_CONFIG_DIR) reasons.push('CLAUDE_CONFIG_DIR is set, so Claude Code would not use its normal home path');

  return { verified: reasons.length === 0, reasons };
}

function getTargetBase(agent, scope, projectRoot) {
  if (agent === 'codex') {
    return scope === 'global'
      ? path.join(os.homedir(), '.agents', 'skills')
      : path.join(projectRoot, '.agents', 'skills');
  }
  if (scope === 'project') return path.join(projectRoot, '.claude', 'skills');
  return path.join(os.homedir(), '.claude', 'skills');
}

function getCodexCanonicalBase(scope, projectRoot) {
  return scope === 'global'
    ? path.join(os.homedir(), '.agents', 'skills')
    : path.join(projectRoot, '.agents', 'skills');
}

function getInstallSource(sourceMode, packageVersion, slug) {
  if (sourceMode === 'local') return DEFAULT_ROOT;
  return repositoryUrl + '/tree/v' + packageVersion + '/skills/' + slug;
}

function assertPublishedTag(packageVersion) {
  const expectedTag = 'v' + packageVersion;
  if (process.env.GITHUB_REF_TYPE !== 'tag' || process.env.GITHUB_REF_NAME !== expectedTag) {
    throw new Error(
      'published-release smoke must run from the exact matching tag ' + expectedTag +
      ' after that tag is publicly reachable.'
    );
  }
}

async function assertPathsAbsent(targetBase, skills, agent, scope) {
  for (const skill of skills) {
    const installDirectory = path.join(targetBase, skill.slug);
    const existing = await lstat(installDirectory).catch(() => null);
    if (existing) {
      throw new Error(agent + ' ' + scope + ' smoke will not overwrite pre-existing ' + installDirectory);
    }
  }
}

async function removeSkills(projectRoot, env, agent, scope, skills) {
  if (skills.length === 0) return;
  const args = ['remove', ...skills.map((skill) => skill.slug), '--agent', agent, '--yes'];
  if (scope === 'global') args.push('--global');
  return runInstaller(args, projectRoot, env);
}

async function removeAndVerify({ agent, scope, projectRoot, env, targetBase, skills }) {
  const cliOutput = await removeSkills(projectRoot, env, agent, scope, skills);
  const retainedCanonical = [];

  for (const skill of skills) {
    const installDirectory = path.join(targetBase, skill.slug);
    const remaining = await lstat(installDirectory).catch(() => null);
    if (!remaining) continue;

    const expectedCanonicalBase = getCodexCanonicalBase(scope, projectRoot);
    const expectedCanonicalDirectory = path.join(expectedCanonicalBase, skill.slug);
    if (
      agent !== 'codex' ||
      path.resolve(targetBase) !== path.resolve(expectedCanonicalBase) ||
      path.resolve(installDirectory) !== path.resolve(expectedCanonicalDirectory)
    ) {
      throw new Error('Skills CLI remove left an unexpected installation path: ' + installDirectory);
    }
    if (!remaining.isDirectory() || remaining.isSymbolicLink()) {
      throw new Error('Skills CLI retained a non-directory Codex canonical path; refusing manual cleanup: ' + installDirectory);
    }

    await verifyInstalledFiles(installDirectory, skill, agent, scope);

    // v1.7.0 can preserve a universal-agent canonical copy when another detected
    // agent shares that root. This exact directory was checked absent pre-install.
    await rm(installDirectory, { recursive: true });
    retainedCanonical.push(installDirectory);
  }

  for (const skill of skills) {
    const installDirectory = path.join(targetBase, skill.slug);
    const remaining = await lstat(installDirectory).catch(() => null);
    if (remaining) throw new Error('Skill remains after CLI removal and verified canonical cleanup: ' + installDirectory);
  }

  if (retainedCanonical.length > 0) {
    console.log('Skills CLI remove exited successfully but retained shared Codex canonical copies; removed only the hash-verified smoke copies at: ' + retainedCanonical.join(', '));
  } else {
    console.log('Skills CLI remove deleted all selected skill directories.');
  }
  return cliOutput;
}

async function verifyInstalledFiles(directory, skill, agent, scope) {
  const installed = await readPortableFiles(directory);
  if (JSON.stringify([...installed.keys()].sort()) !== JSON.stringify([...skill.files.keys()].sort())) {
    throw new Error(agent + ' ' + scope + ' resource set differs for ' + skill.slug);
  }
  for (const [name, file] of skill.files) {
    if (installed.get(name)?.contentHash !== file.contentHash) {
      throw new Error(agent + ' ' + scope + ' installed ' + skill.slug + '/' + name + ' hash differs from the checked-out release');
    }
  }
}

function verifyListing({ skills, agent, scope, projectRoot, env }) {
  const args = ['list', '--agent', agent, '--json'];
  if (scope === 'global') args.push('--global');
  const listing = runInstaller(args, projectRoot, env);
  let listed;
  try { listed = JSON.parse(listing); } catch { throw new Error('Skills CLI list did not produce valid JSON'); }
  if (!Array.isArray(listed)) throw new Error('Skills CLI list JSON must be an array');
  const listedNames = new Set(listed.map((entry) => entry.name));
  for (const skill of skills) if (!listedNames.has(skill.slug)) throw new Error(agent + ' ' + scope + ' list output did not include ' + skill.slug);
}

async function smokeCase({ agent, scope, projectRoot, env, packageVersion, sourceMode, skills }) {
  const targetBase = getTargetBase(agent, scope, projectRoot);
  await assertPathsAbsent(targetBase, skills, agent, scope);

  const installedSkills = [];
  let removalAttempted = false;
  try {
    for (const skill of skills) {
      const addArgs = [
        'add',
        getInstallSource(sourceMode, packageVersion, skill.slug),
        '--skill',
        skill.slug,
        '--agent',
        agent,
        '--copy',
        '--yes'
      ];
      if (scope === 'global') addArgs.push('--global');
      try {
        runInstaller(addArgs, projectRoot, env);
        installedSkills.push(skill);
      } catch (error) {
        const installDirectory = path.join(targetBase, skill.slug);
        if (await lstat(installDirectory).catch(() => null)) installedSkills.push(skill);
        throw error;
      }
    }

    for (const skill of skills) await verifyInstalledFiles(path.join(targetBase, skill.slug), skill, agent, scope);

    verifyListing({ skills, agent, scope, projectRoot, env });

    removalAttempted = true;
    await removeAndVerify({ agent, scope, projectRoot, env, targetBase, skills: installedSkills });
    console.log('Passed ' + agent + ' ' + scope + ' install, list, hash, and removal checks for all ' + skills.length + ' skills.');
  } finally {
    if (installedSkills.length > 0 && !removalAttempted) {
      removalAttempted = true;
      await removeAndVerify({ agent, scope, projectRoot, env, targetBase, skills: installedSkills });
    }
  }
}

async function smokeBundle({ bundle, skills, projectRoot, env, packageVersion, sourceMode, agent, scope }) {
  const selected = bundle.skills.map((slug) => skills.find((skill) => skill.slug === slug));
  if (selected.some((skill) => !skill)) throw new Error('bundle references unknown skill');
  const targetBase = getTargetBase(agent, scope, projectRoot);
  await assertPathsAbsent(targetBase, selected, agent, scope);
  const args = ['add', sourceMode === 'local' ? DEFAULT_ROOT : repositoryUrl + '/tree/v' + packageVersion + '/skills', '--skill', ...bundle.skills, '--agent', agent, '--copy', '--yes'];
  if (scope === 'global') args.push('--global');
  try {
    runInstaller(args, projectRoot, env);
    for (const skill of selected) await verifyInstalledFiles(path.join(targetBase, skill.slug), skill, agent, scope);
    verifyListing({ skills: selected, agent, scope, projectRoot, env });
    console.log('Passed bundle ' + bundle.id + ' for ' + agent + ' ' + scope + '.');
  } finally {
    const installed = [];
    for (const skill of selected) if (await lstat(path.join(targetBase, skill.slug)).catch(() => null)) installed.push(skill);
    await removeAndVerify({ agent, scope, projectRoot, env, targetBase, skills: installed });
  }
}

async function main() {
  const sourceMode = parseSourceMode(process.argv.slice(2));
  const packageJson = JSON.parse(await readFile(path.join(DEFAULT_ROOT, 'package.json'), 'utf8'));
  const manifest = JSON.parse(await readFile(path.join(DEFAULT_ROOT, 'skills/manifest.json'), 'utf8'));
  const skills = await Promise.all(manifest.skills.map(async (entry) => ({
    slug: entry.slug,
    files: await readPortableFiles(path.join(DEFAULT_ROOT, 'skills', entry.slug))
  })));

  if (sourceMode === 'published-release') assertPublishedTag(packageJson.version);

  const runnerStatus = await isDisposableGitHubRunner();
  const scopes = ['project'];
  if (runnerStatus.verified) {
    scopes.push('global');
    console.log('Verified GitHub-hosted runner; global checks will use the pinned CLI paths /home/runner/.agents/skills and /home/runner/.claude/skills.');
  } else {
    console.warn('Skipped global install checks; they run only on a verified disposable GitHub-hosted runner. ' + runnerStatus.reasons.join('; ') + '.');
  }

  const scratchBase = runnerStatus.verified ? process.env.RUNNER_TEMP : os.tmpdir();
  const scratchRoot = await mkdtemp(path.join(scratchBase, 'orphex-skills-install-smoke-'));
  const npmCache = path.join(scratchRoot, 'npm-cache');
  await mkdir(npmCache, { recursive: true });

  try {
    for (const agent of agents) {
      for (const scope of scopes) {
        const caseRoot = path.join(scratchRoot, agent + '-' + scope);
        const projectRoot = path.join(caseRoot, 'project');
        await mkdir(projectRoot, { recursive: true });

        const env = {
          ...process.env,
          DO_NOT_TRACK: '1',
          NPM_CONFIG_CACHE: npmCache,
          XDG_STATE_HOME: path.join(caseRoot, 'xdg-state')
        };
        await mkdir(env.XDG_STATE_HOME, { recursive: true });
        if (scope === 'project') {
          await writeFile(path.join(projectRoot, 'package.json'), '{"private":true}\n', 'utf8');
          execFileSync('git', ['init', '--quiet'], { cwd: projectRoot, stdio: 'ignore' });
        }

        const parameters = { agent, scope, projectRoot, env, packageVersion: packageJson.version, sourceMode, skills };
        await smokeCase(parameters);
        for (const bundle of manifest.bundles) await smokeBundle({ ...parameters, bundle });
      }
    }
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
