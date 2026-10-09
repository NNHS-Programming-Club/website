import type { FastifyInstance } from "fastify";
import { requireAuth } from "../auth.ts";
import type { VerifyToken } from "../auth.ts";
import { sendError } from "../errors.ts";
import type { GetProblem } from "../problems.ts";
import { create, get } from "../store.ts";
import type { Language } from "../store.ts";

const MAX_CODE_BYTES = 64 * 1024;
const MAX_STDIN_BYTES = 1024 * 1024;
// JSON escaping can double the size of stdin.
const BODY_LIMIT = 2 * (MAX_CODE_BYTES + MAX_STDIN_BYTES) + 1024;

const bodySchema = {
  type: "object",
  required: ["mode", "language", "code"],
  properties: {
    mode: { enum: ["run", "submit"] },
    language: { enum: ["python3"] },
    code: { type: "string", minLength: 1, maxLength: MAX_CODE_BYTES },
    stdin: { type: "string", maxLength: MAX_STDIN_BYTES },
    cpid: { type: "integer" },
  },
  allOf: [
    {
      if: { properties: { mode: { const: "run" } } },
      then: { required: ["stdin"] },
    },
    {
      if: { properties: { mode: { const: "submit" } } },
      then: { required: ["cpid"] },
    },
  ],
};

type SubmissionBody = {
  mode: "run" | "submit";
  language: Language;
  code: string;
  stdin?: string;
  cpid?: number;
};

export async function submissionsRoutes(
  app: FastifyInstance,
  opts: { getProblem: GetProblem; verifyToken: VerifyToken },
) {
  app.addHook("onRequest", requireAuth(opts.verifyToken));

  app.post<{ Body: SubmissionBody }>(
    "/submissions",
    { schema: { body: bodySchema }, bodyLimit: BODY_LIMIT },
    async (request, reply) => {
      const { mode, language, code, stdin = "", cpid = 0 } = request.body;

      // maxLength counts characters, not bytes.
      if (Buffer.byteLength(code) > MAX_CODE_BYTES) {
        return sendError(reply, 400, "invalid_request", "code must not be larger than 64KB");
      }
      if (mode === "run" && Buffer.byteLength(stdin) > MAX_STDIN_BYTES) {
        return sendError(reply, 400, "invalid_request", "stdin must not be larger than 1MB");
      }

      if (mode === "run") {
        const id = await create(request.uid, { mode, language, code, stdin });
        return reply.code(202).send({ id });
      }

      const problem = await opts.getProblem(cpid);
      if (!problem) {
        return sendError(reply, 404, "not_found", "Problem not found");
      }
      if (problem.isFileIo) {
        return sendError(
          reply,
          422,
          "unsupported_problem",
          "Problems that read and write files are not supported",
        );
      }

      const id = await create(request.uid, {
        mode,
        language,
        code,
        cpid,
        testCasesUrl: problem.testCasesUrl,
      });
      return reply.code(202).send({ id });
    },
  );

  app.get<{ Params: { id: string } }>("/submissions/:id", async (request, reply) => {
    const submission = await get(request.params.id, request.uid);
    if (!submission) {
      return sendError(reply, 404, "not_found", "Submission not found");
    }
    return submission;
  });
}
