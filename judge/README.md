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
