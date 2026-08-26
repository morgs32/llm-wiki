---
name: make-obvious
description: >-
  Make cognitively dense code understandable, then simplify one coherent
  behavior slice at a time. Use when a maintainer says a function, lifecycle,
  concurrency protocol, Stream, or its tests are overwhelming and wants the
  code to read as concise orchestration through domain-named boundaries. Do not
  use for broad cleanup or generic tutorials without a concrete local slice.
---

# Make Obvious

Reduce the amount a maintainer must hold in working memory. Work on one
invariant-sized slice, not the whole parent module.

This workflow requires the shared `$patterns` skill. Invoke it through skill
selection; do not assume it exists at a sibling filesystem path. If `$patterns`
is unavailable, report the missing prerequisite and stop.

## Ground the slice

1. Read repository instructions, applicable patterns, the complete parent, and
   current `git status --short` plus the worktree diff. Search all callers,
   tests, and architecture notes, then read the directly relevant ones
   completely; do not turn a one-slice inquiry into an unbounded repository
   survey.
2. Preserve unrelated work. Re-read a file immediately before editing when the
   worktree is changing concurrently.
3. Honor a user-selected slice. Otherwise recommend the smallest cohesive slice
   that owns a public promise, lifecycle, failure policy, or observation rule.
   Do not inventory every possible refactor before teaching the selected slice.
4. Invoke `$patterns`, then read its indexed **Readable workflow boundaries**
   pattern. When the slice contains concurrency, scopes, fibers, latches,
   streams, subscriptions, or cancellation, also read its indexed
   **Concurrency slice lens** pattern.
5. For library primitives, inspect the installed version first and use vendored
   or upstream source as explanatory reference. When versions differ, append
   one brief version note to the local glossary.

## Learn before editing

Keep this phase read-only. Explain the slice in plain language before library
terminology and include only:

1. **Public promise** — one sentence describing what callers observe.
2. **Boundary** — inputs, outputs, owned state, failures, and lifetime.
3. **Local glossary** — each unfamiliar primitive, its local name, and the one
   job it performs here.
4. **Ownership view** — a small tree or table when resources have nested
   lifetimes.
5. **Execution view** — one ordinary sequence, followed by one race timeline at
   a time only when a race defines the behavior.
6. **Invariant table** — significant states or events and their observable
   results.
7. **Complexity judgment** — what is essential to the contract versus
   accidental code shape, naming, duplicated state, or test ceremony.
8. **Proposed seam** — one domain-named module or function boundary, its exact
   interface signature without implementation, and the existing tests that
   protect it; or an explicit **no refactor warranted** conclusion when no
   honest boundary would reduce complexity.
9. **Vocabulary proof** — for each new noun introduced by the seam, identify
   the distinct value, responsibility, or lifetime it names. If it is only
   another view or duplicate of an existing domain object, keep the existing
   domain noun.

Use a proposed function name like an annotation: the parent should state what
happens while the function owns how it happens.

Do not infer a domain concept from an existing accessor name. A function named
`readRouteMetadata(route)` may be historical indirection around the Route
itself; its name does not prove that `metadata` is a separate concept worth
preserving or exposing at a new boundary.

Stop after the brief. Ask separately whether the behavior model is correct and
whether the proposed seam or no-refactor conclusion is accepted or should be
revised. Do not edit production code, tests, or durable documentation until the
user confirms the model and accepts the proposed action.

## Refactor the confirmed slice

If the user accepts a no-refactor conclusion, do not edit. Report which
complexity is essential and stop.

1. Recheck worktree status, source hashes, and test baselines before editing.
2. Preserve public behavior, errors, cancellation, cleanup, ordering, object
   identity, and failure causes unless the user explicitly changes the
   contract.
3. Move the complete invariant behind one domain-named boundary. Keep the
   caller as ordered orchestration; do not move arbitrary consecutive lines.
4. Prefer a deep module with a small honest interface. Its implementation may
   be as long as the invariant requires; file or function length is diagnostic,
   not a pass/fail rule.
5. When one file implements one workflow, prefer one exported function whose
   body presents that workflow in human reading order. In Effect code, export
   the actual `Effect.fn`; do not wrap a private `...Effect` implementation only
   to reshape its signature. Keep one-use checks and logical branches in that
   body unless a helper hides an independently meaningful rule. A longer
   cohesive function is preferable to making the reader reconstruct one
   workflow from several fragments. Use a short numbered phase overview and
   matching inline checkpoints when stable steps make that reading order
   clearer. This is the skill's workflow-module preference, not a claim that
   every kind of module universally requires one export; see the rationale in
   the `$patterns` **Readable workflow boundaries** rationale.
   Treat an immediate kind branch as evidence that the boundary may hide
   multiple workflows when the branches have materially different inputs,
   failure channels, callers, or lifetimes. Inspect those workflows separately
   and share only independently meaningful rules; see
   its **Split a boundary that hides multiple workflows** test.
6. In Effect code, use `Effect.fn` when the boundary performs effects, can fail,
   owns resources, or participates in interruption. Use a plain function for a
   total synchronous transformation or a declarative Stream construction.
7. Import directly from the defining module. Do not add feature barrels,
   compatibility re-exports, generic utility bags, or configuration invented
   only to make extraction possible.
8. Do not create a large runtime-state parameter bag merely to split mutually
   dependent lifecycle procedures. Treat that as a separate architecture
   decision.
9. Remove private data or branches only when they belong to the selected slice,
   are proven unused, and remain covered by public behavior tests.
10. Audit names after extraction. A name that depended on its old context is
   still accidental complexity. Include the module, factory, filename, test,
   documentation title, and each boundary member in that audit; when the owned
   responsibility changes, stale outer names are as misleading as stale local
   names. Name each boundary member so callers can tell
   what it returns or changes without reading its implementation; distinguish
   access shapes such as a one-time read and a Stream instead of giving both
   the same content noun. When both content and mechanism are necessary to
   remove ambiguity, name both—for example, pair `getHandle()` with
   `handleStream`, not `handles` or a bare `stream`. Apply the same vocabulary
   across public and internal boundaries unless their roles genuinely differ.
   Replace generic internal nouns such as `snapshot`,
   `value`, `data`, `current`, or `tail` with the role they perform when that
   role is more specific. Before renaming, identify what the variable itself
   denotes. Do not overcorrect a content-only name with another content-only
   name when the variable is actually a container. Name a meaningful container
   as its semantic content plus the abstraction that determines how it is
   used—for example, `snapshotRef` for a
   `SubscriptionRef<IActorStateSnapshot>` and `snapshot` for one value read or
   emitted from it. Do not rename the contained value after one downstream
   interpretation: a Stream may interpret the snapshot, but that does not make
   the stored value a `streamStatus`. Mirror the type's role when it reveals
   available operations, mutation, subscription, ownership, or lifetime; do
   not copy an incidental implementation type into every local name.

## Make the tests teach the slice

1. Build an old-test to invariant to new-test coverage map before moving tests.
2. Group tests by observable behavior. Keep fixtures local to that behavior and
   import them directly; do not create a universal machine or fake runtime.
3. Keep concurrency deterministic with barriers such as `Deferred`. Do not use
   sleeps, polling, or timeouts as evidence of ordering.
4. Put a short happens-before timeline above a test whose scheduling is not
   obvious. Extract repeated scheduling only behind a domain-named scenario
   driver, while keeping assertions in the test.
5. Preserve cross-observer assertions when their shared identity or failure
   cause is the invariant.

## Leave focused knowledge

After the confirmed refactor passes, synchronize any existing concept or
architecture page made stale by the change. Create a new concept page only
with explicit user approval for that durable documentation scope. When a page
is updated or approved, include the public promise, ownership/lifetime view,
invariant table, primitive roles, failure and cancellation behavior, and
executable evidence. Prefer one small diagram or mapping table over another
end-to-end system tour.

## Finish one slice

Run the repository task runner's focused tests, typecheck, build, and diff
checks. Report the before/after responsibilities and visible orchestration, not
line movement alone. Name the next candidate slice, but stop instead of
continuing automatically.
