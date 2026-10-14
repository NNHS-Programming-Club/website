import type { FastifyInstance } from "fastify";
import { requireAuth } from "../auth.ts";
import type { VerifyToken } from "../auth.ts";
import type { GetLeaderboard } from "../results.ts";

export async function leaderboardRoutes(
  app: FastifyInstance,
  opts: { getLeaderboard: GetLeaderboard; verifyToken: VerifyToken },
) {
  app.addHook("onRequest", requireAuth(opts.verifyToken));

  app.get("/leaderboard", async () => ({ entries: await opts.getLeaderboard() }));
}
