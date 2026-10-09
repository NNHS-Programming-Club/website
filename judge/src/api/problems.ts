import { firestore } from "./firebase.ts";

const CACHE_TTL_MS = 10 * 60 * 1000;
const FILE_IO = /INPUT FORMAT \(file (\w+)\.in\):/i;

export type Problem = { cpid: number; testCasesUrl: string; isFileIo: boolean };

export type GetProblem = (cpid: number) => Promise<Problem | undefined>;

// Unknown problems are cached too.
const cache = new Map<number, { problem: Problem | undefined; expires: number }>();

export const getProblem: GetProblem = async (cpid) => {
  const cached = cache.get(cpid);
  if (cached && cached.expires > Date.now()) return cached.problem;

  const snapshot = await firestore()
    .collection("problems")
    .where("cpid", "==", cpid)
    .limit(1)
    .get();

  let problem: Problem | undefined;
  const data = snapshot.docs[0]?.data();
  if (data) {
    if (!isUsacoUrl(data.testCasesUrl)) {
      throw new Error(`problem ${cpid} has a test case URL that is not on usaco.org`);
    }
    problem = {
      cpid,
      testCasesUrl: data.testCasesUrl,
      isFileIo: FILE_IO.test(String(data.description)),
    };
  }

  cache.set(cpid, { problem, expires: Date.now() + CACHE_TTL_MS });
  return problem;
};

function isUsacoUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /^(www\.)?usaco\.org$/.test(url.hostname);
  } catch {
    return false;
  }
}
