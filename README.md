# llm-wiki

Shareable Codex skills for Morgan's repositories.

Shared code-shape guidance is packaged as
[`engineering-patterns`](./skills/engineering-patterns/SKILL.md), with its
self-contained references under
[`references/patterns`](./skills/engineering-patterns/references/patterns/index.md).
Install skills globally and keep only project-specific profiles, overrides, and
domain guidance in consuming repositories; do not vendor this repository for
the shared patterns.

## Install

From a clean checkout of current `main`, install or update the shared skill and
configure one or more consuming repositories:

```bash
node skills/engineering-patterns/scripts/configure.mjs /path/to/repository
```

The command uses the Skills CLI to install from published `morgs32/llm-wiki`
and owns only the marker-bounded `Shared engineering patterns` block in each
root `AGENTS.md`. It preserves all surrounding guidance, normalizes a lowercase
root `agents.md`, and never edits nested or vendored agent files. Pass multiple
repository paths to update them together, or use `--check` for a read-only
drift check.

The installed `~/.agents/skills/engineering-patterns` directory and managed
`AGENTS.md` block are generated output. Make skill changes in this repository,
never in the installed copy or between the managed markers.

## Publish and update shared guidance

Publish source changes before refreshing the global skill:

1. Start from current `origin/main` on a clean branch or isolated worktree.
2. Change `skills/engineering-patterns/`, update its pattern index when needed,
   and validate the skill.
3. Commit the coherent change, push the branch, and open a PR against
   `morgs32/llm-wiki:main`.
4. Merge the PR and verify the change is present on remote `main`.
5. Only then refresh the installed skill and managed repository guidance:

   ```bash
   node skills/engineering-patterns/scripts/configure.mjs /path/to/repository
   ```

Do not install from a local branch or unmerged PR. See
[`update-llm-wiki`](./skills/update-llm-wiki/SKILL.md#publish-shared-guidance)
for the full agent workflow and publication boundary.
