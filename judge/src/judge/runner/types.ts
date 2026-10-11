export type RunLimits = {
  cpuSeconds: number;
  wallSeconds: number;
  memoryKb: number;
  outputKb: number;
};

export type RunRequest = {
  // File name to content, written into the working directory before the program starts.
  files: Record<string, string | Buffer>;
  argv: string[];
  stdin: string;
  limits: RunLimits;
  // Matching files are read back into `collected`.
  collect?: RegExp;
};

export type RunStatus = "exited" | "signaled" | "timeout" | "memory_limit" | "output_limit";

export type RunResult = {
  status: RunStatus;
  exitCode: number | null;
  signal: string | null;
  timeMs: number;
  memoryKb: number;
  stdout: string;
  stderr: string;
  collected?: Record<string, Buffer>;
};

export type Runner = (request: RunRequest) => Promise<RunResult>;
