import { config } from "../config.ts";
import { languages } from "./languages.ts";
import type { Language } from "./languages.ts";
import type { Runner } from "./runner/types.ts";
import { verdictOf } from "./verdict.ts";

export type Files = Record<string, string | Buffer>;

export type CompileResult = { ok: true; files: Files } | { ok: false; compileOutput: string };

// Returns the files to put in the box for every run.
export async function compile(
  language: Language,
  code: string,
  runner: Runner,
): Promise<CompileResult> {
  const { source, compile } = languages[language];
  const files: Files = { [source]: code };
  if (!compile) return { ok: true, files };

  const result = await runner({
    files,
    argv: compile.argv,
    stdin: "",
    limits: config.compileLimits,
    collect: compile.output,
  });
  if (verdictOf(result) !== "OK" || !result.collected) {
    return { ok: false, compileOutput: result.stderr };
  }
  return { ok: true, files: { [compile.output]: result.collected } };
}
