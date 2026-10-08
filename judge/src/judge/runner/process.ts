import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Readable } from "node:stream";
import type { RunRequest, RunResult, Runner } from "./types.ts";

// No sandbox and no CPU or memory limit: only for a machine you trust the code on.
export const runProgram: Runner = async (request) => {
  const dir = await mkdtemp(join(tmpdir(), "judge-"));
  try {
    for (const [name, content] of Object.entries(request.files)) {
      await writeFile(join(dir, name), content);
    }
    return await execute(dir, request);
  } finally {
    // Windows can keep the directory locked for a moment after a kill.
    await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
};

function execute(dir: string, { argv, stdin, limits }: RunRequest): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const [command, ...args] = argv;
    const maxBytes = limits.outputKb * 1024;
    const started = performance.now();
    const child = spawn(command, args, {
      cwd: dir,
      windowsHide: true,
      // Python on Windows would otherwise use the system code page for piped stdio.
      env: { ...process.env, PYTHONUTF8: "1" },
    });

    let killedBy: "timeout" | "output_limit" | undefined;
    const kill = (reason: "timeout" | "output_limit") => {
      killedBy ??= reason;
      child.kill("SIGKILL");
    };
    const timer = setTimeout(() => kill("timeout"), limits.wallSeconds * 1000);

    const collect = (stream: Readable) => {
      const chunks: Buffer[] = [];
      let size = 0;
      stream.on("data", (chunk: Buffer) => {
        if (killedBy) return;
        const room = maxBytes - size;
        if (chunk.length > room) {
          chunks.push(chunk.subarray(0, room));
          size = maxBytes;
          kill("output_limit");
        } else {
          chunks.push(chunk);
          size += chunk.length;
        }
      });
      return () => Buffer.concat(chunks).toString();
    };
    const stdout = collect(child.stdout);
    const stderr = collect(child.stderr);

    // A program that exits without reading its input closes the pipe early.
    child.stdin.on("error", () => {});
    child.stdin.end(stdin);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolve({
        status: killedBy ?? (signal ? "signaled" : "exited"),
        exitCode,
        signal,
        timeMs: Math.round(performance.now() - started),
        memoryKb: 0,
        stdout: stdout(),
        stderr: stderr(),
      });
    });
  });
}
