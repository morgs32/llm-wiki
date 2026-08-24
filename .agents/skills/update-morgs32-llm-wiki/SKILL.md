---
name: update-morgs32-llm-wiki
description: >-
  Update shared patterns or skill source in morgs32/llm-wiki and publish the
  coherent change through a GitHub pull request. Use from this repository when
  the user asks to change or publish its patterns or skills. Do not use for a
  consuming repository's local {root}/llm-wiki/** guidance.
---

# Update morgs32/llm-wiki

Update the canonical `morgs32/llm-wiki` source and deliver a ready pull request.
Never commit directly to `main`.

## Scope

- Shared patterns live under `skills/patterns/references/patterns/**`.
- Installable shared skills live under `skills/**`.
- Workflows used only by this repository live under `.agents/skills/**`.
- Root routing or publication policy lives in `AGENTS.md` and `README.md`.

Do not edit installed `~/.agents/skills/**` copies, a consuming repository's
`{root}/llm-wiki/**` tree, or any vendor subtree. Preserve unrelated local WIP.

## Prepare the change

1. Read the current remote `main` SHA through the GitHub connector. If the
   normal checkout contains unrelated changes or unresolved state, prepare the
   requested patch in a clean isolated checkout of that exact SHA. Never stash,
   reset, discard, resolve, or commit unrelated work.
2. From that verified checkout, read root `AGENTS.md`, the affected skill
   entrypoint, and every directly linked instruction needed for the requested
   change. Dirty or unpublished guidance does not define the patch.
3. For a shared pattern change, read
   `skills/patterns/references/patterns/README.md` and search
   `skills/patterns/references/patterns/index.md` before editing. Ground the
   pattern in a real example when one exists, update the pattern index in the
   same pass, and keep repository-specific guidance out of the shared skill.
4. For a skill change, load `$skill-creator`, preserve supported metadata, and
   update direct routing references when a name, path, or responsibility moves.
5. For a skill rename, require explicit old and new names; do not infer either
   from dirty WIP. Search every tracked file at the verified base SHA, and retain
   the old name only in reviewed migration code, tests, or documentation.
   Inspect installers, lock metadata, managed markers, and generated-install
   behavior. Install and validate the new skill, migrate and validate every
   requested repository marker, and only then remove a same-source legacy
   installation. Preserve the legacy installation if any marker migration
   fails, and refuse to remove an installation owned by another source.
6. Make only the coherent requested pattern and skill changes. Keep pattern
   sources, skill entrypoints, metadata, scripts, tests, indexes, and direct
   documentation references consistent when the requested change affects them.

## Validate

1. Inspect the exact diff and run `git diff --check`.
2. Run the Codex skill validator on every added, renamed, or materially changed
   skill directory.
3. Check changed relative links and verify that removed names or paths have no
   stale callers beyond deliberate migration code, tests, or documentation.
4. Run targeted tests for every changed script. If no Nx target exists, invoke
   the script's native test runner directly.
5. Re-read remote `main`. If it moved during preparation, rebuild the patch on
   the new head and repeat validation.

## Publish through a pull request

Treat “via PR”, “open a PR”, or “publish” as authorization to create the topic
branch, publication commit, and pull request. It does not authorize merge.

1. Use `chatgpt-codex-connector` for every GitHub mutation. Do not use a
   personal-account Git push or `gh`.
2. Create a non-`main` `codex/<topic>` branch from the exact verified remote
   `main` SHA.
3. Stage the coherent patch in the isolated checkout and record its exact
   `git write-tree` SHA. Create the required blobs and tree from the verified
   base tree, then require the connector-created tree SHA to equal the recorded
   local tree SHA before creating one coherent conventional commit and
   fast-forwarding the topic ref without force.
4. Open a ready pull request against `morgs32/llm-wiki:main`. Include the
   behavioral split, migration details, and local validation in the body.
5. Verify the pull request head SHA and exact changed-file list. Wait for the
   `validate-skills` check and Codex review on that head; address in-scope
   findings with connector-authored commits and revalidate the latest head.
6. Stop with the pull request open unless the user separately authorizes merge
   or auto-merge. Follow root `AGENTS.md` for merge eligibility and gates; never
   bypass branch protection.

Report the pull request URL, branch and head SHA, exact source areas changed,
and validation results. Do not refresh installed skills or downstream guidance
from an unmerged pull request.
