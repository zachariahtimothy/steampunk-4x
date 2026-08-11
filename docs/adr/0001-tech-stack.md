# ADR 0001 — Tech stack (Sandbox v1)

**Status:** Accepted  
**Date:** 2026-08-11  
**Context:** First implementation stack for *Soot Empire* after design SPEC v1.0. Builder has not shipped a game before; pair-programming with AI is expected.

## Decision

| Layer | Choice |
|-------|--------|
| Delivery | **Browser-first**, local dev (`vite dev`). Static host later. Optional Electron/Tauri shell later. |
| Language | **TypeScript** |
| Bundler | **Vite** |
| Map / game view | **PixiJS** |
| Panels / chrome | **React** |
| Game rules | **Pure TS sim module** — authoritative; React/Pixi are view + input only |
| Authority | **Client-only** single-player (no game server in v1) |
| Art bar | **Prototype chic** (readable geometry, icons, light juice/SFX) — not production art packs |
| Saves | **None in sandbox v1**; sim state kept JSON-serializable for a thin follow-on |
| AI / Co-pilot | **Stubbed** in v1; no in-browser LLM in the core loop |
| Process | GitHub **milestone + thin issues** mapped to SPEC §13 / §16 — not a new wayfinder map |

## Explicit non-goals (stack)

- Apple Developer Program / App Store pipeline (local Mac `.app` sideload fine later without $99)
- In-browser weighty ML models as gameplay substrate
- Phaser as the whole application shell
- SolidJS / OctaneJS for v1 panels (revisit only after playable slice if desired)
- Backend authoritative sim for v1

## Consequences

- Hex map rendering and camera live in Pixi; logistics/invent/combat **panels** in React.
- Sim package must not import React or Pixi.
- Feature flags / content subsets preferred over forked rules (SPEC §13).
- Performance work targets Pixi scene + sim tick, not React VDOM micro-opts.

## References

- [docs/spec/SPEC.md](../spec/SPEC.md) §13 Vertical slice, §16 Implementer checklist  
- Stack grill session (Discord, 2026-08-11)
