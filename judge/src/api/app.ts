import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./routes/health.ts";

export type BuildAppOptions = {
  logger?: boolean;
};

// Kept separate from server.ts so tests can use app.inject() without listening on a port.
export function buildApp(opts: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: opts.logger ?? false });

  app.register(healthRoutes);

  return app;
}
