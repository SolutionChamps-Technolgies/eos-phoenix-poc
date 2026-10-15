import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  ESLINT_COMMAND,
  assertEosLintResult,
  buildEosLintResult,
  parseEslintStdout,
  readEslintVersion,
  summarizeEslintResults,
  writeEosLintResult,
} from './eos-lint-evidence.mjs';

const HEAD_SHA = '0123456789abcdef0123456789abcdef01234567';
const GENERATED_AT = '2026-10-15T11:42:07.123Z';

function evidenceInput(overrides = {}) {
  return {
    repository: 'example-owner/eos-phoenix-poc',
    headSha: HEAD_SHA,
    command: ESLINT_COMMAND,
    toolVersion: '10.11.0',
    errorCount: 0,
    warningCount: 0,
    generatedAt: GENERATED_AT,
    ...overrides,
  };
}

test('PASS comes from zero ESLint errors, including when warnings exist', () => {
  const evidence = buildEosLintResult(evidenceInput({ errorCount: 0, warningCount: 4 }));

  assert.equal(evidence.status, 'PASS');
  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.tool.name, 'eslint');
  assert.deepEqual(Object.keys(evidence), [
    'schemaVersion',
    'repository',
    'headSha',
    'tool',
    'command',
    'status',
    'errorCount',
    'warningCount',
    'generatedAt',
  ]);
  assert.deepEqual(Object.keys(evidence.tool), ['name', 'version']);
});

test('FAIL comes from a positive ESLint error count', () => {
  const evidence = buildEosLintResult(evidenceInput({ errorCount: 2, warningCount: 1 }));

  assert.equal(evidence.status, 'FAIL');
  assert.equal(evidence.errorCount, 2);
  assert.equal(evidence.warningCount, 1);
});

test('headSha is stored as lowercase 40 hexadecimal characters', () => {
  const evidence = buildEosLintResult(evidenceInput({ headSha: HEAD_SHA.toUpperCase() }));

  assert.equal(evidence.headSha, HEAD_SHA);
  assert.match(evidence.headSha, /^[0-9a-f]{40}$/);
});

test('evidence omits lint messages, paths, and fields outside the schema', () => {
  const counts = summarizeEslintResults([
    {
      filePath: 'C:\\secret\\employee.ts',
      messages: [{ message: 'user@example.com leaked' }],
      errorCount: 1,
      warningCount: 2,
    },
    {
      filePath: '/tmp/other.ts',
      messages: [],
      errorCount: 0,
      warningCount: 1,
    },
  ]);
  const evidence = buildEosLintResult(evidenceInput(counts));
  const serialized = JSON.stringify(evidence);

  assert.deepEqual(counts, { errorCount: 1, warningCount: 3 });
  assert.equal(serialized.includes('secret'), false);
  assert.equal(serialized.includes('employee.ts'), false);
  assert.equal(serialized.includes('user@example.com'), false);
  assert.equal(serialized.includes('leaked'), false);
  assert.equal(Object.hasOwn(evidence, 'messages'), false);
  assert.equal(Object.hasOwn(evidence, 'filePath'), false);
});

test('rejects a SHA, timestamp, repository, or status that does not match the schema', () => {
  assert.throws(() => buildEosLintResult(evidenceInput({ headSha: 'abc' })), /headSha/);
  assert.throws(
    () => buildEosLintResult(evidenceInput({ generatedAt: '2026-10-15T11:42:07Z' })),
    /generatedAt/,
  );
  assert.throws(
    () => buildEosLintResult(evidenceInput({ repository: 'person@example.com' })),
    /repository/,
  );
  assert.throws(() => buildEosLintResult(evidenceInput({ command: '' })), /command/);
  assert.throws(() => buildEosLintResult(evidenceInput({ toolVersion: '' })), /tool.version/);

  const mismatched = {
    schemaVersion: 1,
    repository: 'example-owner/eos-phoenix-poc',
    headSha: HEAD_SHA,
    tool: { name: 'eslint', version: '10.11.0' },
    command: ESLINT_COMMAND,
    status: 'FAIL',
    errorCount: 0,
    warningCount: 0,
    generatedAt: GENERATED_AT,
  };
  assert.throws(() => assertEosLintResult(mismatched), /errorCount/);
});

test('ESLint stdout contributes only non-negative counts', () => {
  const counts = parseEslintStdout(
    JSON.stringify([
      { errorCount: 0, warningCount: 1, filePath: 'ignored.ts', messages: [{ message: 'x' }] },
      { errorCount: 2, warningCount: 0 },
    ]),
  );

  assert.deepEqual(counts, { errorCount: 2, warningCount: 1 });
  assert.throws(() => parseEslintStdout(''), /JSON/);
  assert.throws(() => summarizeEslintResults([{ errorCount: -1, warningCount: 0 }]), /non-negative/);
});

test('writes the schema file without extra fields', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'eos-lint-'));
  const outputPath = path.join(directory, 'eos-lint-result.json');
  try {
    const evidence = buildEosLintResult(evidenceInput({ warningCount: 3 }));
    writeEosLintResult(evidence, outputPath);
    const parsed = JSON.parse(readFileSync(outputPath, 'utf8'));

    assertEosLintResult(parsed);
    assert.equal(parsed.status, 'PASS');
    assert.equal(parsed.warningCount, 3);
    assert.equal(parsed.command, ESLINT_COMMAND);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('installed ESLint version is non-empty', () => {
  assert.match(readEslintVersion(), /^[A-Za-z0-9][A-Za-z0-9._+-]*$/);
});
