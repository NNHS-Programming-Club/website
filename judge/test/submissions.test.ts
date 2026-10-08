import test from "node:test";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/api/app.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const run = { mode: "run", language: "python3", code: "print(input())", stdin: "hello\n" };
const submit = { mode: "submit", language: "python3", code: "print(1)", cpid: 1234 };

function setup(t: TestContext) {
  const app = buildApp();
  t.after(() => app.close());
  return app;
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
  test(`POST /submissions accepts a valid ${name} and reports it as queued`, async (t) => {
    const app = setup(t);

    const created = await app.inject({ method: "POST", url: "/submissions", payload: body });

    assert.equal(created.statusCode, 202);
    const { id } = created.json();
    assert.match(id, UUID);

    const fetched = await app.inject({ method: "GET", url: `/submissions/${id}` });

    assert.equal(fetched.statusCode, 200);
    assert.deepEqual(fetched.json(), { id, mode: body.mode, status: "queued" });
  });
}

const invalidBodies: [string, Record<string, unknown>][] = [
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

    const res = await app.inject({ method: "POST", url: "/submissions", payload: body });

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
    headers: { "content-type": "application/json" },
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
    payload: { ...run, stdin: "a".repeat(3 * 1024 * 1024) },
  });

  assert.equal(res.statusCode, 413);
  assert.equal(res.json().error.code, "payload_too_large");
});

test("GET /submissions/:id returns 404 for an unknown id", async (t) => {
  const app = setup(t);

  const res = await app.inject({
    method: "GET",
    url: "/submissions/0b0c6f0e-6c0f-4b53-9a52-0c6b7f0a3a51",
  });

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.json(), {
    error: { code: "not_found", message: "Submission not found" },
  });
});

test("unknown routes use the same error shape", async (t) => {
  const app = setup(t);

  const res = await app.inject({ method: "GET", url: "/nope" });

  assert.equal(res.statusCode, 404);
  assert.equal(res.json().error.code, "not_found");
});
