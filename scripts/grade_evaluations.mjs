import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_ROOT, readPortableFiles } from './catalog.mjs';

const sha = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function recordedTaskHash(record, testCase) {
  if (record.suite === 'routing') return sha({ request: record.task?.request || testCase.request });
  const task = record.task || { request: record.prompt?.split('\n\n')[2], metricNames: (record.prompt?.match(/named measurements: ([^.]+)\. decisions/)?.[1] || '').split(', ').filter(Boolean), decisionNames: (record.prompt?.match(/review judgments: ([^.]+)\. Express/)?.[1] || '').split(', ').filter(Boolean) };
  return sha({ request: task.request, inputCsv: record.inputCsv, contextMarkdown: record.contextMarkdown, metricNames: task.metricNames, decisionNames: task.decisionNames });
}
export function gradeAnswer(testCase, answer) {
  if (!answer || typeof answer !== 'object') return { passed: false, criticalFailures: 1, checks: [{ pass: false, critical: true, reason: 'no structured behavioral result' }] };
  const checks = testCase.assertions.map((assertion) => {
    let actual, pass;
    if (assertion.kind === 'number') {
      actual = answer.metrics?.[assertion.key];
      pass = assertion.expected === null ? actual === null : typeof actual === 'number' && Number.isFinite(actual) && Math.abs(actual - assertion.expected) <= assertion.tolerance;
    } else if (assertion.kind === 'decision') {
      actual = answer.decisions?.[assertion.key];
      pass = actual === assertion.expected;
    } else if (assertion.kind === 'selection') {
      actual = answer.selectedSkills;
      pass = Array.isArray(actual) && new Set(actual).size === actual.length && ((actual.length > 0) === (assertion.expected.length > 0)) && actual.every((slug) => assertion.expected.includes(slug)) && assertion.required.every((slug) => actual.includes(slug));
    } else return { ...assertion, pass: false, reason: 'unsupported assertion kind' };
    return { ...assertion, actual, pass };
  });
  return { passed: checks.every((check) => check.pass), criticalFailures: checks.filter((check) => check.critical && !check.pass).length, checks,
    humanReviewRequired: testCase.humanReview, disclosure: 'Numeric and structured decision checks only; human review of evidence, narrative, actionable output and tool behavior remains required.' };
}
export function gradeRun(testCase, record) {
  const grade = gradeAnswer(testCase, record.answer);
  const failures = [];
  if (record.exitCode !== 0) failures.push('native process did not exit successfully');
  if (record.timedOut) failures.push('native process timed out');
  if (record.spawnError) failures.push('native process failed to spawn');
  if (record.parseError) failures.push('native structured result parsing failed');
  if (record.nativeMetadata?.is_error) failures.push('Claude native result is an error');
  for (const reason of failures) grade.checks.push({ pass: false, critical: true, reason });
  grade.criticalFailures += failures.length;
  grade.passed = grade.passed && failures.length === 0;
  return grade;
}
async function main() {
  const directory = process.argv[2];
  if (!directory) throw new Error('Usage: npm run evaluate:grade -- RAW_RESULTS_DIRECTORY');
  const entries = [];
  for (const name of (await readdir(directory)).filter((name) => name.endsWith('.json') && name !== 'grades.json').sort()) {
    const record = JSON.parse(await readFile(path.join(directory, name), 'utf8'));
    if (!record.caseId || !record.runtime) continue;
    const folder = record.suite === 'routing' ? 'routing' : 'cases';
    const testCase = JSON.parse(await readFile(path.join(DEFAULT_ROOT, 'evaluations', folder, record.caseId + '.json'), 'utf8'));
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
        grade.passed = false; grade.criticalFailures += 1;
        grade.checks.push({ pass: false, critical: true, reason: 'recorded instruction/resource hashes differ from final source; rerun required' });
      }
    }
    const taskInputHash = recordedTaskHash(record, testCase);
    const currentTaskHash = testCase.suite === 'routing' ? sha({ request: testCase.request }) : sha({ request: testCase.request, inputCsv: testCase.inputCsv, contextMarkdown: testCase.contextMarkdown, metricNames: testCase.metricNames, decisionNames: testCase.decisionNames });
    if (taskInputHash !== currentTaskHash) { grade.passed = false; grade.criticalFailures += 1; grade.checks.push({ pass: false, critical: true, reason: 'recorded task inputs/request/schema differ from current fixture' }); }
    entries.push({ caseId: record.caseId, suite: record.suite || 'behavioral', runtime: record.runtime, mode: record.mode, instructionHash: record.instructionHash, fixtureHash: record.fixtureHash, taskInputHash, currentRubricHash: sha(testCase.assertions), rubricUpdatedSinceRun: record.fixtureHash !== sha(testCase),
      model: record.model, exitCode: record.exitCode, parseError: record.parseError, ...grade, rawRecord: name });
  }
  const pairs = [];
  for (const skilled of entries.filter((entry) => entry.mode === 'skilled' && entry.suite === 'behavioral')) {
    const baseline = entries.find((entry) => entry.caseId === skilled.caseId && entry.runtime === skilled.runtime && entry.mode === 'baseline' && entry.taskInputHash === skilled.taskInputHash);
    if (baseline) pairs.push({ caseId: skilled.caseId, runtime: skilled.runtime, baselinePassed: baseline.passed, skilledPassed: skilled.passed,
      baselineCriticalFailures: baseline.criticalFailures, skilledCriticalFailures: skilled.criticalFailures, modelMatch: baseline.model !== null && baseline.model === skilled.model });
  }
  const report = { generatedAt: new Date().toISOString(), entries, pairs, disclosure: 'One or more synthetic cases per skill; no real-account performance or causal business uplift established. Machine grades require independent human review before publication.' };
  await writeFile(path.join(directory, 'grades.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('Graded ' + entries.length + ' actual run records; ' + pairs.length + ' paired baseline comparisons; ' + entries.filter((entry) => !entry.passed).length + ' need correction/review.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.join(DEFAULT_ROOT, 'scripts/grade_evaluations.mjs')) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
