import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "./firebase.ts";
import type { Language } from "../judge/languages.ts";

const LEADERBOARD_SIZE = 100;

export type SubmissionRecord = {
  uid: string;
  cpid: number;
  language: Language;
  code: string;
  verdict: string;
  passed: number;
  total: number;
};

export type SaveSubmission = (record: SubmissionRecord) => Promise<void>;

export type LastSubmission = { language: Language; code: string };

export type GetLastSubmission = (uid: string, cpid: number) => Promise<LastSubmission | undefined>;

export type LeaderboardEntry = { name: string; points: number };

export type GetLeaderboard = () => Promise<LeaderboardEntry[]>;

// Every submit is kept; points only count the best one per problem.
export const saveSubmission: SaveSubmission = async ({ uid, ...record }) => {
  const db = firestore();
  const user = db.collection("users").doc(uid);
  const submission = user.collection("submissions").doc();
  const score = user.collection("scores").doc(String(record.cpid));

  await db.runTransaction(async (tx) => {
    const best = Number((await tx.get(score)).data()?.passed ?? 0);

    const better = record.passed > best;

    tx.create(submission, { ...record, createdAt: FieldValue.serverTimestamp() });
    tx.set(
      score,
      {
        cpid: record.cpid,
        lastSubmissionId: submission.id,
        ...(better && {
          passed: record.passed,
          total: record.total,
          submissionId: submission.id,
          updatedAt: FieldValue.serverTimestamp(),
        }),
      },
      { merge: true },
    );
    if (better) {
      tx.set(user, { points: FieldValue.increment(record.passed - best) }, { merge: true });
    }
  });
};

export const getLastSubmission: GetLastSubmission = async (uid, cpid) => {
  const user = firestore().collection("users").doc(uid);
  const score = await user.collection("scores").doc(String(cpid)).get();
  const id = score.data()?.lastSubmissionId;
  if (typeof id !== "string") return undefined;

  const data = (await user.collection("submissions").doc(id).get()).data();
  if (!data) return undefined;
  return { language: data.language, code: data.code };
};

export const getLeaderboard: GetLeaderboard = async () => {
  const snapshot = await firestore()
    .collection("users")
    .where("points", ">", 0)
    .orderBy("points", "desc")
    .limit(LEADERBOARD_SIZE)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return { name: String(data.name || "Anonymous"), points: Number(data.points) };
  });
};
