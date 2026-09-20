/**
 * Colocate a spec with one clear source owner and mirror the exact source
 * basename before the test lane's configured spec suffix.
 *
 * Good focused layout:
 *
 * - `src/makeWidget.ts`
 * - `src/makeWidget.spec.ts`, `src/makeWidget.node.spec.ts`, or
 *   `src/makeWidget.zspec.ts`, according to the lane
 *
 * Keep complete cross-module, runtime, or lifecycle integrations in a
 * dedicated `test/` or `e2e/` area with scenario names such as
 * `test/widget-lifecycle.spec.ts`.
 *
 * Each behavioral file owns one observable promise. Keep its fixtures local;
 * use a suite contract comment only when the filename and title are insufficient.
 * Multi-phase or scheduling-sensitive tests use an ordered overview immediately
 * above the test and matching numbered checkpoints in the body. Keep both in
 * sync. Simple validation and transformation tests need no phase ceremony.
 *
 * Prove ordering with deterministic barriers, not elapsed time. Browser readiness
 * waits are legitimate when waiting for the observed UI/runtime condition.
 * Preserve complete success, failure, retry/resume, cancellation, identity,
 * ordering, and exact-Cause assertions when moving a scenario. Keep assertions
 * in the test and fixtures in its feature; repeated setup alone does not justify
 * a shared driver or fake runtime.
 *
 * The appropriate Vitest configs must collectively discover the focused and
 * integration locations without combining distinct runtime lanes. Emit
 * configs must exclude colocated specs while test and thorough typecheck
 * configs include them.
 *
 * @bad Do not mirror a source directory beneath `test/` for a spec with one clear source owner.
 * @bad Do not rename a colocated spec after a broader concept; `widget.spec.ts` must not sit beside `makeWidget.ts`.
 * @bad Do not force a complete integration scenario beside one arbitrary implementation participant.
 * @bad Do not let colocated specs enter the package's emitted build output.
 */
export {};
