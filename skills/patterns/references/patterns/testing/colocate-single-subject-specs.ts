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
