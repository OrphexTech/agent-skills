import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_ROOT, readPortableFiles } from './catalog.mjs';
import { READ_TOOLS, TRIPWIRE_TOOLS, findDateEnd } from './orphex_fixture_server.mjs';

const sha = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const FOLDERS = { routing: 'routing', connected: 'connected', behavioral: 'cases' };
export function currentTaskHash(testCase) {
  if (testCase.suite === 'routing') return sha({ request: testCase.request });
  return sha({ request: testCase.request, inputCsv: testCase.inputCsv, contextMarkdown: testCase.contextMarkdown, metricNames: testCase.metricNames, decisionNames: testCase.decisionNames, ...(testCase.suite === 'connected' && { server: testCase.server }) });
}
export function recordedTaskHash(record, testCase) {
  if (record.suite === 'routing') return sha({ request: record.task?.request || testCase.request });
  if (record.suite === 'connected') return sha({ request: record.task.request, inputCsv: record.inputCsv, contextMarkdown: record.contextMarkdown, metricNames: record.task.metricNames, decisionNames: record.task.decisionNames, server: record.connectedServer?.data });
  const task = record.task || { request: record.prompt?.split('\n\n')[2], metricNames: (record.prompt?.match(/named measurements: ([^.]+)\. decisions/)?.[1] || '').split(', ').filter(Boolean), decisionNames: (record.prompt?.match(/review judgments: ([^.]+)\. Express/)?.[1] || '').split(', ').filter(Boolean) };
  return sha({ request: task.request, inputCsv: record.inputCsv, contextMarkdown: record.contextMarkdown, metricNames: task.metricNames, decisionNames: task.decisionNames });
}
// Strict `passed` is unchanged. A decision label the case declares in
// `acceptableLabels` counts only toward the separate `labelEquivalentPassed`.
const labelEquivalentPass = (checks) => checks.every((check) => check.pass || check.equivalentLabel === true);
// Connector use is checked against the fixture server's call log: forbidden tools,
// reads not returned by search or not described first, late date_end values and
// required reads that never succeeded.
export function toolUseViolations(assertion, calls) {
  if (!Array.isArray(calls)) return ['connector call log unavailable'];
  const violations = [], returned = new Set(), described = new Set();
  for (const call of calls) {
    const args = call.arguments || {};
    if ((assertion.forbiddenTools || []).includes(call.tool)) violations.push('forbidden tool called: ' + call.tool);
    if (call.tool === 'capability_search' && call.ok) for (const id of call.returnedIds || []) returned.add(id);
    if (call.tool === 'capability_describe' && call.ok) described.add(args.id);
    if (call.tool !== 'run_read') continue;
    if (assertion.forbidRunRead) violations.push('run_read called: ' + args.id);
    if (!returned.has(args.id)) violations.push('read not returned by an earlier capability_search: ' + args.id);
    if (!described.has(args.id)) violations.push('read not described before run_read: ' + args.id);
    for (const value of findDateEnd(args.inputs)) if (value > assertion.latestDateEnd) violations.push('date_end after ' + assertion.latestDateEnd + ': ' + value);
  }
  for (const id of assertion.requiredReads || []) if (!calls.some((call) => call.tool === 'run_read' && call.ok && call.arguments?.id === id)) violations.push('required read not run: ' + id);
  return violations;
}
export function gradeAnswer(testCase, answer, calls) {
  if (!answer || typeof answer !== 'object') return { passed: false, labelEquivalentPassed: false, criticalFailures: 1, checks: [{ pass: false, critical: true, reason: 'no structured behavioral result' }] };
  const checks = testCase.assertions.map((assertion) => {
    let actual, pass, equivalentLabel = false;
    if (assertion.kind === 'number') {
      actual = answer.metrics?.[assertion.key];
      pass = assertion.expected === null ? actual === null : typeof actual === 'number' && Number.isFinite(actual) && Math.abs(actual - assertion.expected) <= assertion.tolerance;
    } else if (assertion.kind === 'decision') {
      actual = answer.decisions?.[assertion.key];
      pass = actual === assertion.expected;
      equivalentLabel = !pass && (assertion.acceptableLabels || []).includes(actual);
    } else if (assertion.kind === 'selection') {
      actual = answer.selectedSkills;
      pass = Array.isArray(actual) && new Set(actual).size === actual.length && ((actual.length > 0) === (assertion.expected.length > 0)) && actual.every((slug) => assertion.expected.includes(slug)) && assertion.required.every((slug) => actual.includes(slug));
    } else if (assertion.kind === 'tool-use') {
      actual = toolUseViolations(assertion, calls);
      pass = actual.length === 0;
    } else return { ...assertion, pass: false, reason: 'unsupported assertion kind' };
    return { ...assertion, actual, pass, ...(equivalentLabel && { equivalentLabel }) };
  });
  return { passed: checks.every((check) => check.pass), labelEquivalentPassed: labelEquivalentPass(checks), criticalFailures: checks.filter((check) => check.critical && !check.pass).length, checks,
    humanReviewRequired: testCase.humanReview, disclosure: 'Numeric and structured decision checks only; independent narrative and tool review of evidence, actionable output and tool behavior remains required. passed is strict; labelEquivalentPassed also accepts declared acceptableLabels and never changes passed.' };
}
export function checkClaudeToolBoundary(record) {
  if (record.runtime !== 'claude') return [];
  const failures = [];
  if (record.nativeTraceMode !== 'stream-json-verbose' || !Array.isArray(record.observedToolCalls)) return ['required native Claude tool trace unavailable'];
  // Connected runs may call the fixture server; tripwire calls fail its tool-use assertion.
  const allowed = new Set(['Read', 'StructuredOutput', ...(record.mode === 'skilled' ? ['Skill'] : []), ...(record.suite === 'connected' ? [...READ_TOOLS, ...TRIPWIRE_TOOLS].map((name) => 'mcp__orphex__' + name) : [])]);
  const directory = record.scratchDirectory;
  if (typeof directory !== 'string' || !path.isAbsolute(directory)) return ['exact recorded scratch directory unavailable for tool-scope proof'];
  const base = path.resolve(directory);
  const installedSkills = new Set((record.resourceHashes || []).filter((file) => typeof file.path === 'string' && /^[a-z0-9-]+\/SKILL\.md$/.test(file.path)).map((file) => file.path.split('/')[0]));
  const mapping = record.installMode === 'ephemeral-session-plugin' ? record.nativeSkillNames || [] : [...installedSkills].map((sourceSlug) => ({ sourceSlug, nativeName: sourceSlug }));
  const nativeSkills = new Set(mapping.filter((entry) => installedSkills.has(entry.sourceSlug) && entry.nativeName === (record.installMode === 'ephemeral-session-plugin' ? 'orphex-eval:' : '') + entry.sourceSlug).map((entry) => entry.nativeName));
  const successfulActivations = new Set();
  for (const tool of record.observedToolCalls) {
    if (!allowed.has(tool.name)) { failures.push('unexpected native tool requested: ' + tool.name); continue; }
    if (tool.name === 'Read') {
      const requested = tool.input?.file_path;
      if (typeof requested !== 'string' || !path.isAbsolute(requested) || path.normalize(requested) !== requested) { failures.push('Read tool path is not an absolute canonical task path'); continue; }
      const resolved = path.resolve(requested);
      if (resolved !== base && !resolved.startsWith(base + path.sep)) failures.push('Read path outside exact task directory: ' + requested);
    }
    if (tool.name === 'Skill') {
      if (!nativeSkills.has(tool.input?.skill)) failures.push('Skill activation outside installed task packages: ' + tool.input?.skill);
      const result = (record.observedToolResults || []).find((item) => item.tool_use_id === tool.id);
      if (!result || result.is_error || typeof result.content !== 'string' || result.content.trim() !== 'Launching skill: ' + tool.input?.skill) failures.push('native Skill activation did not succeed: ' + tool.input?.skill);
      else successfulActivations.add(tool.input?.skill);
    }
  }
  if (record.mode === 'skilled') {
    if (nativeSkills.size !== installedSkills.size) failures.push('native skill identity mapping is incomplete or invalid');
    if (!Array.isArray(record.nativeInitSkills) || [...nativeSkills].some((name) => !record.nativeInitSkills.includes(name))) failures.push('native initialization did not discover every installed task skill');
    if (record.suite !== 'routing') {
      const required = mapping.find((entry) => entry.sourceSlug === record.skill)?.nativeName;
      if (!required || !successfulActivations.has(required)) failures.push('required behavioral skill has no successful native activation');
    }
  }
  return failures;
}
export function gradeRun(testCase, record) {
  const grade = gradeAnswer(testCase, record.answer, record.connectedCalls);
  const failures = checkClaudeToolBoundary(record);
  if (record.exitCode !== 0) failures.push('native process did not exit successfully');
  if (record.timedOut) failures.push('native process timed out');
  if (record.spawnError) failures.push('native process failed to spawn');
  if (record.parseError) failures.push('native structured result parsing failed');
  if (record.nativeMetadata?.is_error) failures.push('Claude native result is an error');
  for (const reason of failures) grade.checks.push({ pass: false, critical: true, reason });
  grade.criticalFailures += failures.length;
  grade.passed = grade.passed && failures.length === 0;
  grade.labelEquivalentPassed = grade.labelEquivalentPassed && failures.length === 0;
  return grade;
}
async function main() {
  const directory = process.argv[2];
  if (!directory) throw new Error('Usage: npm run evaluate:grade -- RAW_RESULTS_DIRECTORY');
  const entries = [];
  for (const name of (await readdir(directory)).filter((name) => name.endsWith('.json') && name !== 'grades.json').sort()) {
    const record = JSON.parse(await readFile(path.join(directory, name), 'utf8'));
    if (!record.caseId || !record.runtime) continue;
    const testCase = JSON.parse(await readFile(path.join(DEFAULT_ROOT, 'evaluations', FOLDERS[record.suite || 'behavioral'], record.caseId + '.json'), 'utf8'));
    const grade = gradeRun(testCase, record);
    if (record.mode === 'skilled') {
      const manifest = JSON.parse(await readFile(path.join(DEFAULT_ROOT, 'skills/manifest.json'), 'utf8'));
      const slugs = record.suite === 'routing' ? manifest.skills.map((skill) => skill.slug) : [testCase.skill];
      const finalResourceHashes = [];
      for (const slug of slugs) {
        const portable = await readPortableFiles(path.join(DEFAULT_ROOT, 'skills', slug));
        finalResourceHashes.push(...[...portable.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => ({ path: slug + '/' + name, sha256: value.contentHash })));
      }
      if (JSON.stringify(finalResourceHashes) !== JSON.stringify(record.resourceHashes)) {
        grade.passed = false; grade.labelEquivalentPassed = false; grade.criticalFailures += 1;
        grade.checks.push({ pass: false, critical: true, reason: 'recorded instruction/resource hashes differ from final source; rerun required' });
      }
    }
    const taskInputHash = recordedTaskHash(record, testCase);
    if (taskInputHash !== currentTaskHash(testCase)) { grade.passed = false; grade.labelEquivalentPassed = false; grade.criticalFailures += 1; grade.checks.push({ pass: false, critical: true, reason: 'recorded task inputs/request/schema differ from current fixture' }); }
    entries.push({ caseId: record.caseId, suite: record.suite || 'behavioral', runtime: record.runtime, mode: record.mode, instructionHash: record.instructionHash, fixtureHash: record.fixtureHash, taskInputHash, currentRubricHash: sha(testCase.assertions), rubricUpdatedSinceRun: record.fixtureHash !== sha(testCase),
      model: record.model, exitCode: record.exitCode, parseError: record.parseError, ...grade, rawRecord: name });
  }
  const pairs = [];
  for (const skilled of entries.filter((entry) => entry.mode === 'skilled' && entry.suite !== 'routing')) {
    const baseline = entries.find((entry) => entry.caseId === skilled.caseId && entry.runtime === skilled.runtime && entry.mode === 'baseline' && entry.taskInputHash === skilled.taskInputHash);
    if (baseline) pairs.push({ caseId: skilled.caseId, suite: skilled.suite, runtime: skilled.runtime, baselinePassed: baseline.passed, skilledPassed: skilled.passed,
      baselineLabelEquivalentPassed: baseline.labelEquivalentPassed, skilledLabelEquivalentPassed: skilled.labelEquivalentPassed, baselineCriticalFailures: baseline.criticalFailures, skilledCriticalFailures: skilled.criticalFailures, modelMatch: baseline.model !== null && baseline.model === skilled.model });
  }
  const report = { generatedAt: new Date().toISOString(), entries, pairs, disclosure: 'One or more synthetic cases per skill; no real-account performance or causal business uplift established. Machine grades require independent narrative and tool review before publication. labelEquivalentPassed is post hoc for any entry whose rubricUpdatedSinceRun is true.' };
  await writeFile(path.join(directory, 'grades.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('Graded ' + entries.length + ' actual run records; ' + pairs.length + ' paired baseline comparisons; ' + entries.filter((entry) => !entry.passed).length + ' need correction/review, ' + entries.filter((entry) => !entry.passed && entry.labelEquivalentPassed).length + ' of them only for a declared equivalent label.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.join(DEFAULT_ROOT, 'scripts/grade_evaluations.mjs')) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
