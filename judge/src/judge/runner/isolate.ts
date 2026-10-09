import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseMeta, toRunResult } from "./meta.ts";
import type { Runner } from "./types.ts";

// Submissions run one at a time, so a single box is enough.
const BOX = ["--cg", "--box-id=0"];
const MAX_PROCESSES = 16;

const STDIN = ".stdin";
const STDOUT = ".stdout";
const STDERR = ".stderr";

export const runIsolated: Runner = async ({ files, argv, stdin, limits }) => {
  const metaDir = await mkdtemp(join(tmpdir(), "judge-meta-"));
  try {
    // A crashed earlier run may have left the box behind, and --init refuses to reuse it.
    await isolate(["--cleanup"]);
    const init = await isolate(["--init"]);
    if (init.code !== 0) throw new Error(`isolate --init failed: ${init.stderr.trim()}`);
    const box = join(init.stdout.trim(), "box");

    for (const [name, content] of Object.entries(files)) {
      await writeFile(join(box, name), content);
    }
    await writeFile(join(box, STDIN), stdin);

    const metaPath = join(metaDir, "meta");
    const run = await isolate([
      `--time=${limits.cpuSeconds}`,
      `--wall-time=${limits.wallSeconds}`,
      `--cg-mem=${limits.memoryKb}`,
      `--fsize=${limits.outputKb}`,
      `--processes=${MAX_PROCESSES}`,
      `--meta=${metaPath}`,
      `--stdin=${STDIN}`,
      `--stdout=${STDOUT}`,
      `--stderr=${STDERR}`,
      "--run",
      "--",
      ...argv,
    ]);
    // 1 means the program failed; anything higher is isolate itself.
    if (run.code > 1) throw new Error(`isolate --run failed: ${run.stderr.trim()}`);

    const meta = parseMeta(await readFile(metaPath, "utf8"));
    const stdout = await readFile(join(box, STDOUT));
    const stderr = await readFile(join(box, STDERR));
    // --fsize stops the files at the limit, so a full file means output was lost.
    const maxBytes = limits.outputKb * 1024;
    const outputLimited = stdout.length >= maxBytes || stderr.length >= maxBytes;

    return toRunResult(meta, stdout.toString(), stderr.toString(), outputLimited);
  } finally {
    await isolate(["--cleanup"]).catch(() => {});
    await rm(metaDir, { recursive: true, force: true });
  }
};

function isolate(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile("isolate", [...BOX, ...args], (err, stdout, stderr) => {
      const code = err ? err.code : 0;
      // No numeric exit code: isolate could not be started or was killed.
      if (typeof code !== "number") return reject(err);
      resolve({ code, stdout, stderr });
    });
  });
}
