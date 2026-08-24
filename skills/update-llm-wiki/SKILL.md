---
name: update-llm-wiki
description: >-
  Codify an agreed convention or reusable repository-specific lesson in the
  active project's {root}/llm-wiki/** guidance. Use after a code change, when
  the user names a local pattern, or with no prompt to preserve conclusions
  from the current chat. Do not use for shared skills or morgs32/llm-wiki.
---

# update-llm-wiki

Update only the active project's local `{root}/llm-wiki/**` tree. You may read
the rest of the repository to ground the guidance, but do not write to root
`AGENTS.md`, `skills/**`, `.agents/**`, `vendor/**`, installed skills, another
checkout, or remote state.

If the active repository has no `{root}/llm-wiki/` directory, stop and report
that there is no local llm-wiki profile to update.

## When to use

- The user asks to record a repository-specific pattern, idiom, best practice,
  or case study in the active project.
- A code change establishes a local convention that should outlive the session.
- A `/cleanup` pass surfaces a repeatable local smell worth a case page.
- The skill is invoked without an additional prompt; review the current chat as
  described below.

Skip the update when the user wants code only or the local guidance already
states the same rule clearly.

## When run without a prompt

1. Review the current chat for agreed or demonstrated repository-specific
   patterns, idioms, syntax, and stylistic preferences.
2. Keep only conclusions that were explicitly requested, agreed, or shown in
   code. Do not codify unresolved debate or speculative suggestions.
3. Search `{root}/llm-wiki/patterns/index.md` and the matching local pattern
   files. Skip lessons already stated clearly.
4. If nothing remains, say so briefly and do not invent a pattern.

## Instructions

1. **Extract the lesson**
   State in one sentence what someone should do or avoid in a concrete local
   situation.

2. **Find a useful repository example**
   Search the active worktree before inventing a mock. Prefer the file or symbol
   the user named or just changed. Generalize names while preserving the code
   shape that demonstrated the lesson.

3. **Choose the local destination**
   Search `{root}/llm-wiki/patterns/index.md` first.

   - Put reusable mock patterns in the matching
     `{root}/llm-wiki/patterns/<topic>/` directory.
   - Put concrete before/after session evidence in
     `{root}/llm-wiki/patterns/cases/`.
   - Extend an existing local page when it already owns the topic.

4. **Write the smallest useful pattern**
   Prefer a focused mock `.ts` file when code demonstrates the rule best:

   - The code body shows only the preferred shape.
   - A leading JSDoc sentence states the rule.
   - Each `@bad` JSDoc tag names one rejected shape.
   - Case pages may cite active-repository `path:start-end` evidence.

5. **Map the current change accurately**
   When the user explicitly requested a fix, use the prior state as the `@bad`
   example and the requested result as the preferred code body.

6. **Update the local index**
   Add or revise the matching row in
   `{root}/llm-wiki/patterns/index.md` so keyword routing finds the pattern.

7. **Keep scope tight**
   Write one pattern per lesson and touch only files under
   `{root}/llm-wiki/**`. Report any desirable change outside that boundary
   instead of making it.

Use imperative, specific, scannable prose. Prefer “Do X” and “Do not Y” over
narrative advice.
