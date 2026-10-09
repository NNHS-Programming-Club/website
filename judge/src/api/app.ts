import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { config } from "../config.ts";
import type { VerifyToken } from "./auth.ts";
import { registerErrorHandlers } from "./errors.ts";
import { verifyIdToken } from "./firebase.ts";
import { getProblem } from "./problems.ts";
import type { GetProblem } from "./problems.ts";
import { healthRoutes } from "./routes/health.ts";
import { submissionsRoutes } from "./routes/submissions.ts";

export type BuildAppOptions = {
  logger?: boolean;
  getProblem?: GetProblem;
  verifyToken?: VerifyToken;
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

  app.decorateRequest("uid", "");

  app.register(healthRoutes);
  app.register(submissionsRoutes, {
    getProblem: opts.getProblem ?? getProblem,
    verifyToken: opts.verifyToken ?? verifyIdToken,
  });

  return app;
}
