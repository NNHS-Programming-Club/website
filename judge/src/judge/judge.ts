import { config } from "../config.ts";
import type { NewSubmission } from "../api/store.ts";
import { runProgram } from "./runner/process.ts";
import type { Runner } from "./runner/types.ts";
import { verdictOf } from "./verdict.ts";
import type { Verdict } from "./verdict.ts";

const MAX_RESULT_OUTPUT_BYTES = 64 * 1024;

export type RunModeResult = {
  verdict: Verdict;
  stdout: string;
  stderr: string;
  timeMs: number;
  memoryKb: number;
  truncated: boolean;
};

export type JudgeResult = RunModeResult;

export async function judgeSubmission(
  submission: NewSubmission,
  onProgress: (progress: unknown) => void,
  runner: Runner = runProgram,
): Promise<JudgeResult> {
  if (submission.mode !== "run") {
    throw new Error("submit mode is not implemented");
  }

  const result = await runner({
    files: { "solution.py": submission.code },
    argv: [config.pythonBin, "solution.py"],
    stdin: submission.stdin,
    limits: config.limits,
  });
  const stdout = truncate(result.stdout);
  const stderr = truncate(result.stderr);

  return {
    verdict: verdictOf(result),
    stdout: stdout.text,
    stderr: stderr.text,
    timeMs: result.timeMs,
    memoryKb: result.memoryKb,
    truncated: stdout.cut || stderr.cut || result.status === "output_limit",
  };
}

function truncate(text: string) {
  const bytes = Buffer.from(text);
  if (bytes.length <= MAX_RESULT_OUTPUT_BYTES) return { text, cut: false };
  return { text: bytes.subarray(0, MAX_RESULT_OUTPUT_BYTES).toString(), cut: true };
}
