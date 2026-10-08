import { randomUUID } from "node:crypto";
import { judgeSubmission } from "../judge/judge.ts";
import type { JudgeResult } from "../judge/judge.ts";

export type Language = "python3";

export type NewSubmission =
  | { mode: "run"; language: Language; code: string; stdin: string }
  | { mode: "submit"; language: Language; code: string; cpid: number };

type Status = "queued" | "running" | "done" | "error";

export type SubmissionView = {
  id: string;
  mode: NewSubmission["mode"];
  status: Status;
  result: JudgeResult | null;
};

type Stored = {
  submission: NewSubmission;
  status: Status;
  result: JudgeResult | null;
};

const submissions = new Map<string, Stored>();

// Jobs are chained so only one runs at a time.
let tail: Promise<void> = Promise.resolve();

// Async so a real queue can replace the Map.
export async function create(submission: NewSubmission): Promise<string> {
  const id = randomUUID();
  const stored: Stored = { submission, status: "queued", result: null };
  submissions.set(id, stored);
  tail = tail.then(() => execute(id, stored));
  return id;
}

export async function get(id: string): Promise<SubmissionView | undefined> {
  const stored = submissions.get(id);
  if (!stored) return undefined;
  return { id, mode: stored.submission.mode, status: stored.status, result: stored.result };
}

async function execute(id: string, stored: Stored) {
  stored.status = "running";
  try {
    stored.result = await judgeSubmission(stored.submission, () => {});
    stored.status = "done";
  } catch (err) {
    console.error(`submission ${id} failed:`, err);
    stored.status = "error";
  }
}
