---
name: handoff
description: >-
  Compact the current conversation into a numbered handoff document under
  the active project's planning tree for another agent to pick up. Use when the user says
  /handoff, wants a session handoff, or asks to write a pickup doc for a
  fresh agent.
---

# Handoff

Write a handoff document summarising the current conversation so a fresh agent
can continue the work. Save it in the active project, not the OS temp
directory.

## Destination and lifecycle

1. Use the active project's established `PLAN_ROOT`, following [spec's root selection](../spec/SKILL.md#phase-2--spec-one-file). Write under `PLAN_ROOT/handoffs/`; create that directory if needed.
2. For work tied to a numbered spec or plan, reuse its number and topic: `XXX-handoff-<topic>.md`. For standalone work, use `YYYY-MM-DD-handoff-<topic>.md`; do not allocate a spec/plan number.
3. Write one handoff, or update the existing handoff for the same work. Treat user arguments as the next session's focus.
4. Creating a handoff does not change or archive its source spec or plan. Archive the handoff only after verified completion, or after its receiving context is superseded and reconciled into current source documentation with remaining actions recorded elsewhere. Move it to `PLAN_ROOT/archived/` without renaming.

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
