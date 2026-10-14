import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { config } from "../config.ts";
import type { VerifyToken } from "./auth.ts";
import { registerErrorHandlers } from "./errors.ts";
import { verifyIdToken } from "./firebase.ts";
import { getProblem } from "./problems.ts";
import type { GetProblem } from "./problems.ts";
import { getLastSubmission, getLeaderboard, saveSubmission } from "./results.ts";
import type { GetLastSubmission, GetLeaderboard, SaveSubmission } from "./results.ts";
import { healthRoutes } from "./routes/health.ts";
import { leaderboardRoutes } from "./routes/leaderboard.ts";
import { submissionsRoutes } from "./routes/submissions.ts";

export type BuildAppOptions = {
  logger?: boolean;
  getProblem?: GetProblem;
  verifyToken?: VerifyToken;
  saveSubmission?: SaveSubmission;
  getLastSubmission?: GetLastSubmission;
  getLeaderboard?: GetLeaderboard;
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

  const verifyToken = opts.verifyToken ?? verifyIdToken;

  app.register(healthRoutes);
  app.register(submissionsRoutes, {
    getProblem: opts.getProblem ?? getProblem,
    saveSubmission: opts.saveSubmission ?? saveSubmission,
    getLastSubmission: opts.getLastSubmission ?? getLastSubmission,
    verifyToken,
  });
  app.register(leaderboardRoutes, {
    getLeaderboard: opts.getLeaderboard ?? getLeaderboard,
    verifyToken,
  });

  return app;
}
