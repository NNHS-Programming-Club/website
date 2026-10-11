import { readFile } from "node:fs/promises";
import { config } from "../config.ts";
import type { NewSubmission } from "../api/store.ts";
import { outputsMatch } from "./compare.ts";
import { languages } from "./languages.ts";
import { runIsolated } from "./runner/isolate.ts";
import type { Runner } from "./runner/types.ts";
import { getTestCases } from "./testCases.ts";
import { verdictOf } from "./verdict.ts";
import type { Verdict } from "./verdict.ts";

const MAX_RESULT_OUTPUT_BYTES = 64 * 1024;
const MAX_FAILURE_STDERR_BYTES = 4 * 1024;

export type RunModeResult = {
  verdict: Verdict;
  stdout: string;
  stderr: string;
  timeMs: number;
  memoryKb: number;
  truncated: boolean;
};

export type CaseVerdict = Exclude<Verdict, "OK"> | "AC" | "WA";

export type CaseResult = {
  testId: number;
  verdict: CaseVerdict;
  timeMs: number;
  memoryKb: number;
};

export type SubmitProgress = { total: number; cases: CaseResult[] };

export type SubmitModeResult = SubmitProgress & {
  verdict: CaseVerdict;
  passed: number;
  firstFailure: { testId: number; stderr: string } | null;
};

export type CompileErrorResult = { verdict: "CE"; compileOutput: string };

export type JudgeResult = RunModeResult | SubmitModeResult | CompileErrorResult;

export async function judgeSubmission(
  submission: NewSubmission,
  onProgress: (progress: SubmitProgress) => void,
  runner: Runner = runIsolated,
): Promise<JudgeResult> {
  const prepared = await prepare(submission, runner);
  if (!prepared.files) {
    return { verdict: "CE", compileOutput: prepared.compileOutput };
  }

  if (submission.mode === "submit") {
    return judgeSubmit(submission, prepared.files, onProgress, runner);
  }

  const result = await runner({
    files: prepared.files,
    argv: languages[submission.language].run,
    stdin: submission.stdin,
    limits: config.limits,
  });
  const stdout = truncate(result.stdout, MAX_RESULT_OUTPUT_BYTES);
  const stderr = truncate(result.stderr, MAX_RESULT_OUTPUT_BYTES);

  return {
    verdict: verdictOf(result),
    stdout: stdout.text,
    stderr: stderr.text,
    timeMs: result.timeMs,
    memoryKb: result.memoryKb,
    truncated: stdout.cut || stderr.cut || result.status === "output_limit",
  };
}

type Files = Record<string, string | Buffer>;

async function prepare(
  submission: NewSubmission,
  runner: Runner,
): Promise<{ files: Files } | { files?: undefined; compileOutput: string }> {
  const { source, compile } = languages[submission.language];
  const files: Files = { [source]: submission.code };
  if (!compile) return { files };

  const result = await runner({
    files,
    argv: compile.argv,
    stdin: "",
    limits: config.compileLimits,
    collect: compile.output,
  });
  if (verdictOf(result) !== "OK" || !result.collected) {
    return { compileOutput: truncate(result.stderr, MAX_RESULT_OUTPUT_BYTES).text };
  }
  return { files: { [compile.output]: result.collected } };
}

async function judgeSubmit(
  submission: Extract<NewSubmission, { mode: "submit" }>,
  files: Files,
  onProgress: (progress: SubmitProgress) => void,
  runner: Runner,
): Promise<SubmitModeResult> {
  const testCases = await getTestCases(submission.cpid, submission.testCasesUrl);
  const total = testCases.length;
  const cases: CaseResult[] = [];
  let firstFailure: SubmitModeResult["firstFailure"] = null;

  // A failed case does not stop the rest from running.
  for (const testCase of testCases) {
    const result = await runner({
      files,
      argv: languages[submission.language].run,
      stdin: await readFile(testCase.inPath, "utf8"),
      limits: config.limits,
    });

    let verdict: CaseVerdict;
    const ran = verdictOf(result);
    if (ran === "OK") {
      const expected = await readFile(testCase.outPath, "utf8");
      verdict = outputsMatch(result.stdout, expected) ? "AC" : "WA";
    } else {
      verdict = ran;
    }

    if (verdict !== "AC" && !firstFailure) {
      firstFailure = {
        testId: testCase.testId,
        stderr: truncate(result.stderr, MAX_FAILURE_STDERR_BYTES).text,
      };
    }
    cases.push({
      testId: testCase.testId,
      verdict,
      timeMs: result.timeMs,
      memoryKb: result.memoryKb,
    });
    onProgress({ total, cases: [...cases] });
  }

  const failed = cases.find((c) => c.verdict !== "AC");
  return {
    verdict: failed ? failed.verdict : "AC",
    total,
    passed: cases.filter((c) => c.verdict === "AC").length,
    cases,
    firstFailure,
  };
}

function truncate(text: string, maxBytes: number) {
  const bytes = Buffer.from(text);
  if (bytes.length <= maxBytes) return { text, cut: false };
  return { text: bytes.subarray(0, maxBytes).toString(), cut: true };
}
