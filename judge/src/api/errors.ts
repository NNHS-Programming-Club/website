import type { FastifyError, FastifyInstance, FastifyReply } from "fastify";

export function sendError(
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string,
) {
  return reply.code(statusCode).send({ error: { code, message } });
}

export function registerErrorHandlers(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;

    if (statusCode >= 400 && statusCode < 500) {
      const code = statusCode === 413 ? "payload_too_large" : "invalid_request";
      return sendError(reply, statusCode, code, error.message);
    }

    request.log.error(error);
    return sendError(reply, 500, "internal_error", "Internal server error");
  });

  app.setNotFoundHandler((request, reply) =>
    sendError(reply, 404, "not_found", `Route ${request.method} ${request.url} not found`),
  );
}
