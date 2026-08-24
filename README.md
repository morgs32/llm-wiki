# llm-wiki

Shareable Codex skills for Morgan's repositories.

Shared code-shape guidance is packaged as
[`patterns`](./skills/patterns/SKILL.md), with its
self-contained references under
[`references/patterns`](./skills/patterns/references/patterns/index.md).
Install skills globally and keep only project-specific profiles, overrides, and
domain guidance in consuming repositories; do not vendor this repository for
the shared patterns.

## Install

From a clean checkout of current `main`, install or update the shared skill and
configure one or more consuming repositories:

```bash
node skills/patterns/scripts/configure.mjs /path/to/repository
```

The command uses the Skills CLI to install from published `morgs32/llm-wiki`
and owns only the marker-bounded `Shared patterns` block in each
root `AGENTS.md`. It preserves all surrounding guidance, normalizes a lowercase
root `agents.md`, and never edits nested or vendored agent files. Pass multiple
repository paths to update them together, or use `--check` for a read-only
drift check. It validates the new `$patterns` installation, migrates every
requested managed block, and only then removes the legacy
`$engineering-patterns` installation.

The installed `~/.agents/skills/patterns` directory and managed
`AGENTS.md` block are generated output. Make skill changes in this repository,
never in the installed copy or between the managed markers.

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
5. Only then refresh the installed skill and managed repository guidance:

   ```bash
   node skills/patterns/scripts/configure.mjs /path/to/repository
   ```

Do not install from a local branch or unmerged PR. The repo-local updater owns
the full publication and merge-authorization boundary; `update-llm-wiki`
updates only a consuming repository's `{root}/llm-wiki/**` guidance.
