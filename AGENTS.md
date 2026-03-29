# AGENTS.md

## Project purpose
PowerApp YAML Studio helps users generate Power Apps YAML they can copy and paste into Power Apps Studio. The goal is to make YAML authoring faster, safer, and easier for builders who want guided output instead of writing YAML by hand.

## Repository structure
- `apps/web` is the frontend (**Vite React + TypeScript**).
- `apps/api` is the backend API.
- `packages/shared` contains shared types and utilities.
- `docs` contains product and prompt documentation.
- `.agents/skills` contains reusable Codex guidance.

## Technical context
- This repository is a **Vite React + TypeScript frontend** with a **backend API**.
- YAML generation must account for the user's selected **Power Apps version**.
- A global **theme profile** must influence generated output.
- Backend documentation grounding should use **Microsoft Learn MCP** whenever relevant.

## YAML generation rules
- Always generate YAML that can be copied into Power Apps Studio.
- Do not invent unsupported or unknown properties.
- Respect the selected Power Apps version.
- Apply the theme profile consistently.
- Prefer simple, readable structures over complex ones.
- If compatibility is uncertain, include a warning.
- Return YAML as the primary output with no surrounding explanation when generating final results.
- Ensure indentation and formatting are preserved for direct copy and paste.
- If additional notes are needed, place them after the YAML in a clearly separated section.

## Backend expectations
- Microsoft Learn MCP is used for documentation grounding.
- Documentation should be normalized before being passed to the model.
- Avoid sending large or noisy context blocks to the model.
- Generation should be structured and deterministic where possible.

## Frontend expectations
- Use Fluent UI v9 components.
- Avoid generic dashboard layouts.
- Build a polished, modern, responsive interface.
- Ensure the app works well on mobile and desktop.
- Prioritize usability and clarity for non-expert users.

## How to work in this repo
- Work in **small, scoped feature branches** created from `dev`.
- Keep each branch focused on one clear change that can be tested quickly.
- Do not modify unrelated files or refactor outside the agreed scope.
- Prefer complete, working implementations over placeholders when feasible.
- Include verification steps (tests/checks/manual validation) when relevant.

## Scope control
- Do not overbuild or introduce unnecessary abstractions.
- Do not add features that were not requested in the current task.
- Keep changes limited to the current branch goal.
- Avoid modifying unrelated files.

## Code quality and style
- Keep code beginner-friendly: readable names, simple structure, clear comments only where needed.
- Organize code for maintainability: small modules, clear boundaries, minimal complexity.
- Frontend work should use **Fluent UI v9** and feel polished, accessible, and responsive.

## Verification
- Code should build successfully.
- TypeScript should typecheck.
- UI changes should render correctly.
- Backend responses should match expected formats.
- YAML output should be valid and copyable.
