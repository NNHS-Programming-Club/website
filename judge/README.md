# Judge service

The NNHS Programming Club website's own judge REST API, used by the Daily Problem page. It is a separate package from the React app in the repo root.

Needs Node.js 22.18 or later, which runs the TypeScript files directly, so there is no build step.

## Setup

```bash
cd judge
npm install
cp .env.example .env
```

Submit mode needs a Firebase service account key at `judge/serviceAccountKey.json`.

## Commands

```bash
npm run start:api    # API at 127.0.0.1:8080
npm test
npm run typecheck    # types are not checked when the code runs
```

## API

| Endpoint | Description |
|---|---|
| `GET /healthz` | Liveness check |
| `POST /submissions` | Queue a submission; returns `202 { "id" }` |
| `GET /submissions/:id` | `{ "id", "mode", "status", "result" }` |

```json
{ "mode": "run", "language": "python3", "code": "print(input())", "stdin": "hello\n" }
{ "mode": "submit", "language": "python3", "code": "...", "cpid": 1234 }
```

- `language` must be `python3`; `code` is limited to 64KB and `stdin` to 1MB.
- `status` is `queued`, `running`, `done`, or `error` (the judge itself failed). Submissions run one at a time, unsandboxed.
- Run result: `{ verdict, stdout, stderr, timeMs, memoryKb, truncated }`
- Submit result: `{ verdict, total, passed, cases, firstFailure }`; while running, `{ total, cases }` so far.
- A submit looks the problem up by `cpid` in Firestore: `404` if it is unknown, `422` if it reads and writes files. Its test cases are downloaded from usaco.org once and cached.
- Errors are `{ "error": { "code", "message" } }`.

```bash
curl -X POST localhost:8080/submissions \
  -H "content-type: application/json" \
  -d '{"mode":"run","language":"python3","code":"print(1)","stdin":""}'   # {"id":"..."}
curl localhost:8080/submissions/<id>
```

## Configuration

Environment variables, loaded from `.env` by `npm run start:api` and `npm test`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Port the API listens on |
| `HOST` | `127.0.0.1` | Address the API listens on |
| `CORS_ORIGINS` | `https://nnhsprogramming.club,http://localhost:3000` | Allowed origins, comma-separated |
| `CACHE_DIR` | `judge/cache` | Test case cache |
| `GOOGLE_APPLICATION_CREDENTIALS` | none | Path to the Firebase service account key |
| `PYTHON_BIN` | `python3` | Python that runs submitted code; `python` on Windows |
