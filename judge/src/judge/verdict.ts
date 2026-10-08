import type { RunResult } from "./runner/types.ts";

export type Verdict = "OK" | "TLE" | "RE";

export function verdictOf(result: RunResult): Verdict {
  if (result.status === "timeout") return "TLE";
  if (result.status !== "exited" || result.exitCode !== 0) return "RE";
  return "OK";
}
