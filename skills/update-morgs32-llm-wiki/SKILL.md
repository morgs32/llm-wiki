---
name: update-morgs32-llm-wiki
description: >-
  Update shared patterns or skill source in morgs32/llm-wiki on main. Use from
  this repository when the user asks to change or publish its patterns or
  skills. Do not use for a consuming repository's local {root}/llm-wiki/**
  guidance.
---

# Update morgs32/llm-wiki

Update the canonical `morgs32/llm-wiki` source in this checkout. Work on
`main` is allowed: edit, commit, and push here when asked. A pull request is
optional, not required to land the change.

## Scope

- Shared patterns live under `skills/patterns/references/patterns/**`.
- Installable shared skills live under `skills/**` (global via the
  `~/.agents/skills` symlink into this checkout).
- This publication workflow lives under `skills/update-morgs32-llm-wiki/`.
- Root routing or publication policy lives in `AGENTS.md` and `README.md`.

Edit installable skills in this checkout's `skills/**` (that is the live global
install). Do not edit a consuming repository's `{root}/llm-wiki/**` tree or any
vendor subtree. Preserve unrelated local WIP.

## Prepare the change

1. Work on `main` in this checkout. `git pull` first if remote `main` has
   moved. Never stash, reset, discard, or commit unrelated work; leave it in
   place and make the requested change beside it.
2. Read root `AGENTS.md`, the affected skill entrypoint, and every directly
   linked instruction needed for the requested change.
3. For a shared pattern change, read
   `skills/patterns/references/patterns/README.md` and search
   `skills/patterns/references/patterns/index.md` before editing. Ground the
   pattern in a real example when one exists, update the pattern index in the
   same pass, and keep repository-specific guidance out of the shared skill.
4. For a skill change, load `$skill-creator`, preserve supported metadata, and
   update direct routing references when a name, path, or responsibility moves.
5. For a skill rename, require explicit old and new names; do not infer either
   from dirty WIP. Search every tracked file, and retain the old name only in
   reviewed migration code, tests, or documentation. Inspect installers, lock
   metadata, managed markers, and generated-install behavior. Install and
   validate the new skill, migrate and validate every requested repository
   marker, and only then remove a same-source legacy installation. Preserve the
   legacy installation if any marker migration fails, and refuse to remove an
   installation owned by another source.
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
5. `git pull` again if remote `main` moved during preparation, then repeat
   validation.

## Publish

Work on `main` is allowed. Commit in this checkout. Push to `origin/main` when
the user asks to push, publish, or land the change.

Treat “via PR”, “open a PR”, or “publish as a PR” as authorization to open a
pull request. It does not authorize merge. A PR is optional.

1. For a PR, create a non-`main` `<type>/<kebab-topic>` branch. Use a
   Conventional Commit type prefix (`feat`, `fix`, `docs`, `refactor`, `perf`,
   `test`, `build`, `ci`, `chore`, `revert`) and a short kebab-case slug.
   Prefer the prefix that matches the publication commit's conventional type —
   for example `docs(patterns): …` on branch
   `docs/inline-one-call-simple-helpers`. Do not use `codex/` prefixes.
2. Open a ready pull request against `morgs32/llm-wiki:main`. Include the
   behavioral split, migration details, and local validation in the body.
3. Verify the pull request head SHA and exact changed-file list. Wait for the
   `validate-skills` check and Codex review on that head; address in-scope
   findings and revalidate the latest head.
4. Stop with the pull request open unless the user separately authorizes merge
   or auto-merge. Follow root `AGENTS.md` for merge eligibility and gates; never
   bypass branch protection.

Report what landed: commit SHA on `main`, or the pull request URL plus head
SHA, plus the exact source areas changed and validation results. Do not
refresh downstream consuming-repo guidance from an unmerged pull request.
