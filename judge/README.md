# Judge service

The NNHS Programming Club website's own judge REST API, replacing the Judge0 calls on the Daily Problem page.

This directory has its own `package.json` and is independent of the React app in the repo root.

It is written in TypeScript (ESM) and needs Node.js 22.18 or later. Node runs the `.ts` files directly by stripping the types, so there is no build step.

## Install

```bash
cd judge
npm install
```

## Run

```bash
npm run start:api
curl localhost:8080/healthz   # {"status":"ok"}
```

## API

| Endpoint | Description |
|---|---|
| `GET /healthz` | Liveness check |
| `POST /submissions` | Queue a submission; returns `202 { "id" }` |
| `GET /submissions/:id` | `{ "id", "mode", "status", "result" }` |

A submission either runs the code against a custom stdin or submits it for a problem:

```json
{ "mode": "run", "language": "python3", "code": "print(input())", "stdin": "hello\n" }
{ "mode": "submit", "language": "python3", "code": "...", "cpid": 1234, "testCasesUrl": "https://usaco.org/current/data/....zip" }
```

`language` must be `python3`, `code` is limited to 64KB, and `stdin` to 1MB.

`status` is `queued`, `running`, `done`, or `error` (the judge itself failed). Submissions run one at a time, unsandboxed.

- Run result: `{ verdict, stdout, stderr, timeMs, memoryKb, truncated }`
- Submit result: `{ verdict, total, passed, cases, firstFailure }`; while running, `{ total, cases }` so far

Test cases are downloaded from `testCasesUrl` (must be on `usaco.org`) and cached per `cpid`. Taking the URL from the client is temporary.

```bash
curl -X POST localhost:8080/submissions \
  -H "content-type: application/json" \
  -d '{"mode":"run","language":"python3","code":"print(1)","stdin":""}'   # {"id":"..."}
curl localhost:8080/submissions/<id>   # {"id":"...","mode":"run","status":"done","result":{"verdict":"OK","stdout":"1\n",...}}
```

Every error response has the same shape:

```json
{ "error": { "code": "invalid_request", "message": "body must have required property 'code'" } }
```

## Test

```bash
npm test
```

## Type check

Node does not check types when it runs the code, so run the compiler separately:

```bash
npm run typecheck
```

## Configuration

Configured through environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Port the API listens on |
| `HOST` | `127.0.0.1` | Address the API listens on |
| `CORS_ORIGINS` | `https://nnhsprogramming.club,http://localhost:3000` | Origins allowed to call the API, comma-separated |
| `CACHE_DIR` | `judge/cache` | Test case cache |
| `PYTHON_BIN` | `python3` | Python interpreter that runs the submitted code; set it to `python` on Windows |
