import test from "node:test";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/api/app.ts";
import type { VerifyToken } from "../src/api/auth.ts";
import { config } from "../src/config.ts";
import type { GetProblem } from "../src/api/problems.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const run = { mode: "run", language: "python3", code: "print(input())", stdin: "hello\n" };
const submit = { mode: "submit", language: "python3", code: "print(1)", cpid: 1234 };

const FILE_IO_CPID = 5678;
const getProblem: GetProblem = async (cpid) => {
  if (cpid !== submit.cpid && cpid !== FILE_IO_CPID) return undefined;
  return {
    cpid,
    testCasesUrl: "https://usaco.org/current/data/prob1_bronze_dec20.zip",
    isFileIo: cpid === FILE_IO_CPID,
  };
};

const verifyToken: VerifyToken = async (token) => {
  if (!token.startsWith("uid-")) throw new Error("bad token");
  return token;
};
const alice = { authorization: "Bearer uid-alice" };
const bob = { authorization: "Bearer uid-bob" };

// The submit above finds its case in the cache, so no test downloads anything.
config.cacheDir = await mkdtemp(join(tmpdir(), "judge-cache-"));
await mkdir(join(config.cacheDir, "1234"));
await writeFile(join(config.cacheDir, "1234", "1.in"), "");
await writeFile(join(config.cacheDir, "1234", "1.out"), "1\n");
test.after(() => rm(config.cacheDir, { recursive: true, force: true }));

function setup(t: TestContext) {
  const app = buildApp({ getProblem, verifyToken });
  t.after(() => app.close());
  return app;
}

async function waitUntilFinished(app: FastifyInstance, id: string) {
  for (;;) {
    const view = (
      await app.inject({ method: "GET", url: `/submissions/${id}`, headers: alice })
    ).json();
    if (view.status === "done" || view.status === "error") return view;
    await sleep(20);
  }
}

function without(body: Record<string, unknown>, key: string) {
  const copy = { ...body };
  delete copy[key];
  return copy;
}

for (const [name, body] of [
  ["run", run],
  ["run with empty stdin", { ...run, stdin: "" }],
  ["submit", submit],
] as const) {
  test(`POST /submissions accepts a valid ${name}`, async (t) => {
    const app = setup(t);

    const created = await app.inject({
      method: "POST",
      url: "/submissions",
      headers: alice,
      payload: body,
    });

    assert.equal(created.statusCode, 202);
    const { id } = created.json();
    assert.match(id, UUID);

    const fetched = await app.inject({ method: "GET", url: `/submissions/${id}`, headers: alice });

    assert.equal(fetched.statusCode, 200);
    const view = fetched.json();
    assert.deepEqual(Object.keys(view), ["id", "mode", "status", "result"]);
    assert.equal(view.id, id);
    assert.equal(view.mode, body.mode);
    assert.ok(["queued", "running", "done", "error"].includes(view.status));

    await waitUntilFinished(app, id);
  });
}

const invalidBodies:[string, Record<string, unknown>][] = [
  ["missing mode", without(run, "mode")],
  ["unknown mode", { ...run, mode: "debug" }],
  ["missing language", without(run, "language")],
  ["unsupported language", { ...run, language: "cpp" }],
  ["missing code", without(run, "code")],
  ["empty code", { ...run, code: "" }],
  ["non-string code", { ...run, code: 1 }],
  ["code over 64KB", { ...run, code: "a".repeat(64 * 1024 + 1) }],
  ["multi-byte code over 64KB", { ...run, code: "é".repeat(40 * 1024) }],
  ["run without stdin", without(run, "stdin")],
  ["non-string stdin", { ...run, stdin: 1 }],
  ["stdin over 1MB", { ...run, stdin: "a".repeat(1024 * 1024 + 1) }],
  ["multi-byte stdin over 1MB", { ...run, stdin: "é".repeat(600 * 1024) }],
  ["submit without cpid", without(submit, "cpid")],
  ["fractional cpid", { ...submit, cpid: 1.5 }],
  ["string cpid", { ...submit, cpid: "1234" }],
];

for (const [name, body] of invalidBodies) {
  test(`POST /submissions rejects ${name}`, async (t) => {
    const app = setup(t);

    const res = await app.inject({
      method: "POST",
      url: "/submissions",
      headers: alice,
      payload: body,
    });

    assert.equal(res.statusCode, 400);
    const { error } = res.json();
    assert.equal(error.code, "invalid_request");
    assert.equal(typeof error.message, "string");
  });
}

test("POST /submissions rejects malformed JSON", async (t) => {
  const app = setup(t);

  const res = await app.inject({
    method: "POST",
    url: "/submissions",
    headers: { ...alice, "content-type": "application/json" },
    payload: "{not json",
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.json().error.code, "invalid_request");
});

test("POST /submissions rejects a body over the size limit", async (t) => {
  const app = setup(t);

  const res = await app.inject({
    method: "POST",
    url: "/submissions",
    headers: alice,
    payload: { ...run, stdin: "a".repeat(3 * 1024 * 1024) },
  });

  assert.equal(res.statusCode, 413);
  assert.equal(res.json().error.code, "payload_too_large");
});

test("POST /submissions returns 404 for an unknown problem", async (t) => {
  const app = setup(t);

  const res = await app.inject({
    method: "POST",
    url: "/submissions",
    headers: alice,
    payload: { ...submit, cpid: 1 },
  });

  assert.equal(res.statusCode, 404);
  assert.equal(res.json().error.code, "not_found");
});

test("POST /submissions returns 422 for a problem that reads and writes files", async (t) => {
  const app = setup(t);

  const res = await app.inject({
    method: "POST",
    url: "/submissions",
    headers: alice,
    payload: { ...submit, cpid: FILE_IO_CPID },
  });

  assert.equal(res.statusCode, 422);
  assert.equal(res.json().error.code, "unsupported_problem");
});

test("GET /submissions/:id returns 404 for an unknown id", async (t) => {
  const app = setup(t);

  const res = await app.inject({
    method: "GET",
    url: "/submissions/0b0c6f0e-6c0f-4b53-9a52-0c6b7f0a3a51",
    headers: alice,
  });

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.json(), {
    error: { code: "not_found", message: "Submission not found" },
  });
});

const rejectedHeaders: [string, Record<string, string>][] = [
  ["no token", {}],
  ["a non-Bearer header", { authorization: "Basic uid-alice" }],
  ["a bad token", { authorization: "Bearer nope" }],
];

for (const [name, headers] of rejectedHeaders) {
  test(`submissions routes return 401 for ${name}`, async (t) => {
    const app = setup(t);

    const responses = [
      await app.inject({ method: "POST", url: "/submissions", headers, payload: run }),
      // Auth runs before the body is validated.
      await app.inject({ method: "POST", url: "/submissions", headers, payload: {} }),
      await app.inject({
        method: "GET",
        url: "/submissions/0b0c6f0e-6c0f-4b53-9a52-0c6b7f0a3a51",
        headers,
      }),
    ];

    for (const res of responses) {
      assert.equal(res.statusCode, 401);
      assert.equal(res.json().error.code, "unauthorized");
    }
  });
}

test("GET /submissions/:id returns 404 for someone else's submission", async (t) => {
  const app = setup(t);

  const created = await app.inject({
    method: "POST",
    url: "/submissions",
    headers: alice,
    payload: run,
  });
  const { id } = created.json();

  const res = await app.inject({ method: "GET", url: `/submissions/${id}`, headers: bob });

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.json(), {
    error: { code: "not_found", message: "Submission not found" },
  });

  const view = await waitUntilFinished(app, id);
  assert.equal(view.id, id);
});

test("unknown routes use the same error shape", async (t) => {
  const app = setup(t);

  const res = await app.inject({ method: "GET", url: "/nope" });

  assert.equal(res.statusCode, 404);
  assert.equal(res.json().error.code, "not_found");
});
