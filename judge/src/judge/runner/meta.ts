import { constants } from "node:os";
import type { RunResult, RunStatus } from "./types.ts";

export type Meta = Record<string, string>;

export function parseMeta(text: string): Meta {
  const meta: Meta = {};
  for (const line of text.split("\n")) {
    const colon = line.indexOf(":");
    if (colon > 0) meta[line.slice(0, colon)] = line.slice(colon + 1);
  }
  return meta;
}

export function toRunResult(
  meta: Meta,
  stdout: string,
  stderr: string,
  outputLimited: boolean,
): RunResult {
  if (meta.status === "XX") {
    throw new Error(`isolate failed: ${meta.message ?? "unknown error"}`);
  }

  let status: RunStatus;
  // Checked first: an OOM kill is also reported as a signal.
  if (meta["cg-oom-killed"]) status = "memory_limit";
  else if (meta.status === "TO") status = "timeout";
  else if (outputLimited) status = "output_limit";
  else if (meta.status === "SG") status = "signaled";
  else status = "exited";

  const exited = meta.exitsig === undefined && meta.status !== "TO";
  return {
    status,
    // isolate leaves exitcode out for a clean exit.
    exitCode: exited ? Number(meta.exitcode ?? 0) : null,
    signal: meta.exitsig === undefined ? null : signalName(Number(meta.exitsig)),
    timeMs: Math.round(Number(meta.time ?? 0) * 1000),
    memoryKb: Number(meta["cg-mem"] ?? meta["max-rss"] ?? 0),
    stdout,
    stderr,
  };
}

function signalName(number: number): string {
  const found = Object.entries(constants.signals).find(([, value]) => value === number);
  return found ? found[0] : `SIG${number}`;
}
