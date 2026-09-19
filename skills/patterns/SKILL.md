---
name: patterns
description: >-
  Apply Morgan's shared TypeScript, Effect, RPC, runtime architecture, testing,
  naming, and code-shape conventions, including YAGNI and coordination-cost
  checks. Use when implementing or reviewing code in repositories whose
  guidance names $patterns, or when the user asks to follow or inspect the
  shared patterns.
---

# Patterns

Use this skill as the shared baseline. Repository instructions and versioned
project-local patterns are the profile for that repository and override this
skill when they are more specific.

## Apply the guidance

1. Read the repository's `AGENTS.md` and any project-local pattern index it
   names before choosing a shared pattern.
2. Search [the pattern index](references/patterns/index.md) for task keywords.
   Read only the matching pattern files and any directly linked reference.
   When either the task or the change being implemented or reviewed proposes a
   new capability, guarantee, abstraction, compatibility path, or cross-owner
   coordination mechanism, read the indexed YAGNI and coordination-cost
   pattern before implementation or review.
3. Apply the demonstrated invariant to the current code. The code in each
   pattern shows the preferred shape; `@bad` tags identify rejected shapes.
4. Keep the change scoped. Do not mechanically rewrite unrelated code merely
   because another pattern exists.

When no indexed pattern matches, follow the repository and user instructions;
do not infer a universal rule from one example.

## Source boundary

This skill applies guidance from the live `morgs32/llm-wiki` checkout. To change
shared patterns or any installable skill, edit that repository's `skills/**`
tree (global via the `~/.agents/skills` symlink) and use the repo-local
`$update-morgs32-llm-wiki` workflow to publish.

`~/.agents/skills` is a symlink into this repository's `skills/` directory. Edit
skills in the checkout; do not maintain a second global copy.
