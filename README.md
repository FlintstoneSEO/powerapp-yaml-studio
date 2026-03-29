# PowerApp YAML Studio

PowerApp YAML Studio is a Vite React + TypeScript application with a backend API for generating Power Apps YAML that users can copy/paste into Power Apps Studio.

## What this project is for
- Generate YAML quickly through guided inputs instead of manual authoring.
- Respect the selected Power Apps version during generation.
- Apply a global theme profile so output is consistent.
- Ground backend documentation behavior with Microsoft Learn MCP.

## Repository structure
- `AGENTS.md` — contributor and Codex working rules for this repository.
- `docs/product/vision.md` — product goals, users, and MVP direction.
- `.agents/skills/powerapps-yaml/README.md` — YAML generation guidance.
- `.agents/skills/fluent-ui/README.md` — frontend/UX guidance for Fluent UI v9.
- `.agents/skills/microsoft-learn-mcp/README.md` — backend docs-grounding guidance.

## Development approach
- Start from `dev` and create small, testable, single-purpose branches.
- Keep changes tightly scoped; avoid unrelated edits.
- Prefer working implementations over placeholders when feasible.
- Include verification steps (tests/checks/manual validation) when relevant.
- Keep code readable and beginner-friendly.

> Note: This repository currently defines project guidance and planning artifacts; application code scaffolding is intentionally deferred.
