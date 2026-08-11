# Soot Empire

Hobby **single-player** turn-based industrial 4X.

**Pitch:** A turn-based 4X where logistics is power: extract, haul, refine, and field steampunk machines while rare cities learn to walk.

## Start here

| Doc | Role |
|------|------|
| **[docs/spec/SPEC.md](docs/spec/SPEC.md)** | Product / game design spec |
| [docs/adr/0001-tech-stack.md](docs/adr/0001-tech-stack.md) | Implementation stack lock |
| [CONTEXT.md](CONTEXT.md) | Ubiquitous language |
| [Sandbox v1 milestone](https://github.com/zachariahtimothy/steampunk-4x/milestone/1) | Build checklist |
| [Wayfinder map #1](https://github.com/zachariahtimothy/steampunk-4x/issues/1) | Closed design decision index |

## Stack (Sandbox v1)

- **Browser** client (Vite + TypeScript)
- **PixiJS** strategy map
- **React** panels / chrome
- **Pure TS sim** under `src/sim` (no React/Pixi imports)

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://127.0.0.1:5173`).

```bash
npm run build      # production bundle
npm run typecheck  # tsc only
```

## Vertical slice

Prove **logistics loop + invent/field a Mark** in a sandbox (~30–90 min), then Compact map. Details in SPEC §13.

## Layout

```text
src/sim/           authoritative game rules + state
src/view/pixi/     map renderer
src/App.tsx        React chrome
docs/spec/         design SPEC
docs/adr/          architecture decisions
```

## Git workflow

PRs only — no direct commits to `main`. See `AGENTS.md`.

