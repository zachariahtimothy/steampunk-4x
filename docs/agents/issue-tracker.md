# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature/effort per directory: `.scratch/<feature-slug>/`
- The spec (when produced) is `.scratch/<feature-slug>/spec.md` or repo-root `SPEC.md` when wayfinding completes
- Implementation / wayfinder issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file
- Comments and conversation history append under a `## Comments` heading

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` — Destination / Notes / Decisions-so-far / Not yet specified / Out of scope
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body
- **Type:** `research` / `prototype` / `grilling` / `task`
- **Status:** open statuses use `open` or `claimed`; done uses `resolved`
- **Blocking:** a `Blocked by: NN, NN` line near the top (numbers only). A ticket is unblocked when every listed file is `resolved`
- **Frontier:** open/unclaimed/unblocked issues; lowest number first
- **Claim:** set `Status: claimed` before work
- **Resolve:** append `## Answer`, set `Status: resolved`, append a gist + link line to the map's Decisions so far
