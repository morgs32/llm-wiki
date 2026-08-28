# Cleanup lenses

Use this reference only for **Judge**, **Imports**, or **Pass**. The shared
`SKILL.md` owns grounding, simplification, tests, and scope.

## Judge

Keep review-only requests read-only. Report numbered findings only when each
one names:

1. The exact file and lines.
2. The concrete readability cost.
3. The smallest likely move: keep, delete, inline, colocate, rename, direct
   import, or stop and ask.

Do not report style nits, hypothetical abstractions, vague "could be cleaner"
advice, or correctness issues unrelated to code shape. Say plainly when the
complexity is necessary or no worthwhile simplification remains.

Before calling indirection wasteful, count callers and check whether it owns
policy, a test seam, a runtime boundary, or an allowed package/worker barrel.
A one-caller wrapper around one obvious call is a finding — inline it. A
one-caller block that owns a complete invariant is not. Long code is not
itself a finding.

## Imports

Change imports only; do not bundle shape cleanup.

1. Read the importing project's nearest `tsconfig.json` and the destination
   package's `package.json` exports.
2. Use a project alias only when it resolves inside that same project.
3. Use an established package name or exported subpath across workspace
   packages. Do not invent an alias or add a re-export.
4. Verify the new specifier resolves to the same defining module.

## Pass

Treat the user-named scope as an ordered queue of coherent slices.

1. Match each concrete smell to repository instructions and the relevant
   `$patterns` entry. Read project-local case studies only when repository
   guidance routes to them.
2. Read architecture documentation before touching ownership, trust, runtime,
   persistence, or cross-process boundaries.
3. Order slices by smallest blast radius and finish verification for one before
   starting the next.
4. Prefer removing structure to replacing it. Do not invent helpers, types,
   services, exports, files, or compatibility paths merely to make the pass
   look organized. When a helper is retained because it owns a meaningful
   rule, put it in its own same-named file even if it has one caller; do not
   leave named helper functions private in the parent module.
5. Stop before a public API change, runtime-boundary move, ownership change, or
   abstraction the user has not approved.

Finish with the smells found, changes made, checks run, and explicitly deferred
items. Update existing documentation only when the change made it stale; a new
case study or durable guidance artifact needs its own authorized scope.
