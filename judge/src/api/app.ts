import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { registerErrorHandlers } from "./errors.ts";
import { healthRoutes } from "./routes/health.ts";
import { submissionsRoutes } from "./routes/submissions.ts";

export type BuildAppOptions = {
  logger?: boolean;
};

// Kept separate from server.ts so tests can use app.inject() without listening on a port.
export function buildApp(opts: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: opts.logger ?? false,
    ajv: { customOptions: { coerceTypes: false } },
  });

  registerErrorHandlers(app);

  app.register(healthRoutes);
  app.register(submissionsRoutes);

  return app;
}
