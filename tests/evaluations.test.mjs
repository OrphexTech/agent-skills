import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { DEFAULT_ROOT, parseCsv } from '../scripts/catalog.mjs';
import { buildPrompt, responseSchema, parseClaudeStream } from '../scripts/evaluate.mjs';
import { gradeAnswer, gradeRun, recordedTaskHash, checkClaudeToolBoundary } from '../scripts/grade_evaluations.mjs';

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
    { type: 'system', subtype: 'init', skills: ['orphex-eval:orphex-weekly-performance-review'] },
    { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'read1', name: 'Read', input: { file_path: '/tmp/case-input.csv' } }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'read1', content: 'spend,conversions\n300,10\n' }] } },
    { type: 'result', is_error: false, modelUsage: { 'runtime-reported-model': {} }, structured_output: { metrics: { cpa: 30 } } }
  ];
  const parsed = parseClaudeStream(events.map(event => JSON.stringify(event)).join('\n'));
  assert.equal(parsed.toolUses[0].name, 'Read');
  assert.equal(parsed.toolResults[0].tool_use_id, 'read1');
  assert.equal(parsed.model, 'runtime-reported-model');
  assert.equal(parsed.answer.metrics.cpa, 30);
  assert.deepEqual(parsed.init.skills, ['orphex-eval:orphex-weekly-performance-review']);
  assert.throws(() => parseClaudeStream(JSON.stringify(events[0])), /no final result/);
  assert.throws(() => parseClaudeStream('invalid'), /invalid native Claude JSON/);
});

test('session plugin identity changes activation name without changing the user task or source slug', () => {
  const fixture = { skill: 'orphex-example', request: 'Compare the supplied results.', metricNames: ['cpa'], decisionNames: ['cause'] };
  const prompt = buildPrompt(fixture, 'skilled', 'plugin/skills/orphex-example', [{ sourceSlug: 'orphex-example', nativeName: 'orphex-eval:orphex-example' }]);
  assert.ok(prompt.includes('native Skill tool using the exact name orphex-eval:orphex-example'));
  assert.ok(prompt.includes('plugin/skills/orphex-example/SKILL.md'));
  assert.equal(prompt.split('\n\n')[2], fixture.request);
  const routing = buildPrompt({ suite: 'routing', request: 'Translate this sentence.' }, 'skilled');
  assert.ok(routing.endsWith('User request: Translate this sentence.'));
  assert.ok(routing.includes('original source slugs'));
});

test('Claude tool scope rejects shell/writes and exact-directory escapes independently of answer', () => {
  const safe = { runtime: 'claude', mode: 'skilled', suite: 'behavioral', skill: 'orphex-weekly-performance-review', nativeTraceMode: 'stream-json-verbose', scratchDirectory: '/tmp/task-1', nativeInitSkills: ['orphex-weekly-performance-review'], resourceHashes: [{ path: 'orphex-weekly-performance-review/SKILL.md', sha256: 'fixture' }], observedToolCalls: [{ name: 'Read', input: { file_path: '/tmp/task-1/case-input.csv' } }, { id: 'skill1', name: 'Skill', input: { skill: 'orphex-weekly-performance-review' } }, { name: 'StructuredOutput', input: {} }], observedToolResults: [{ tool_use_id: 'skill1', is_error: false, content: 'Launching skill: orphex-weekly-performance-review' }] };
  assert.deepEqual(checkClaudeToolBoundary(safe), []);
  const hostile = { ...safe, observedToolCalls: [{ name: 'Bash', input: { command: 'echo data > /Users/admin/.claude/plans/file.md' } }, { name: 'Write', input: { file_path: '/tmp/task-1/output.md' } }, { name: 'Read', input: { file_path: '../outside.csv' } }, { name: 'Read', input: { file_path: '/tmp/task-10/private.csv' } }] };
  assert.equal(checkClaudeToolBoundary(hostile).length, 5);
  assert.equal(checkClaudeToolBoundary({ ...safe, mode: 'baseline' }).length, 1);
  assert.equal(checkClaudeToolBoundary({ ...safe, scratchDirectory: undefined }).length, 1);
  assert.equal(checkClaudeToolBoundary({ ...safe, nativeTraceMode: undefined }).length, 1);
  const fixture = { assertions: [{ kind: 'number', key: 'cpa', expected: 30, tolerance: .005, critical: true }], humanReview: [] };
  const record = { ...hostile, answer: { metrics: { cpa: 30 } }, exitCode: 0, timedOut: false, spawnError: null, parseError: null };
  assert.equal(gradeRun(fixture, record).passed, false);
  assert.equal(gradeRun(fixture, record).criticalFailures, 5);
  assert.equal(checkClaudeToolBoundary({ ...safe, suite: 'routing', observedToolCalls: [{ name: 'Read', input: { file_path: '~/.claude/settings.json' } }] }).length, 1);
  assert.equal(checkClaudeToolBoundary({ ...safe, suite: 'routing', observedToolCalls: [{ name: 'Read', input: { file_path: '/tmp/task-1/../task-1/case-input.csv' } }] }).length, 1);
  assert.equal(checkClaudeToolBoundary({ ...safe, suite: 'routing', observedToolCalls: [{ id: 'skill1', name: 'Skill', input: { skill: 'run-skill-generator' } }] }).length, 2);
  assert.equal(checkClaudeToolBoundary({ ...safe, observedToolResults: [{ tool_use_id: 'skill1', is_error: true, content: 'Unknown skill' }] }).length, 2);
  assert.equal(checkClaudeToolBoundary({ ...safe, observedToolResults: [] }).length, 2);
  const namespaced = { ...safe, installMode: 'ephemeral-session-plugin', nativeSkillNames: [{ sourceSlug: safe.skill, nativeName: 'orphex-eval:' + safe.skill }], nativeInitSkills: ['orphex-eval:' + safe.skill], observedToolCalls: [{ id: 'skill2', name: 'Skill', input: { skill: 'orphex-eval:' + safe.skill } }], observedToolResults: [{ tool_use_id: 'skill2', content: 'Launching skill: orphex-eval:' + safe.skill }] };
  assert.deepEqual(checkClaudeToolBoundary(namespaced), []);
  assert.equal(checkClaudeToolBoundary({ ...namespaced, nativeInitSkills: [] }).length, 1);
  assert.deepEqual(checkClaudeToolBoundary({ ...namespaced, suite: 'routing', observedToolCalls: [], observedToolResults: [] }), []);
});
