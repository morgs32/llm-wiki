# llm-wiki

Shareable Codex skills for Morgan's repositories.

Shared code-shape guidance is packaged as
[`patterns`](./skills/patterns/SKILL.md), with its
self-contained references under
[`references/patterns`](./skills/patterns/references/patterns/index.md).
Keep only project-specific profiles, overrides, and domain guidance in
consuming repositories; do not vendor this repository for the shared
patterns.

## Install

`~/.agents/skills` is a live symlink to this repository's [`skills/`](./skills/)
directory. Edit skills here; that checkout **is** the global install. Do not
treat `~/.agents/skills/**` as a separate generated copy.

Configure one or more consuming repositories' managed `AGENTS.md` blocks:

```bash
node skills/patterns/scripts/configure.mjs /path/to/repository
```

When `~/.agents/skills` already symlinks into this checkout, the command skips
Skills CLI global install/update and only owns the marker-bounded
`Shared patterns` block in each root `AGENTS.md`. It preserves surrounding
guidance, normalizes a lowercase root `agents.md`, and never edits nested or
vendored agent files. Pass multiple repository paths to update them together,
or use `--check` for a read-only drift check.

## Publish and update shared guidance

Use the repo-local
[`update-morgs32-llm-wiki`](./.agents/skills/update-morgs32-llm-wiki/SKILL.md)
workflow to publish pattern or skill source changes:

1. Start from current `origin/main` on a clean branch or isolated worktree.
2. Change `skills/patterns/`, update its pattern index when needed,
   and validate the skill.
3. Publish the coherent change through a connector-authored topic branch and
   pull request against `morgs32/llm-wiki:main`.
4. When separately authorized, merge the PR and verify the change is present on
   remote `main`.
5. Only then refresh managed repository guidance:

   ```bash
   node skills/patterns/scripts/configure.mjs /path/to/repository
   ```

Do not install from a local branch or unmerged PR. The repo-local updater owns
the full publication and merge-authorization boundary; `update-llm-wiki`
updates only a consuming repository's `{root}/llm-wiki/**` guidance.
