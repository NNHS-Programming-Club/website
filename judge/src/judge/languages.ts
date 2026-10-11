import { config } from "../config.ts";
import type { RunLimits } from "./runner/types.ts";

export type Language = "python3" | "cpp" | "java";

export type Program = {
  source: string;
  compile?: { argv: string[]; output: RegExp };
  run: string[];
};

type LanguageSpec = {
  cpuSeconds: number;
  program: (code: string) => Program;
};

const JAVAC = `${config.javaHome}/bin/javac`;
const JAVA = `${config.javaHome}/bin/java`;

export const languages: Record<Language, LanguageSpec> = {
  python3: {
    cpuSeconds: 4,
    program: () => ({ source: "solution.py", run: [config.pythonBin, "-O", "solution.py"] }),
  },
  cpp: {
    cpuSeconds: 2,
    program: () => ({
      source: "solution.cpp",
      compile: {
        argv: [config.gxxBin, "-O2", "-std=c++17", "-o", "solution", "solution.cpp"],
        output: /^solution$/,
      },
      run: ["./solution"],
    }),
  },
  java: {
    cpuSeconds: 4,
    program: (code) => {
      const mainClass = mainClassOf(code);
      return {
        source: `${mainClass}.java`,
        compile: {
          argv: [
            JAVAC,
            "-J-XX:+UseSerialGC",
            "-J-Xmx256m",
            "-encoding",
            "UTF-8",
            `${mainClass}.java`,
          ],
          output: /\.class$/,
        },
        // The JVM cannot see the cgroup limit, hence -Xmx.
        run: [
          JAVA,
          "-XX:+UseSerialGC",
          "-Xmx64m",
          "-Xss64m",
          "-XX:-UsePerfData",
          "-Dfile.encoding=UTF-8",
          "-cp",
          ".",
          mainClass,
        ],
      };
    },
  },
};

// javac wants the file named after its public class.
export function mainClassOf(code: string): string {
  const match = code.match(
    /\bpublic\s+(?:(?:final|abstract|strictfp)\s+)*(?:class|interface|enum)\s+([A-Za-z_$][\w$]{0,63})(?![\w$])/,
  );
  return match ? match[1] : "Main";
}

export function runLimits(language: Language): RunLimits {
  const { cpuSeconds } = languages[language];
  return { ...config.limits, cpuSeconds, wallSeconds: 2 * cpuSeconds };
}
