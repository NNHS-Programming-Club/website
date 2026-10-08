export const config = {
  port: Number(process.env.PORT) || 8080,
  host: process.env.HOST || "127.0.0.1",
  pythonBin: process.env.PYTHON_BIN || "python3",
  limits: {
    cpuSeconds: 4,
    wallSeconds: 8,
    memoryKb: 131072,
    outputKb: 1024,
  },
};
