# AGENTS.md

## Project purpose
PowerApp YAML Studio helps users generate Power Apps YAML they can copy and paste into Power Apps Studio. The goal is to make YAML authoring faster, safer, and easier for builders who want guided output instead of writing YAML by hand.

## Technical context
- This repository is a **Vite React + TypeScript frontend** with a **backend API**.
- YAML generation must account for the user's selected **Power Apps version**.
- A global **theme profile** must influence generated output.
- Backend documentation grounding should use **Microsoft Learn MCP** whenever relevant.

## How to work in this repo
- Work in **small, scoped feature branches** created from `dev`.
- Keep each branch focused on one clear change that can be tested quickly.
- Do not modify unrelated files or refactor outside the agreed scope.
- Prefer complete, working implementations over placeholders when feasible.
- Include verification steps (tests/checks/manual validation) when relevant.

## Code quality and style
- Keep code beginner-friendly: readable names, simple structure, clear comments only where needed.
- Organize code for maintainability: small modules, clear boundaries, minimal complexity.
- Frontend work should use **Fluent UI v9** and feel polished, accessible, and responsive.
