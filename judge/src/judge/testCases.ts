import { randomUUID } from "node:crypto";
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import AdmZip from "adm-zip";
import { config } from "../config.ts";

const CASE_FILE = /^(\d+)\.(in|out)$/;
const DOWNLOAD_TIMEOUT_MS = 30_000;
const MAX_ZIP_BYTES = 200 * 1024 * 1024;

export type TestCase = { testId: number; inPath: string; outPath: string };

const downloads = new Map<number, Promise<void>>();

// Cached in <cacheDir>/<cpid>/ forever; the zip is only downloaded the first time.
export async function getTestCases(cpid: number, url: string): Promise<TestCase[]> {
  const dir = join(config.cacheDir, String(cpid));

  let cases = await readCases(dir);
  if (!cases) {
    let pending = downloads.get(cpid);
    if (!pending) {
      pending = download(url, dir).finally(() => downloads.delete(cpid));
      downloads.set(cpid, pending);
    }
    await pending;
    cases = await readCases(dir);
  }

  if (!cases || cases.length === 0) {
    throw new Error(`no test cases for cpid ${cpid}`);
  }
  return cases;
}

async function readCases(dir: string): Promise<TestCase[] | undefined> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw err;
  }

  const present = new Set(names);
  const cases: TestCase[] = [];
  for (const name of names) {
    const match = CASE_FILE.exec(name);
    if (!match || match[2] !== "in" || !present.has(`${match[1]}.out`)) continue;
    cases.push({
      testId: Number(match[1]),
      inPath: join(dir, name),
      outPath: join(dir, `${match[1]}.out`),
    });
  }
  return cases.sort((a, b) => a.testId - b.testId);
}

async function download(url: string, dir: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`downloading ${url} failed with status ${response.status}`);
  }
  // Counted while reading, because content-length can be missing.
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of response.body ?? []) {
    size += chunk.length;
    if (size > MAX_ZIP_BYTES) {
      throw new Error(`${url} is larger than the test case size limit`);
    }
    chunks.push(chunk);
  }
  const zip = new AdmZip(Buffer.concat(chunks));

  // Extracted next to the final directory, then renamed, so a crash leaves no half-filled cache.
  const tmp = `${dir}.tmp-${randomUUID()}`;
  await mkdir(tmp, { recursive: true });
  try {
    for (const entry of zip.getEntries()) {
      const name = basename(entry.entryName);
      if (entry.isDirectory || !CASE_FILE.test(name)) continue;
      await writeFile(join(tmp, name), entry.getData());
    }
    // An empty directory would be cached forever.
    if ((await readCases(tmp))?.length === 0) {
      throw new Error(`${url} contains no test cases`);
    }
    await rename(tmp, dir);
  } catch (err) {
    await rm(tmp, { recursive: true, force: true });
    throw err;
  }
}
