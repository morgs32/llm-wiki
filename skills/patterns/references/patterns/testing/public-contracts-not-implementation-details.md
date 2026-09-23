# Test public contracts through observable behavior

Assert returned values, failures, externally visible state changes, and required
side effects. Avoid assertions about private structure, internal helper calls,
or incidental execution order. Preserve ordering and interaction assertions
when those are themselves part of the contract.

For pure functions, use input/output examples or table-driven cases. For
stateful operations, also observe committed state, cancellation, and recovery
through the public boundary. A successful return alone does not establish that
the required side effect occurred.

For example, test a replay operation by its result and the stored records that
can subsequently be read. Do not assert which internal helper performed the
write. If rejection must prevent delivery, asserting that no delivery occurred
is a contract check, not incidental implementation coupling.

Choose the boundary that owns the observable promise; do not require a separate
test for every file or internal helper. Tests should survive an internal
refactor that preserves the contract.
