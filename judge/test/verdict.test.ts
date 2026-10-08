import test from "node:test";
import assert from "node:assert/strict";
import { verdictOf } from "../src/judge/verdict.ts";
import type { RunResult } from "../src/judge/runner/types.ts";

const exited: RunResult = {
  status: "exited",
  exitCode: 0,
  signal: null,
  timeMs: 10,
  memoryKb: 0,
  stdout: "",
  stderr: "",
};

const cases: [string, Partial<RunResult>, string][] = [
  ["a clean exit", {}, "OK"],
  ["a non-zero exit code", { exitCode: 1 }, "RE"],
  ["a signal", { status: "signaled", exitCode: null, signal: "SIGSEGV" }, "RE"],
  ["a timeout", { status: "timeout", exitCode: null, signal: "SIGKILL" }, "TLE"],
  ["too much output", { status: "output_limit", exitCode: null, signal: "SIGKILL" }, "RE"],
];

for (const [name, overrides, expected] of cases) {
  test(`verdictOf maps ${name} to ${expected}`, () => {
    assert.equal(verdictOf({ ...exited, ...overrides }), expected);
  });
}
