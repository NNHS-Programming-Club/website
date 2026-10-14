import test from "node:test";
import type { TestContext } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/api/app.ts";

const entries = [
  { name: "Alice", points: 12 },
  { name: "Bob", points: 3 },
];

function setup(t: TestContext) {
  const app = buildApp({
    getLeaderboard: async () => entries,
    verifyToken: async (token) => {
      if (token !== "uid-alice") throw new Error("bad token");
      return token;
    },
  });
  t.after(() => app.close());
  return app;
}

test("GET /leaderboard returns the entries", async (t) => {
  const app = setup(t);

  const res = await app.inject({
    method: "GET",
    url: "/leaderboard",
    headers: { authorization: "Bearer uid-alice" },
  });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), { entries });
});

test("GET /leaderboard returns 401 without a token", async (t) => {
  const app = setup(t);

  const res = await app.inject({ method: "GET", url: "/leaderboard" });

  assert.equal(res.statusCode, 401);
  assert.equal(res.json().error.code, "unauthorized");
});
