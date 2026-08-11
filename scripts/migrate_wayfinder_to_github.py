#!/usr/bin/env python3
"""Migrate local wayfinder tickets to GitHub Issues."""
from __future__ import annotations

import json
import re
import subprocess
import time
from pathlib import Path

ROOT = Path("/home/ubuntu/steampunk-4x")
ISSUES_DIR = ROOT / ".scratch/wayfind-spec/issues"
REPO = "zachariahtimothy/steampunk-4x"


def run(args: list[str], input_text: str | None = None) -> str:
    r = subprocess.run(
        args,
        input=input_text,
        text=True,
        capture_output=True,
        cwd=str(ROOT),
        check=False,
    )
    if r.returncode != 0:
        raise RuntimeError(f"cmd failed {args}: {r.stderr or r.stdout}")
    return r.stdout.strip()


def gh_issue_create(title: str, body: str, labels: list[str]) -> int:
    args = ["gh", "issue", "create", "--repo", REPO, "--title", title, "--body", body]
    for lab in labels:
        args.extend(["--label", lab])
    out = run(args)
    # URL like https://github.com/o/r/issues/N
    num = int(out.rstrip("/").split("/")[-1])
    return num


def gh_issue_comment(num: int, body: str) -> None:
    run(["gh", "issue", "comment", str(num), "--repo", REPO, "--body", body])


def gh_issue_close(num: int, comment: str | None = None) -> None:
    args = ["gh", "issue", "close", str(num), "--repo", REPO]
    if comment:
        args.extend(["--comment", comment])
    run(args)


def gh_api(method: str, path: str, fields: dict | None = None) -> str:
    args = ["gh", "api", "--method", method, path]
    if fields:
        for k, v in fields.items():
            args.extend(["-f" if isinstance(v, str) else "-F", f"{k}={v}"])
    return run(args)


def parse_tickets():
    tickets = []
    for p in sorted(ISSUES_DIR.glob("*.md")):
        text = p.read_text()
        title = text.splitlines()[0].lstrip("# ").strip()
        m_type = re.search(r"^Type:\s*(\S+)", text, re.M)
        m_status = re.search(r"^Status:\s*(\S+)", text, re.M)
        m_blocked = re.search(r"^Blocked by:\s*(.*)$", text, re.M)
        blocked_raw = (m_blocked.group(1) if m_blocked else "").strip()
        blocked_local = [int(x) for x in re.findall(r"\d+", blocked_raw)]
        local_num = int(re.match(r"(\d+)", p.name).group(1))
        # Strip answer for body if present; keep question
        body = text
        tickets.append(
            {
                "local_num": local_num,
                "title": title,
                "type": (m_type.group(1) if m_type else "grilling"),
                "status": (m_status.group(1) if m_status else "open"),
                "blocked_local": blocked_local,
                "body": body,
                "file": p.name,
            }
        )
    return tickets


def issue_db_id(num: int) -> int:
    out = run(
        [
            "gh",
            "api",
            f"repos/{REPO}/issues/{num}",
            "--jq",
            ".id",
        ]
    )
    return int(out)


def try_add_subissue(parent_num: int, child_num: int) -> bool:
    """Best-effort GraphQL sub-issue link."""
    try:
        q = """
        query($o:String!,$r:String!,$n:Int!){
          repository(owner:$o,name:$r){
            issue(number:$n){ id }
          }
        }
        """
        parent = json.loads(
            run(
                [
                    "gh",
                    "api",
                    "graphql",
                    "-f",
                    f"query={q}",
                    "-F",
                    "o=zachariahtimothy",
                    "-F",
                    "r=steampunk-4x",
                    "-F",
                    f"n={parent_num}",
                ]
            )
        )["data"]["repository"]["issue"]["id"]
        child = json.loads(
            run(
                [
                    "gh",
                    "api",
                    "graphql",
                    "-f",
                    f"query={q}",
                    "-F",
                    "o=zachariahtimothy",
                    "-F",
                    "r=steampunk-4x",
                    "-F",
                    f"n={child_num}",
                ]
            )
        )["data"]["repository"]["issue"]["id"]
        mut = """
        mutation($parent:ID!,$child:ID!){
          addSubIssue(input:{issueId:$parent, subIssueId:$child}) {
            issue { number }
          }
        }
        """
        run(
            [
                "gh",
                "api",
                "graphql",
                "-f",
                f"query={mut}",
                "-f",
                f"parent={parent}",
                "-f",
                f"child={child}",
            ]
        )
        return True
    except Exception as e:
        print(f"sub-issue link failed #{parent_num}<-#{child_num}: {e}")
        return False


def try_blocked_by(child_num: int, blocker_num: int) -> bool:
    try:
        blocker_id = issue_db_id(blocker_num)
        run(
            [
                "gh",
                "api",
                "--method",
                "POST",
                f"repos/{REPO}/issues/{child_num}/dependencies/blocked_by",
                "-F",
                f"issue_id={blocker_id}",
            ]
        )
        return True
    except Exception as e:
        print(f"dependency failed #{child_num} blocked by #{blocker_num}: {e}")
        return False


def main():
    map_path = ROOT / ".scratch/wayfind-spec/map.md"
    map_body = map_path.read_text()
    map_body = map_body.replace(
        "**Tracker:** local markdown (see `docs/agents/issue-tracker.md`). GitHub later.",
        "**Tracker:** GitHub Issues (see `docs/agents/issue-tracker.md`). Local `.scratch/wayfind-spec/` is archive + research assets.",
    )
    # Decisions will be patched after numbers known — use asset paths on main
    map_body = re.sub(
        r"\(issues/02-comparable-games-research\.md\)",
        "(PLACEHOLDER_02)",
        map_body,
    )
    map_body = re.sub(
        r"\(issues/03-machinery-motif-research\.md\)",
        "(PLACEHOLDER_03)",
        map_body,
    )
    map_body = map_body.replace(
        "(assets/02-comparable-games.md)",
        "(https://github.com/zachariahtimothy/steampunk-4x/blob/main/.scratch/wayfind-spec/assets/02-comparable-games.md)",
    )
    map_body = map_body.replace(
        "(assets/03-machinery-motifs.md)",
        "(https://github.com/zachariahtimothy/steampunk-4x/blob/main/.scratch/wayfind-spec/assets/03-machinery-motifs.md)",
    )

    print("Creating map issue...")
    map_num = gh_issue_create(
        "Wayfinder map: Steampunk industrial 4X spec",
        map_body + "\n\n## Tickets\n\n_Populated after child creation._\n",
        ["wayfinder:map"],
    )
    print("map", map_num)

    tickets = parse_tickets()
    local_to_gh: dict[int, int] = {}

    for t in tickets:
        label = f"wayfinder:{t['type']}"
        body = f"Part of #{map_num}\n\nLocal archive: `.scratch/wayfind-spec/issues/{t['file']}`\n\n{t['body']}"
        # Fix asset relative links to github blob
        body = body.replace(
            "](../assets/",
            "](https://github.com/zachariahtimothy/steampunk-4x/blob/main/.scratch/wayfind-spec/assets/",
        )
        print("Creating", t["title"])
        num = gh_issue_create(t["title"], body, [label])
        local_to_gh[t["local_num"]] = num
        print(" ->", num)
        time.sleep(0.3)

    # Sub-issues + blocked by + body blocked line update
    task_lines = []
    for t in tickets:
        gh_n = local_to_gh[t["local_num"]]
        try_add_subissue(map_num, gh_n)
        blocker_ghs = []
        for b in t["blocked_local"]:
            if b in local_to_gh:
                bn = local_to_gh[b]
                blocker_ghs.append(bn)
                try_blocked_by(gh_n, bn)
        if blocker_ghs:
            bl = ", ".join(f"#{x}" for x in blocker_ghs)
            # prepend comment with blocking for visibility
            gh_issue_comment(gh_n, f"**Blocked by:** {bl}")
        mark = "x" if t["status"] == "resolved" else " "
        task_lines.append(f"- [{mark}] #{gh_n} {t['title']}")

    # Close resolved with answer already in body
    for t in tickets:
        if t["status"] != "resolved":
            continue
        gh_n = local_to_gh[t["local_num"]]
        print("Closing resolved", gh_n)
        gh_issue_close(gh_n, "Migrated from local wayfinder archive as already resolved.")

    # Update map with ticket list and correct decision links
    dec_02 = local_to_gh.get(2)
    dec_03 = local_to_gh.get(3)
    new_map = map_body
    if dec_02:
        new_map = new_map.replace("PLACEHOLDER_02", f"#{dec_02}")
    if dec_03:
        new_map = new_map.replace("PLACEHOLDER_03", f"#{dec_03}")
    # rewrite decisions lines more cleanly
    if dec_02 and dec_03:
        new_map = re.sub(
            r"## Decisions so far\n\n.*?## Not yet specified",
            f"## Decisions so far\n\n"
            f"- #{dec_02} Comparable games research — Anno-shallow chains, dual-use logistics, Old World Composition, on-rails machines, Civ eras + logistics gates; avoid battle layers/Factorio/traction-default. "
            f"[asset](https://github.com/zachariahtimothy/steampunk-4x/blob/main/.scratch/wayfind-spec/assets/02-comparable-games.md)\n"
            f"- #{dec_03} Machinery motif research — rare mobile industry, landships/trains/crawlers; avoid ME Municipal Darwinism and WWW tarantula-tank package. "
            f"[asset](https://github.com/zachariahtimothy/steampunk-4x/blob/main/.scratch/wayfind-spec/assets/03-machinery-motifs.md)\n\n"
            f"## Not yet specified",
            new_map,
            count=1,
            flags=re.S,
        )
    tickets_section = "## Tickets\n\n" + "\n".join(task_lines) + "\n"
    if "## Tickets" in new_map:
        new_map = re.sub(r"## Tickets\n\n.*", tickets_section, new_map, flags=re.S)
    else:
        new_map = new_map.rstrip() + "\n\n" + tickets_section

    # Use gh issue edit --body-file
    body_file = Path("/tmp/map_issue_body.md")
    body_file.write_text(new_map)
    run(["gh", "issue", "edit", str(map_num), "--repo", REPO, "--body-file", str(body_file)])

    mapping = {"map": map_num, "local_to_gh": local_to_gh}
    Path("/tmp/wayfinder_gh_mapping.json").write_text(json.dumps(mapping, indent=2))
    print(json.dumps(mapping, indent=2))


if __name__ == "__main__":
    main()
