import { config } from "../config.ts";

export type Language = "python3" | "cpp";

type LanguageSpec = {
  source: string;
  compile?: { argv: string[]; output: string };
  run: string[];
};

export const languages: Record<Language, LanguageSpec> = {
  python3: { source: "solution.py", run: [config.pythonBin, "solution.py"] },
  cpp: {
    source: "solution.cpp",
    compile: {
      argv: [config.gxxBin, "-O2", "-std=c++17", "-o", "solution", "solution.cpp"],
      output: "solution",
    },
    run: ["./solution"],
  },
};
