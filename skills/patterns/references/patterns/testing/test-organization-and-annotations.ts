/**
 * Organize tests around the observable promise they protect.
 *
 * Focused tests with one clear source owner stay beside that source and mirror
 * its basename before the configured lane suffix, such as
 * `makeWidget.node.spec.ts`. Behavioral tests that span sources live in a
 * feature-local `tests/`, integration, or e2e area and name one promise, such
 * as `tests/reconnect-after-owner-restart.workerd.spec.ts`.
 *
 * Preserve the repository's configured discovery lanes. Typical lanes are
 * `*.node.spec.ts`, `*.workerd.spec.ts`, `*.react.spec.tsx`,
 * `*.playwright.spec.ts[x]`, and `*.typecheck.ts`; the active config decides
 * which suffix is valid. Do not rename files without proving the matching
 * runner still discovers them and no old path remains referenced.
 *
 * A behavioral spec file owns one observable promise. Use a suite-level
 * contract comment only when the filename and test names cannot state that
 * promise precisely. Keep assertions in each test and fixtures local to the
 * behavior. Extract a scenario driver only when repeated setup itself names a
 * domain scenario rather than hiding test assertions or ordinary construction.
 *
 * Add numbered annotations only for genuinely multi-phase or
 * scheduling-sensitive tests. Put the ordered phase list immediately above
 * the test and mirror every number once in the body:
 *
 * 1 — Hold the first command after admission.
 * 2 — Start the competing command against the same owner.
 * 3 — Release the first command and observe the second resume.
 *
 * The body then uses `// 1 — concrete checkpoint`, `// 2 — ...`, and
 * `// 3 — ...` at the exact transitions. Keep simple arrange/act/assert tests
 * unannotated. Remove or repair an overview when its numbers, order, or stated
 * checkpoints no longer match the body.
 *
 * Model scheduling with deterministic barriers such as `Deferred`; sleeps,
 * polling, and timeouts are not evidence of happens-before ordering. Prefer
 * Effect-native `it.effect` or `it.layer` for Effect workflows. Type RPC test
 * doubles to the interface or a narrow `Pick`, and fail live integration specs
 * clearly when required secrets are absent.
 *
 * Before restructuring, map each old test to its invariant and destination.
 * Preserve exact test promises, cross-observer identity and failure assertions,
 * runtime discovery, and typecheck coverage. Move one invariant-sized feature,
 * verify it, then stop unless the user explicitly bounded a larger pass.
 *
 * @bad Do not mirror a source tree under `tests/` for specs with one clear source owner.
 * @bad Do not group unrelated promises in a file merely because they call the same factory.
 * @bad Do not add phase comments to simple tests where the code already states the order.
 * @bad Do not use sleeps, polling, or timeouts to prove concurrent ordering.
 * @bad Do not extract a universal fixture or fake runtime while organizing one feature.
 * @bad Do not move tests without an old-test to invariant to new-test coverage map.
 */
export {};
