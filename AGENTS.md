# AGENTS

## Agent skills

### Issue tracker

GitHub Issues. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context. See `docs/agents/domain.md`.

## Project

Hobby single-player steampunk industrial 4X (*Soot Empire*).

- **Spec (done):** `docs/spec/SPEC.md`
- **Stack lock:** `docs/adr/0001-tech-stack.md`
- **Closed design map:** https://github.com/zachariahtimothy/steampunk-4x/issues/1
- **Active build:** milestone [Sandbox v1](https://github.com/zachariahtimothy/steampunk-4x/milestone/1)
- **App:** Vite + React + TS + Pixi; pure sim in `src/sim/`

## Git workflow

**Never commit straight to `main`.**

1. Branch from latest `main` (`feature/…`, `fix/…`, or `docs/…`).
2. Commit on the branch.
3. Open a **pull request** into `main` (`gh pr create`).
4. Merge via PR (squash OK unless noted otherwise).
5. Link the PR to the milestone issue with `Closes #N` / `Refs #N` when applicable.

Direct pushes to `main` are only for emergency hotfixes Zach explicitly requests.

## Run

```bash
npm install
npm run dev
```
