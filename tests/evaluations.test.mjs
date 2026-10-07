import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { DEFAULT_ROOT, parseCsv } from '../scripts/catalog.mjs';
import { buildPrompt, responseSchema, parseClaudeStream } from '../scripts/evaluate.mjs';
import { gradeAnswer, gradeRun, recordedTaskHash } from '../scripts/grade_evaluations.mjs';

async function loadCases() {
  const folder = path.join(DEFAULT_ROOT, 'evaluations/cases');
  return Promise.all((await readdir(folder)).filter((name) => name.endsWith('.json')).map(async (name) => JSON.parse(await readFile(path.join(folder, name), 'utf8'))));
}
test('every manifest skill has a distinct complete fictional behavioral case with observable assertions', async () => {
  const manifest = JSON.parse(await readFile(path.join(DEFAULT_ROOT, 'skills/manifest.json'), 'utf8'));
  const cases = await loadCases();
  assert.deepEqual([...new Set(cases.map((item) => item.skill))].sort(), manifest.skills.map((item) => item.slug).sort());
  for (const item of cases) {
    const rows = parseCsv(item.inputCsv);
    assert.ok(rows.length > 1, item.id);
    assert.ok(rows.every((row) => row.length === rows[0].length), item.id);
    assert.ok(item.contextMarkdown.includes('Fictional'), item.id);
    assert.ok(item.assertions.some((assertion) => assertion.critical), item.id);
    assert.ok(item.humanReview.length, item.id);
    const entry = manifest.skills.find((skill) => skill.slug === item.skill);
    assert.notEqual(item.inputCsv, entry.example.inputCsv, item.id + ' must not replay a package worked example');
  }
});
test('baseline and skill prompts share task inputs but never include grading answers', async () => {
  const cases = await loadCases();
  for (const item of cases) {
    const baseline = buildPrompt(item, 'baseline');
    const skilled = buildPrompt(item, 'skilled');
    assert.ok(baseline.includes(item.request));
    assert.ok(skilled.includes(item.request));
    assert.ok(!baseline.includes('Use the installed skill $'));
    assert.ok(skilled.includes('Use the installed skill $' + item.skill));
    assert.ok(!skilled.includes('expected":'));
    assert.deepEqual(responseSchema(item).properties.metrics.required, item.metricNames);
  }
});
test('grader distinguishes arithmetic failure, wrong decisions and missing results', () => {
  const fixture = { metricNames: ['cpa'], decisionNames: ['winner'], humanReview: ['check evidence'], assertions: [
    { kind: 'number', key: 'cpa', expected: 30, tolerance: .005, critical: true },
    { kind: 'decision', key: 'winner', expected: 'inconclusive', critical: true }
  ] };
  assert.equal(gradeAnswer(fixture, { metrics: { cpa: 30 }, decisions: { winner: 'inconclusive' } }).passed, true);
  assert.equal(gradeAnswer(fixture, { metrics: { cpa: 50 }, decisions: { winner: 'recommend' } }).criticalFailures, 2);
  assert.equal(gradeAnswer(fixture, null).passed, false);
  assert.equal(gradeAnswer({ ...fixture, assertions: [{ kind: 'number', key: 'cpa', expected: null, tolerance: 0, critical: true }] }, { metrics: { cpa: 0 } }).passed, false);
});
test('routing selection rejects unrelated activation and overlapping wrong workflow', () => {
  const fixture = { humanReview: ['verify actual reads'], assertions: [{ kind: 'selection', expected: ['orphex-weekly-performance-summarizer'], required: ['orphex-weekly-performance-summarizer'], critical: true }] };
  assert.equal(gradeAnswer(fixture, { selectedSkills: ['orphex-weekly-performance-summarizer'] }).passed, true);
  assert.equal(gradeAnswer(fixture, { selectedSkills: ['orphex-weekly-performance-review'] }).passed, false);
  assert.equal(gradeAnswer(fixture, { selectedSkills: [] }).passed, false);
  const unrelated = { ...fixture, assertions: [{ kind: 'selection', expected: [], required: [], critical: true }] };
  assert.equal(gradeAnswer(unrelated, { selectedSkills: [] }).passed, true);
  assert.equal(gradeAnswer(unrelated, { selectedSkills: ['orphex-creative-signal-review'] }).passed, false);
});

test('failed native processes cannot pass behavior grading even with a fixture-shaped answer', () => {
  const fixture = { assertions: [{ kind: 'number', key: 'cpa', expected: 30, tolerance: .005, critical: true }], humanReview: [] };
  const record = { answer: { metrics: { cpa: 30 } }, exitCode: 1, timedOut: true, spawnError: 'failed', parseError: 'invalid', nativeMetadata: { is_error: true } };
  const grade = gradeRun(fixture, record);
  assert.equal(grade.passed, false);
  assert.equal(grade.criticalFailures, 5);
  assert.equal(gradeRun(fixture, { ...record, exitCode: null }).passed, false);
});
test('raw task reconstruction preserves exact input identity when rubric expectations change', async () => {
  const fixture = (await loadCases())[0];
  const prompt = buildPrompt(fixture, 'baseline');
  const record = { prompt, inputCsv: fixture.inputCsv, contextMarkdown: fixture.contextMarkdown };
  const original = recordedTaskHash(record, fixture);
  assert.equal(original, recordedTaskHash(record, { ...fixture, assertions: [] }));
  assert.notEqual(original, recordedTaskHash({ ...record, inputCsv: record.inputCsv + '\n' }, fixture));
});

test('Claude native streaming parser retains real tool calls/results and final model metadata', () => {
  const events = [
    { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'read1', name: 'Read', input: { file_path: '/tmp/case-input.csv' } }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'read1', content: 'spend,conversions\n300,10\n' }] } },
    { type: 'result', is_error: false, modelUsage: { 'runtime-reported-model': {} }, structured_output: { metrics: { cpa: 30 } } }
  ];
  const parsed = parseClaudeStream(events.map(event => JSON.stringify(event)).join('\n'));
  assert.equal(parsed.toolUses[0].name, 'Read');
  assert.equal(parsed.toolResults[0].tool_use_id, 'read1');
  assert.equal(parsed.model, 'runtime-reported-model');
  assert.equal(parsed.answer.metrics.cpa, 30);
  assert.throws(() => parseClaudeStream(JSON.stringify(events[0])), /no final result/);
  assert.throws(() => parseClaudeStream('invalid'), /invalid native Claude JSON/);
});
