---
name: spec
description: >-
  Grill a fuzzy plan one question at a time (chat only), then synthesize a
  numbered design spec under the active project's established planning tree.
  Use when the user says /spec, wants a design spec, requests an implementation
  plan or plan review, or wants grill + to-spec before implementation.
---

# Spec (grill → design doc)

For a new design: **resolve decisions in chat**, then **write a spec file**. Do not write intermediate glossary files or ADRs. For a requested plan, revision, review, or archival, use the document conventions below directly; do not restart the design interview.

## Phase 1 — Grill (chat only)

Resolve material design choices until you and the user share an understanding. Ordinary fixes and already specified implementation do not require this workflow.

1. Ask **one question at a time**. Wait for the answer. Never dump a questionnaire.
2. Walk the design tree depth-first: resolve dependencies before downstream choices.
3. For every question, offer a **recommended answer** (brief, opinionated).
4. If a _fact_ is in the codebase or wiki, **look it up** — do not ask. Ask about unresolved material decisions, not routine implementation details or decisions already requested or approved.
5. Sharpen fuzzy language in chat: propose a canonical term when something is overloaded. Challenge contradictions with existing `wiki/glossary.md` terms or code. Keep vocabulary alignment in the conversation only — do not write `CONTEXT.md` or ADRs.
6. Do **not** write code or the spec file until the user confirms shared understanding (or explicitly says "write the spec").

### Material decisions and approval

Confirm unrequested abstractions, public-contract changes, named domain concepts, and runtime or trust-boundary moves before including them in the design. State the proposed purpose, shape or contract, exact use sites, and meaningful tradeoffs. A new local function or type is not automatically a new design decision.

Explicit requests and prior approvals settle the corresponding decisions: do not ask again while writing the spec or implementing it. Routine details within the approved design need no separate confirmation. When a material unresolved choice arises during implementation, resolve that choice without forcing a new spec document or restarting the interview.

Vet inherited constraints: identify the invariant, trace why today's dependency exists, test whether proposed ownership still needs it, and consider removing redundant work before adding coordination. Existing code, docs, and previous explanations are evidence, not proof that a historical mechanism must survive.

### Relevant evidence

Use the active project's routing and indexes to find only the architecture pages, glossary terms, patterns, and source needed for the decision. Reuse evidence already read. Source establishes current behavior; architecture documentation describes intended behavior. Report discrepancies rather than assuming either is authoritative about a new design. Do not require a fixed reading tour of every documentation tree.

## Document conventions

Use the active project's established `PLAN_ROOT` (resolved below) for development documents; do not introduce a second planning tree.

| Kind | Path under `PLAN_ROOT` |
| --- | --- |
| Spec | `specs/XXX-spec-<topic>.md` |
| Plan | `plans/XXX-plan-<topic>.md` |
| Standalone diagram | `diagrams/<topic>.md` |
| RFC | `rfcs/<topic>.md` |

- Revise an existing document in place. Use ordered lists for spec/plan bullets and steps, and numbered findings when reviewing a plan.
- A standalone plan uses the same prefix allocation as a new spec. A derived plan reuses its spec's number and topic.
- Archive a spec only once its implementation plan exists. Archive a plan only after full implementation and verification. Move to `PLAN_ROOT/archived/` without renaming.
- For handoff naming and archival, use [handoff](../handoff/SKILL.md#destination-and-lifecycle).

## Phase 2 — Spec (one file)

After the user confirms alignment:

1. Sketch the **test seams** for the change. Prefer existing seams; prefer the highest seam; aim for as few as possible (ideally one). Confirm only unresolved material testing choices; reuse seams already requested or approved.
2. Determine `PLAN_ROOT` before writing.

   1. Read root `AGENTS.md` and inspect the existing planning directories.
   2. If repository guidance names a root, use it even when its directory does
      not exist yet.
   3. Otherwise use the one established root visible in the layout, such as
      `.plans/`, `wiki/plans/`, or `wiki/dev/`.
   4. Do not create a second planning tree alongside an established one.
   5. Ask the user only when guidance names no root and the layout is absent or
      ambiguous.

3. Determine the new spec/plan pair's shared three-digit `XXX` prefix before writing:

   1. Inspect filenames recursively under `PLAN_ROOT` for names beginning with three digits.
   2. Use one more than the highest prefix found anywhere under `PLAN_ROOT`.
   3. Ignore legacy filenames without a three-digit prefix when calculating the next number.
   4. Reuse this number if the spec is later turned into an implementation plan.

4. Write **one** design spec:

```text
PLAN_ROOT/specs/XXX-spec-<topic>.md
```

Use the allocated zero-padded prefix and a kebab-case topic. Number every list (no unordered `-` bullets in plan/spec docs).

5. Do **not** publish to an issue tracker. Do **not** create implementation plans under `PLAN_ROOT/plans/` unless the user asks.
6. When the user asks for an implementation plan from the spec:

   1. Read the completed spec as the source of truth.
   2. Create `PLAN_ROOT/plans/XXX-plan-<topic>.md` using the spec's exact `XXX` and topic.
   3. Do not allocate a second number for the implementation plan.
   4. Move the source spec to `PLAN_ROOT/archived/` without changing its filename after the implementation plan exists.

### Spec template

```markdown
# <Topic> design

**Date:** YYYY-MM-DD
**Status:** Draft | Approved for planning

## Problem Statement

What is broken or missing, and why it matters, in this project's vocabulary.

## Solution

High-level shape of the fix — not implementation detail.

## User Stories

Numbered, extensive, independently checkable:

1. As a <actor>, I want <capability>, so that <benefit>

## Implementation Decisions

Settled choices from the grill (modules/interfaces at a conceptual level, contracts, schema/API shape, trade-offs). Prefer project glossary terms.

Do not include brittle file paths or large code dumps. Exception: a short prototype snippet that encodes a decision more precisely than prose (state machine, schema, type shape) — trim to the decision-rich bits.

## Testing Decisions

1. What "done" looks like at the chosen seams
2. Which modules/behaviors are tested
3. Prior art (similar specs/tests in the repo)

## Out of Scope

What this change deliberately does not cover.

## Further Notes

Anything else worth carrying forward (open questions only if the user deferred them).
```

## Done when

1. Grill asked one question at a time and waited.
2. Codebase/wiki answered factual questions without bothering the user.
3. User confirmed shared understanding.
4. Material testing choices were resolved; settled decisions were not re-asked.
5. Exactly one new file exists at `PLAN_ROOT/specs/XXX-spec-<topic>.md` with numbered lists and project vocabulary, or at the same-named archived path after its same-numbered implementation plan is written.

## Anti-patterns

1. Writing `CONTEXT.md`, `docs/adr/`, or any mid-grill markdown.
2. Re-interviewing during Phase 2 — synthesize what was already decided.
3. Treating WIP source or architecture documentation as an unquestionable design constraint.
4. Dumping a questionnaire or writing the spec before the user confirms.
5. Creating `PLAN_ROOT/plans/*` or tickets unless asked.
6. Giving a derived implementation plan a different numeric prefix or topic from its source spec.
