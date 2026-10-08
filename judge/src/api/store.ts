import { randomUUID } from "node:crypto";

export type Language = "python3";

export type NewSubmission =
  | { mode: "run"; language: Language; code: string; stdin: string }
  | { mode: "submit"; language: Language; code: string; cpid: number };

export type SubmissionView = {
  id: string;
  mode: NewSubmission["mode"];
  status: "queued" | "running" | "done" | "error";
};

const submissions = new Map<string, NewSubmission>();

// Async so a real queue can replace the Map.
export async function create(submission: NewSubmission): Promise<string> {
  const id = randomUUID();
  submissions.set(id, submission);
  return id;
}

export async function get(id: string): Promise<SubmissionView | undefined> {
  const submission = submissions.get(id);
  if (!submission) return undefined;
  return { id, mode: submission.mode, status: "queued" };
}
