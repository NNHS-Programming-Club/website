import { join } from "node:path";

export const config = {
  port: Number(process.env.PORT) || 8080,
  host: process.env.HOST || "127.0.0.1",
  corsOrigins: (process.env.CORS_ORIGINS || "https://nnhsprogramming.club,http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  cacheDir: process.env.CACHE_DIR || join(import.meta.dirname, "..", "cache"),
  // An absolute path: isolate does not search PATH.
  pythonBin: "/usr/bin/python3",
  gxxBin: "/usr/bin/g++",
  javaHome: "/usr/lib/jvm/java-11-openjdk-amd64",
  // Time limits are per language, in languages.ts.
  limits: {
    memoryKb: 131072,
    outputKb: 1024,
  },
  // outputKb also caps the binary size.
  compileLimits: {
    cpuSeconds: 30,
    wallSeconds: 60,
    memoryKb: 524288,
    outputKb: 65536,
  },
};
