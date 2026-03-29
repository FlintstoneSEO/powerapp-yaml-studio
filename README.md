# PowerApp YAML Studio

Initial monorepo scaffold using `pnpm` workspaces.

## Apps and packages

- `apps/web`: Vite + React + TypeScript frontend shell.
- `apps/api`: Express API with `GET /api/health`.
- `packages/shared`: Shared TypeScript types/utilities.

## Commands

From the repository root:

- `pnpm dev` – run both web and api in parallel.
- `pnpm build` – build all workspace packages.
- `pnpm typecheck` – type-check all workspace packages.

## Health endpoint

When API is running, call:

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{ "status": "ok" }
```
