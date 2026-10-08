import type { FastifyInstance } from "fastify";
import { sendError } from "../errors.ts";
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
    testCasesUrl: { type: "string", maxLength: 2048 },
  },
  allOf: [
    {
      if: { properties: { mode: { const: "run" } } },
      then: { required: ["stdin"] },
    },
    {
      if: { properties: { mode: { const: "submit" } } },
      then: { required: ["cpid", "testCasesUrl"] },
    },
  ],
};

type SubmissionBody = {
  mode: "run" | "submit";
  language: Language;
  code: string;
  stdin?: string;
  cpid?: number;
  testCasesUrl?: string;
};

// Temporary: the client supplies the test case URL until the judge looks problems up itself.
function isUsacoUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /^(www\.)?usaco\.org$/.test(url.hostname);
  } catch {
    return false;
  }
}

export async function submissionsRoutes(app: FastifyInstance) {
  app.post<{ Body: SubmissionBody }>(
    "/submissions",
    { schema: { body: bodySchema }, bodyLimit: BODY_LIMIT },
    async (request, reply) => {
      const { mode, language, code, stdin = "", cpid = 0, testCasesUrl = "" } = request.body;

      // maxLength counts characters, not bytes.
      if (Buffer.byteLength(code) > MAX_CODE_BYTES) {
        return sendError(reply, 400, "invalid_request", "code must not be larger than 64KB");
      }
      if (mode === "run" && Buffer.byteLength(stdin) > MAX_STDIN_BYTES) {
        return sendError(reply, 400, "invalid_request", "stdin must not be larger than 1MB");
      }

      if (mode === "submit" && !isUsacoUrl(testCasesUrl)) {
        return sendError(reply, 400, "invalid_request", "testCasesUrl must be an https://usaco.org URL");
      }

      const id = await create(
        mode === "run"
          ? { mode, language, code, stdin }
          : { mode, language, code, cpid, testCasesUrl },
      );
      return reply.code(202).send({ id });
    },
  );

  app.get<{ Params: { id: string } }>("/submissions/:id", async (request, reply) => {
    const submission = await get(request.params.id);
    if (!submission) {
      return sendError(reply, 404, "not_found", "Submission not found");
    }
    return submission;
  });
}
