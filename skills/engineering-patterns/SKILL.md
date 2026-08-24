---
name: engineering-patterns
description: >-
  Apply Morgan's shared TypeScript, Effect, RPC, Next.js, Cloudflare, testing,
  naming, and code-shape conventions. Use when implementing or reviewing code
  in repositories whose guidance names $engineering-patterns, or when the user
  asks to follow, inspect, or update the shared engineering patterns.
---

# Engineering patterns

Use this skill as the shared baseline. Repository instructions and versioned
project-local patterns are the profile for that repository and override this
skill when they are more specific.

## Apply the guidance

1. Read the repository's `AGENTS.md` and any project-local pattern index it
   names before choosing a shared pattern.
2. Search [the pattern index](references/patterns/index.md) for task keywords.
   Read only the matching pattern files and any directly linked reference.
3. Apply the demonstrated invariant to the current code. The code in each
   pattern shows the preferred shape; `@bad` tags identify the rejected shapes.
4. Keep the change scoped. Do not mechanically rewrite code that is unrelated
   to the task merely because another pattern exists.

When no indexed pattern matches, follow the repository and user instructions;
do not infer a new universal rule from one example.

## Update the shared patterns

Read [the pattern conventions](references/patterns/README.md) before adding or
changing a shared pattern. Start from current `origin/main` in a clean branch or
isolated worktree of the source `morgs32/llm-wiki` repository. Update the skill
and its pattern index in the same pass, then validate the source skill.

When the user has authorized publication, commit the coherent change, push its
branch, open and merge a PR against `morgs32/llm-wiki:main`, and verify remote
`main`. Only after the merge, refresh the published global skill:

```bash
npx skills update engineering-patterns -g -y
```

Do not install from a local branch or unmerged PR. Never edit
`~/.agents/skills/engineering-patterns` or another installed copy directly;
installed copies are generated output.

Keep product- or repository-specific guidance in that repository's local
profile or pattern tree. Do not move local architecture, domain vocabulary, or
one-project case studies into this shared skill.
