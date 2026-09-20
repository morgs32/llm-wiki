---
name: handoff
description: >-
  Compact the current conversation into a numbered handoff document under
  wiki/dev/handoffs for another agent to pick up. Use when the user says
  /handoff, wants a session handoff, or asks to write a pickup doc for a
  fresh agent.
---

# Handoff

Write a handoff document summarising the current conversation so a fresh agent
can continue the work. Save it in the active project, not the OS temp
directory.

## Destination

1. Write under `wiki/dev/handoffs/` in the active workspace. Create that
   directory if it does not exist.
2. Determine the new file's three-digit `XXX` prefix before writing:

   1. Inspect filenames recursively under `wiki/dev/` for names beginning with
      three digits, the same way `$spec` allocates prefixes under `PLAN_ROOT`.
   2. Use one more than the highest prefix found anywhere under `wiki/dev/`.
   3. Ignore legacy filenames without a three-digit prefix when calculating
      the next number.

3. Write **one** handoff file:

```text
wiki/dev/handoffs/XXX-handoff-<topic>.md
```

Use the allocated zero-padded prefix and a kebab-case topic. If the user
passed arguments, treat them as the next session's focus and use them for the
topic and the body.

## Contents

1. Include a **Suggested skills** section naming which skills the next agent
   should invoke.
2. Do not duplicate content already captured in other artifacts (specs, plans,
   ADRs, issues, commits, diffs). Reference them by path or URL instead.
3. Redact secrets: API keys, passwords, and personally identifiable
   information.

```markdown
# Handoff: <topic>

**Date:** YYYY-MM-DD
**Focus:** <next session focus>

## Goal

What the next agent should finish.

## Done

What already landed, with paths or SHAs.

## Remaining

Numbered work still open.

## Suggested skills

1. `$skill-name` — why the next agent should load it

## Pointers

1. Specs, plans, ADRs, issues, commits, diffs — path or URL only

## Open decisions

Decisions the next agent must not invent.
```

## Source

Copied from [mattpocock/skills `handoff`](https://github.com/mattpocock/skills/blob/c55ee46073ed923f86ce59a5eb3b6d895095d1b7/skills/productivity/handoff/SKILL.md) (`c55ee46073ed923f86ce59a5eb3b6d895095d1b7`), MIT License, Copyright (c) 2026 Matt Pocock.
