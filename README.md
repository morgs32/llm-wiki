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

Install the shared engineering guidance globally with the Skills CLI:

```bash
npx skills add morgs32/llm-wiki --skill engineering-patterns -g -a codex -y
```

The installed `~/.agents/skills/engineering-patterns` directory is generated
output. Make changes in this repository, never in the installed copy.

## Publish and update shared guidance

Publish source changes before refreshing the global skill:

1. Start from current `origin/main` on a clean branch or isolated worktree.
2. Change `skills/engineering-patterns/`, update its pattern index when needed,
   and validate the skill.
3. Commit the coherent change, push the branch, and open a PR against
   `morgs32/llm-wiki:main`.
4. Merge the PR and verify the change is present on remote `main`.
5. Only then refresh the installed skill:

   ```bash
   npx skills update engineering-patterns -g -y
   ```

Do not install from a local branch or unmerged PR. See
[`update-llm-wiki`](./skills/update-llm-wiki/SKILL.md#publish-shared-guidance)
for the full agent workflow and publication boundary.
