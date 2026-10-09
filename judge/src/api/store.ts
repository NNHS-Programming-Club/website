import { randomUUID } from "node:crypto";
import { judgeSubmission } from "../judge/judge.ts";
import type { JudgeResult, SubmitProgress } from "../judge/judge.ts";

export type Language = "python3";

export type NewSubmission =
  | { mode: "run"; language: Language; code: string; stdin: string }
  | { mode: "submit"; language: Language; code: string; cpid: number; testCasesUrl: string };

type Status = "queued" | "running" | "done" | "error";

export type SubmissionView = {
  id: string;
  mode: NewSubmission["mode"];
  status: Status;
  // While a submit is running this is the progress so far.
  result: JudgeResult | SubmitProgress | null;
};

type Stored = {
  uid: string;
  submission: NewSubmission;
  status: Status;
  result: SubmissionView["result"];
};

const submissions = new Map<string, Stored>();

// Jobs are chained so only one runs at a time.
let tail: Promise<void> = Promise.resolve();

// Async so a real queue can replace the Map.
export async function create(uid: string, submission: NewSubmission): Promise<string> {
  const id = randomUUID();
  const stored: Stored = { uid, submission, status: "queued", result: null };
  submissions.set(id, stored);
  tail = tail.then(() => execute(id, stored));
  return id;
}

export async function get(id: string, uid: string): Promise<SubmissionView | undefined> {
  const stored = submissions.get(id);
  if (!stored || stored.uid !== uid) return undefined;
  return { id, mode: stored.submission.mode, status: stored.status, result: stored.result };
}

async function execute(id: string, stored: Stored) {
  stored.status = "running";
  try {
    stored.result = await judgeSubmission(stored.submission, (progress) => {
      stored.result = progress;
    });
    stored.status = "done";
  } catch (err) {
    console.error(`submission ${id} failed:`, err);
    stored.status = "error";
  }
}
