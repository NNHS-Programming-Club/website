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
  limits: {
    cpuSeconds: 4,
    wallSeconds: 8,
    memoryKb: 131072,
    outputKb: 1024,
  },
};
