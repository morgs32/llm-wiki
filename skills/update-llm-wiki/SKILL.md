---
name: update-llm-wiki
description: >-
  After a code change, when the user names a pattern, or when invoked with no
  prompt (review the current chat for pattern conclusions), find a useful repo
  example and codify it in the shared $engineering-patterns source or the
  repository's local llm-wiki/patterns profile with @bad JSDoc tags.
---

# update-llm-wiki

Use this skill **together with** the change you are making (or right after it).
The goal is durable shared or repository-local guidance grounded in real code
shape from this repo.

## When to use

- The user invoked the skill **without a prompt** — review the current chat for pattern conclusions (see [When run without a prompt](#when-run-without-a-prompt)).
- The user asked you to record how to handle this kind of change, pattern, idiom, syntax, or best practice in the docs.
- You fixed a bug or anti-pattern and want to **preempt** the same mistake.
- The change encodes a convention that is not already obvious from existing patterns.
- A `/cleanup` **Pass** surfaced a repeatable smell worth a [case page](../../../llm-wiki/patterns/cases/index.md).

Skip it when the user only wants code with no doc update, or when the pattern subtrees already state the same rule clearly.

## When run without a prompt

If the user invokes this skill with **no additional prompt** (e.g. `/update-llm-wiki` alone):

1. **Review the current chat** for discussion, decisions, or conclusions about patterns, idioms, syntax, or stylistic preferences that should outlive the session.
2. **Extract codifiable lessons** — only what was actually agreed, demonstrated in code, or explicitly requested; not speculative suggestions or unresolved debate.
3. **Check existing patterns** in `$engineering-patterns` and
   `llm-wiki/patterns/` — skip anything already stated clearly.
4. For each remaining lesson, follow **Instructions** below (one pattern file per lesson).
5. If the chat has nothing worth codifying, say so briefly; do not invent patterns.

## Instructions

1. **Extract the lesson**  
   In one sentence: what should someone do (or avoid) next time? Tie it to a concrete situation (e.g. Drizzle adapters, Effect error handling, test DB setup), not generic advice.

2. **Find a useful code example in the repo**  
   Before writing a mock pattern from scratch, search the worktree for a **real example** that already demonstrates the preferred shape — or the anti-pattern the user just removed.
   - Prefer the file/symbol the user named or you just edited.
   - Use `rg`, semantic search, or case-study cross-links to find a second corroborating example when the fix is narrow.
   - Generalize names and strip repo-specific paths from the pattern file; keep the **structure** faithful to the example you found.
   - If no good example exists yet, write a minimal mock that still shows only the preferred approach.

3. **Pick the right pattern home**
   Search `$engineering-patterns` `references/patterns/index.md` and
   [`llm-wiki/patterns/`](../../../llm-wiki/patterns/index.md) for an existing
   pattern on the topic. Prefer **adding a new mock `.ts` file** in the matching
   topic folder over inventing prose docs.
   For **concrete session evidence**, add or extend a page under [`llm-wiki/patterns/cases/`](../../../llm-wiki/patterns/cases/index.md).
   For routing, use **repository root `AGENTS.md`** [Docs lookup](#docs-lookup).
   Map topics: repo-agnostic conventions → `$engineering-patterns`
   `references/patterns/{functions,naming,runtime,tooling,...}`; Effect/RPC →
   its `effect/` or `rpc/`; repository domain guidance →
   `llm-wiki/patterns/{system-worker,contracts,typescript,error,...}`.
   **Package-specific lessons** belong in first-party `llm-wiki/`, not the
   shared skill.
   Update **Docs lookup** in `AGENTS.md` when adding patterns that need keyword routing.

4. **Keep `AGENTS.md` indexes in sync**  
   When you add or materially change patterns, update **repository root `AGENTS.md`** in the same pass: add or adjust a row in the **Docs lookup** table (`#docs-lookup`) with Doc path, section link, and keywords.

5. **Write mock TypeScript patterns from the example**  
   This is the highest-value part. For shared guidance, read
   `$engineering-patterns` `references/patterns/README.md`.
   - **Code**: distilled from the repo example; shows only the preferred approach.
   - **Leading JSDoc**: one short sentence stating the rule.
   - **`@bad` JSDoc tags**: one anti-pattern per tag — the thing that caused confusion, bugs, or review churn (often the **before** state from the example you found).
   - No repo-specific file paths in shared `llm-wiki` patterns; case pages may cite `path:start-end` when session evidence helps.

6. **Map examples to the current task**  
   If the user gave **explicit** instructions for the fix:
   - Treat the **state before** the requested change as **`@bad`** annotations.
   - Treat the **requested remedy** (or the good example you found after the fix) as the code body.

7. **Update pattern indexes**
   Add or extend the row in the matching `$engineering-patterns`
   `references/patterns/index.md` or
   [`llm-wiki/patterns/index.md`](../../../llm-wiki/patterns/index.md) so
   keyword routing finds the new file. For shared guidance, follow
   [Publish shared guidance](#publish-shared-guidance); do not edit an installed
   copy of `$engineering-patterns`.

8. **Keep scope tight**  
   One pattern file per lesson. No unrelated edits elsewhere in the pattern
   source or local profile.

9. **Match repo doc tone**  
   Imperative, specific, and scannable. Prefer “Do X / Don’t Y” in `@bad` tags over narrative.

## Publish shared guidance

Use this workflow only for repo-agnostic guidance under
`skills/engineering-patterns/`. Repository-specific guidance remains a normal
change in the current repository's `llm-wiki/patterns/` profile.

1. Treat `morgs32/llm-wiki` `main` as the source of truth. Never edit
   `~/.agents/skills/engineering-patterns` or another installed agent copy;
   those files are generated installation output.
2. Read the current `main` SHA through `chatgpt-codex-connector`. If the normal
   source checkout contains unrelated WIP, preserve it and prepare the change
   in an isolated checkout of that exact SHA. A detached local checkout is fine
   for preparation because it must not be used to publish.

3. Make the source and index changes under `skills/engineering-patterns/`, then
   validate that skill with the Codex skill validator and check its relative
   links.
4. When the user has authorized publication, re-read remote `main`. If its SHA
   changed while preparing the patch, rebuild and revalidate the change from
   the new head. Then use `chatgpt-codex-connector` to create a non-`main` topic
   branch from that exact SHA, create only the coherent shared-guidance commit
   on that branch, and open a ready PR against `morgs32/llm-wiki:main`. Do not
   publish with a personal-account Git push or `gh`.
5. Wait for the required `validate-skills` check and a Codex review on the
   latest PR head. Automatic review is preferred; request `@codex review`
   through the connector when bootstrapping or re-reviewing. Resolve findings
   with connector-authored commits. If the user authorized merge or auto-merge,
   follow the repository root `AGENTS.md` auto-merge policy and enable
   auto-merge through the connector; never merge directly or use an admin
   bypass. Distinguish an armed PR from a merged PR, and verify remote `main`
   contains the change before installing it. Do not install from a local branch
   or an unmerged PR.
6. Refresh the published global skill and managed root guidance from the source
   checkout. This wrapper uses the Skills CLI to install or update the published
   skill. Pass every affected repository path in the same invocation:

   ```bash
   node skills/engineering-patterns/scripts/configure.mjs /path/to/repository
   ```

   The command chooses add versus update through the Skills CLI, validates the
   installed source and lock metadata, and changes only its marker-bounded block
   in each root `AGENTS.md`.

7. Run the read-only check across the same repositories:

   ```bash
   node skills/engineering-patterns/scripts/configure.mjs --check /path/to/repository
   ```

   Require a clean result before reporting publication complete.

If the user authorized only a draft or local source edit, stop before pushing
and report that PR publication and global installation remain pending.
