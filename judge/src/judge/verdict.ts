import type { RunResult } from "./runner/types.ts";

export type Verdict = "OK" | "TLE" | "MLE" | "RE";

export function verdictOf(result: RunResult): Verdict {
  if (result.status === "timeout") return "TLE";
  if (result.status === "memory_limit") return "MLE";
  if (result.status !== "exited" || result.exitCode !== 0) return "RE";
  return "OK";
}
