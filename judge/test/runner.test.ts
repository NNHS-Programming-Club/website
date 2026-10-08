import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { runProgram } from "../src/judge/runner/process.ts";
import type { RunLimits } from "../src/judge/runner/types.ts";

const limits: RunLimits = { cpuSeconds: 4, wallSeconds: 8, memoryKb: 131072, outputKb: 1024 };

// Node stands in for the judged program so the tests do not need Python.
function runNode(source: string, stdin = "", overrides: Partial<RunLimits> = {}) {
  return runProgram({
    files: { "main.js": source },
    argv: [process.execPath, "main.js"],
    stdin,
    limits: { ...limits, ...overrides },
  });
}

test("runProgram captures stdout and stderr of a normal exit", async () => {
  const result = await runNode('console.log("out"); console.error("err");');

  assert.equal(result.status, "exited");
  assert.equal(result.exitCode, 0);
  assert.equal(result.signal, null);
  assert.equal(result.stdout, "out\n");
  assert.equal(result.stderr, "err\n");
  assert.equal(result.memoryKb, 0);
  assert.ok(result.timeMs >= 0);
});

test("runProgram passes stdin to the program", async () => {
  const result = await runNode("process.stdin.pipe(process.stdout);", "hello\nworld\n");

  assert.equal(result.status, "exited");
  assert.equal(result.stdout, "hello\nworld\n");
});

test("runProgram tolerates a program that ignores a large stdin", async () => {
  const result = await runNode('console.log("done");', "a".repeat(1024 * 1024));

  assert.equal(result.status, "exited");
  assert.equal(result.stdout, "done\n");
});

test("runProgram reports a non-zero exit code", async () => {
  const result = await runNode('console.error("boom"); process.exit(3);');

  assert.equal(result.status, "exited");
  assert.equal(result.exitCode, 3);
  assert.equal(result.stderr, "boom\n");
});

test("runProgram kills a program that passes the wall time limit", async () => {
  const result = await runNode('console.log("started"); setInterval(() => {}, 1000);', "", {
    wallSeconds: 0.5,
  });

  assert.equal(result.status, "timeout");
  assert.equal(result.stdout, "started\n");
  assert.ok(result.timeMs >= 500 && result.timeMs < 5000, `timeMs was ${result.timeMs}`);
});

test("runProgram kills a program that passes the output limit", async () => {
  const result = await runNode(
    'process.stdout.write("a".repeat(100000)); setInterval(() => {}, 1000);',
    "",
    { outputKb: 1 },
  );

  assert.equal(result.status, "output_limit");
  assert.equal(result.stdout, "a".repeat(1024));
});

test("runProgram removes its working directory", async () => {
  const result = await runNode("process.stdout.write(process.cwd());");

  assert.notEqual(result.stdout, "");
  assert.equal(existsSync(result.stdout), false);
});

test("runProgram rejects when the program cannot be started", async () => {
  await assert.rejects(
    runProgram({ files: {}, argv: ["judge-no-such-program"], stdin: "", limits }),
  );
});
