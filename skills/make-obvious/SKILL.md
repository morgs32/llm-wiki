---
name: make-obvious
description: >-
  Make dense or needlessly indirect code understandable, then simplify one
  coherent slice at a time. Use for make-obvious; cleanup or slop review;
  prune, simplify, inline, or import cleanup; fix-casts or TypeScript assertion
  audits; test review or restructuring; and one-call wrappers or one-liner
  helpers that should be inlined.
  Do not use for generic tutorials or unbounded refactors without a concrete
  scope.
---

# Make Obvious

Reduce the amount a maintainer must hold in working memory. Work on one
invariant-sized slice at a time. A cleanup pass is a bounded queue of such
slices, not permission to rewrite the repository.

This workflow requires the shared `$patterns` skill. Invoke it through skill
selection; do not assume it exists at a sibling filesystem path. If `$patterns`
is unavailable, report the missing prerequisite and stop.

## Choose the lens

Match the lens to what the user authorized:

- **Explain** — model a dense behavior without editing it.
- **Judge** — review code shape and report only specific, actionable findings.
- **Simplify** — apply a named deletion, inline, colocation, rename, or accepted
  extraction in the user-selected scope.
- **Imports** — change import paths only; read
  [the cleanup lenses](references/cleanup.md).
- **Casts** — audit or remove TypeScript assertions; read
  [the cast lens](references/casts.md) before touching a cast.
- **Test / Judge** — audit test organization and report numbered, actionable
  findings only. Do not move or rewrite tests in this mode.
- **Test / Restructure** — preserve the old-test coverage map while organizing
  one invariant-sized feature, verify it, and stop unless the user bounded a
  larger pass.
- **Pass** — process an explicitly bounded cleanup scope as successive slices;
  read [the cleanup lenses](references/cleanup.md).

Do not turn a request for judgment into an edit. When the user already named a
microscopic simplification and asked to make it, do not add a separate approval
pause unless it changes behavior, public surface, ownership, or architecture.

## Ground the slice

1. Read repository instructions, applicable patterns, the complete parent, and
   current `git status --short` plus the worktree diff. Search all callers,
   tests, and architecture notes, then read the directly relevant ones
   completely; do not turn a one-slice inquiry into an unbounded repository
   survey.
2. Preserve unrelated work. Re-read a file immediately before editing when the
   worktree is changing concurrently.
3. Honor a user-selected slice. Otherwise recommend the smallest cohesive slice
   that owns a public promise, lifecycle, failure policy, observation rule, or
   one concrete readability problem. Do not inventory every possible refactor
   before teaching or fixing the selected slice.
4. Invoke `$patterns` and search its index for the exact task. For behavioral
   orchestration, read **Readable workflow boundaries**. For a one-caller
   wrapper around one simple call, read **inline-one-call-simple-helpers**.
   When the slice contains concurrency, scopes, fibers, latches, streams,
   subscriptions, or cancellation, also read **Concurrency slice lens**. For
   test review or restructuring, read **Test organization and annotations**.
   For imports, casts, or a named cleanup smell, read the matching pattern
   instead of loading unrelated workflow guidance.
5. For library primitives, inspect the installed version first and use vendored
   or upstream source as explanatory reference. When versions differ, append
   one brief version note to the local glossary.

## Learn before editing

Use the full brief for **Explain**, for an unaccepted seam, or whenever the
observable contract is unclear. A directly requested microscopic
simplification may do this grounding internally and proceed. When presenting a
brief, keep it read-only, explain the slice in plain language before library
terminology, and include only:

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
8. **Proposed move** — the smallest deletion, inline, colocation, rename, direct
   import, or domain boundary that would make the slice obvious, plus the
   existing tests that protect it; or an explicit **no refactor warranted**
   conclusion.
9. **Vocabulary proof** — when the move introduces a noun, identify the
   distinct value, responsibility, or lifetime it names. If it is only another
   view or duplicate of an existing domain object, keep the existing noun.

Use a proposed function name like an annotation: the parent should state what
happens while the function owns how it happens.

Do not infer a domain concept from an existing accessor name. A function named
`readRouteMetadata(route)` may be historical indirection around the Route
itself; its name does not prove that `metadata` is a separate concept worth
preserving or exposing at a new boundary.

Prefer named properties for ordinary data and genuine associations. Do not hide
such a value behind a symbol and then add a reader merely to recover it. A
symbol should buy identity, nominal typing, collision avoidance, or a required
framework protocol; opacity alone is not a benefit. When a typed reader only
returns `value.property`, inline the property access. Keep a reader only when it
owns real decoding, validation, policy, dynamic lookup, or another behavior
that callers should not reproduce.

When the brief proposes a behavior model or new seam that the user has not
accepted, stop and ask separately whether each is correct. Do not edit
production code, tests, or durable documentation until the user accepts that
action.

## Refactor the confirmed slice

If the user accepts a no-refactor conclusion, do not edit. Report which
complexity is essential and stop.

1. Recheck worktree status, source hashes, and test baselines before editing.
2. Preserve public behavior, errors, cancellation, cleanup, ordering, object
   identity, and failure causes unless the user explicitly changes the
   contract.
3. Reduce before extracting: delete proven stale structure; inline functions
   with one caller and one simple call; colocate one-consumer details; import
   from the defining module; and tighten names. Do not create a sibling file
   for a one-call wrapper to satisfy one export per file. When a helper is
   meaningful enough to retain, put it in its own same-named file and export
   that function directly; do not leave named private helper functions in the
   parent module. Extract only a block that owns a complete invariant, even
   when it still has one caller. Stop as soon as the code is obvious.
4. Extract only when the remaining complexity belongs to one complete
   invariant. Move that invariant behind one domain-named boundary and keep
   the caller as ordered orchestration; do not move arbitrary consecutive
   lines.
5. When extraction is warranted, prefer a deep module with a small honest
   interface. Put each retained helper function in its own same-named file and
   export that function directly, including helpers with only one caller. A
   source file exports at most one function. Do not evade this rule with a bag
   of function-valued properties. Its implementation may be as long as the
   invariant requires; file or function length is diagnostic, not a pass/fail
   rule.
6. When one file implements one workflow, prefer one exported function whose
   body presents that workflow in human reading order. In Effect code, export
   the actual `Effect.fn`; do not wrap a private `...Effect` implementation only
   to reshape its signature. Keep one-use checks and logical branches in that
   body when they do not deserve a helper name. When a helper is meaningful
   enough to name, move it to its own same-named file even when it has only one
   caller; do not leave named private helper functions in the parent module. A
   longer cohesive function is preferable to making the reader reconstruct one
   workflow from several fragments. Use a short numbered phase overview and
   matching inline checkpoints when stable steps make that reading order
   clearer. This is the skill's production helper and workflow-module rule:
   every retained helper function has its own file, and each source file
   exports at most one function. Anonymous callbacks and class methods are not
   separate helper functions. See the boundary rationale in the `$patterns`
   **Readable workflow boundaries** pattern.
   Treat an immediate kind branch as evidence that the boundary may hide
   multiple workflows when the branches have materially different inputs,
   failure channels, callers, or lifetimes. Inspect those workflows separately
   and share only independently meaningful rules; see
   its **Split a boundary that hides multiple workflows** test.
7. In Effect code, use `Effect.fn` when the boundary performs effects, can fail,
   owns resources, or participates in interruption. Use a plain function for a
   total synchronous transformation or a declarative Stream construction.
8. Import directly from the defining module. Do not add feature barrels,
   compatibility re-exports, generic utility bags, or configuration invented
   only to make extraction possible.
9. Do not create a large runtime-state parameter bag merely to split mutually
   dependent lifecycle procedures. Treat that as a separate architecture
   decision.
10. Remove private data or branches only when they belong to the selected slice,
   are proven unused, and remain covered by public behavior tests.
11. Audit names after extraction. A name that depended on its old context is
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

1. In **Test / Judge**, return numbered actionable findings only. Identify the
   owning source or behavior, the missing or duplicated promise, runtime-lane
   mismatch, nondeterministic scheduling, stale annotation, or fixture problem,
   and the smallest concrete correction. Do not include a generic summary.
2. In **Test / Restructure**, build an old-test to invariant to new-test coverage
   map before moving tests. Restructure one feature-sized slice, run its focused
   verification, and stop unless the user authorized a bounded queue.
3. Group tests by observable behavior. Keep fixtures local to that behavior and
   import them directly; do not create a universal machine or fake runtime.
4. Preserve configured runtime suffixes and discovery lanes. A focused spec
   mirrors its source basename; a behavioral spec names one observable promise.
5. Keep concurrency deterministic with barriers such as `Deferred`. Do not use
   sleeps, polling, or timeouts as evidence of ordering.
6. Add an ordered phase overview and matching inline checkpoints only when a
   test has multiple phases or scheduling that is otherwise difficult to read.
   Extract repeated scheduling only behind a domain-named scenario driver,
   while keeping assertions in the test.
7. Preserve cross-observer assertions when their shared identity or failure
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

When code changed, run the repository task runner's focused tests, typecheck,
build, and diff checks. Report the before/after responsibilities and visible
orchestration, not line movement alone. Unless the user explicitly requested a
bounded pass or batch, name the next candidate slice and stop. In a bounded
pass, continue only through the named scope and stop before an unapproved
architecture decision or the first blocked cast removal.
