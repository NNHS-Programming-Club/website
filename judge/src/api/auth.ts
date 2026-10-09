import type { FastifyReply, FastifyRequest } from "fastify";
import { sendError } from "./errors.ts";

// Resolves to the uid, rejects when the token is not valid.
export type VerifyToken = (token: string) => Promise<string>;

declare module "fastify" {
  interface FastifyRequest {
    uid: string;
  }
}

export function requireAuth(verifyToken: VerifyToken) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const token = /^Bearer (.+)$/.exec(request.headers.authorization ?? "")?.[1];
    if (token) {
      try {
        request.uid = await verifyToken(token);
        return;
      } catch (err) {
        request.log.info(err, "ID token rejected");
      }
    }
    return sendError(reply, 401, "unauthorized", "Missing or invalid ID token");
  };
}
