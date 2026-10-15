import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ESLINT_COMMAND = 'eslint . --format json';

const RESULT_KEYS = [
  'schemaVersion',
  'repository',
  'headSha',
  'tool',
  'command',
  'status',
  'errorCount',
  'warningCount',
  'generatedAt',
];
const TOOL_KEYS = ['name', 'version'];
const GENERATED_AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const HEAD_SHA_PATTERN = /^[0-9a-f]{40}$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._+-]*$/;
const OUTPUT_NAME = 'eos-lint-result.json';

const require = createRequire(import.meta.url);

function isNonNegativeInteger(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function assertExactKeys(value, keys) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('lint evidence contains unexpected fields');
  }
  const actual = Object.keys(value);
  if (actual.length !== keys.length || keys.some((key) => !Object.hasOwn(value, key))) {
    throw new Error('lint evidence contains unexpected fields');
  }
}

export function assertRepository(repository) {
  if (typeof repository !== 'string' || !REPOSITORY_PATTERN.test(repository)) {
    throw new Error('repository must be owner/repository');
  }
  const [owner, name] = repository.split('/');
  if (owner.startsWith('.') || name.startsWith('.')) {
    throw new Error('repository must be owner/repository');
  }
}

export function assertHeadSha(headSha) {
  if (typeof headSha !== 'string' || !HEAD_SHA_PATTERN.test(headSha)) {
    throw new Error('headSha must be a lowercase 40-character SHA');
  }
}

export function assertEosLintResult(evidence) {
  assertExactKeys(evidence, RESULT_KEYS);
  if (evidence.schemaVersion !== 1) {
    throw new Error('schemaVersion must be 1');
  }
  assertRepository(evidence.repository);
  assertHeadSha(evidence.headSha);
  assertExactKeys(evidence.tool, TOOL_KEYS);
  if (evidence.tool.name !== 'eslint') {
    throw new Error('tool.name must be eslint');
  }
  if (typeof evidence.tool.version !== 'string' || !VERSION_PATTERN.test(evidence.tool.version)) {
    throw new Error('tool.version must be non-empty');
  }
  if (
    typeof evidence.command !== 'string' ||
    evidence.command.trim() === '' ||
    evidence.command !== evidence.command.trim() ||
    /[\\@]|:\/\//.test(evidence.command)
  ) {
    throw new Error('command must be a non-empty lint command');
  }
  if (!isNonNegativeInteger(evidence.errorCount) || !isNonNegativeInteger(evidence.warningCount)) {
    throw new Error('errorCount and warningCount must be non-negative integers');
  }
  const expectedStatus = evidence.errorCount === 0 ? 'PASS' : 'FAIL';
  if (evidence.status !== expectedStatus) {
    throw new Error('status must be derived from errorCount');
  }
  if (
    typeof evidence.generatedAt !== 'string' ||
    !GENERATED_AT_PATTERN.test(evidence.generatedAt) ||
    Number.isNaN(Date.parse(evidence.generatedAt))
  ) {
    throw new Error('generatedAt must be UTC ISO-8601 with milliseconds');
  }
}

export function summarizeEslintResults(results) {
  if (!Array.isArray(results)) {
    throw new Error('ESLint JSON must be an array');
  }
  let errorCount = 0;
  let warningCount = 0;
  for (const result of results) {
    if (result === null || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('ESLint result counts must be non-negative integers');
    }
    if (!isNonNegativeInteger(result.errorCount) || !isNonNegativeInteger(result.warningCount)) {
      throw new Error('ESLint result counts must be non-negative integers');
    }
    errorCount += result.errorCount;
    warningCount += result.warningCount;
  }
  return { errorCount, warningCount };
}

export function parseEslintStdout(stdout) {
  if (typeof stdout !== 'string' || stdout.trim() === '') {
    throw new Error('ESLint did not return JSON');
  }
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error('ESLint did not return JSON');
  }
  return summarizeEslintResults(parsed);
}

export function buildEosLintResult({
  repository,
  headSha,
  command,
  toolVersion,
  errorCount,
  warningCount,
  generatedAt,
}) {
  const evidence = {
    schemaVersion: 1,
    repository,
    headSha: typeof headSha === 'string' ? headSha.toLowerCase() : headSha,
    tool: {
      name: 'eslint',
      version: toolVersion,
    },
    command,
    status: errorCount === 0 ? 'PASS' : 'FAIL',
    errorCount,
    warningCount,
    generatedAt,
  };
  assertEosLintResult(evidence);
  return evidence;
}

export function readEslintVersion() {
  const eslintPackage = require(require.resolve('eslint/package.json'));
  if (typeof eslintPackage.version !== 'string' || !VERSION_PATTERN.test(eslintPackage.version)) {
    throw new Error('tool.version must be non-empty');
  }
  return eslintPackage.version;
}

function eslintBinPath() {
  const packageJsonPath = require.resolve('eslint/package.json');
  const eslintPackage = require(packageJsonPath);
  const bin = eslintPackage.bin && eslintPackage.bin.eslint;
  if (typeof bin !== 'string' || bin.length === 0) {
    throw new Error('ESLint could not be started');
  }
  return path.join(path.dirname(packageJsonPath), bin);
}

export function runEslint() {
  const result = spawnSync(process.execPath, [eslintBinPath(), '.', '--format', 'json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error || typeof result.stdout !== 'string') {
    throw new Error('ESLint could not be started');
  }
  return parseEslintStdout(result.stdout);
}

export function writeEosLintResult(evidence, outputPath) {
  assertEosLintResult(evidence);
  writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, { encoding: 'utf8' });
}

export function main() {
  const headSha = typeof process.env.EOS_HEAD_SHA === 'string' ? process.env.EOS_HEAD_SHA.toLowerCase() : '';
  assertRepository(process.env.EOS_REPOSITORY);
  assertHeadSha(headSha);

  const counts = runEslint();
  const evidence = buildEosLintResult({
    repository: process.env.EOS_REPOSITORY,
    headSha,
    command: ESLINT_COMMAND,
    toolVersion: readEslintVersion(),
    errorCount: counts.errorCount,
    warningCount: counts.warningCount,
    generatedAt: new Date().toISOString(),
  });
  writeEosLintResult(evidence, path.join(process.cwd(), OUTPUT_NAME));
  console.log(
    `status=${evidence.status} errorCount=${evidence.errorCount} warningCount=${evidence.warningCount}`,
  );
  if (evidence.status === 'FAIL') {
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'lint evidence failed';
    console.error(message);
    process.exitCode = 1;
  }
}
