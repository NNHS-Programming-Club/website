import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { config } from "../config.ts";
import { registerErrorHandlers } from "./errors.ts";
import { getProblem } from "./problems.ts";
import type { GetProblem } from "./problems.ts";
import { healthRoutes } from "./routes/health.ts";
import { submissionsRoutes } from "./routes/submissions.ts";

export type BuildAppOptions = {
  logger?: boolean;
  // Tests pass a fake so they do not need Firestore.
  getProblem?: GetProblem;
};

// Kept separate from server.ts so tests can use app.inject() without listening on a port.
export function buildApp(opts: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: opts.logger ?? false,
    ajv: { customOptions: { coerceTypes: false } },
  });

  registerErrorHandlers(app);

  app.register(cors, {
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
  });

  app.register(healthRoutes);
  app.register(submissionsRoutes, { getProblem: opts.getProblem ?? getProblem });

  return app;
}
