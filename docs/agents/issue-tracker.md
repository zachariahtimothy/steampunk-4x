# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

Repo: `zachariahtimothy/steampunk-4x` (inferred from `git remote`).

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`
- **Read an issue**: `gh issue view <number> --comments`
- **List issues**: `gh issue list --state open --json number,title,body,labels,assignees`
- **Comment**: `gh issue comment <number> --body "..."`
- **Labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: one issue labelled `wayfinder:map` (Notes / Decisions-so-far / Fog body).
- **Child ticket**: sub-issue of the map when available; else task-list link on the map + `Part of #<map>` in the child body. Labels: `wayfinder:research` | `wayfinder:prototype` | `wayfinder:grilling` | `wayfinder:task`.
- **Blocking**: native issue dependencies when available (`issue_dependencies_summary`); fallback `Blocked by: #n, #n` in the child body. Unblocked when every blocker is closed.
- **Frontier**: open children of the map with no open blockers and no assignee; lowest number / map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me` before work.
- **Resolve**: comment the answer, close the issue, append gist + link to the map's Decisions so far.

## Local archive

Charting originally lived under `.scratch/wayfind-spec/`. That tree remains as a historical archive and research assets store; **live wayfinding state is GitHub Issues**.
