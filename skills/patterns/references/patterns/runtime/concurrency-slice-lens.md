# Concurrency slice lens

Use this reference only when the selected slice includes concurrent work,
resource scopes, cancellation, or a Stream/subscription protocol.

## Build the ownership ledger

Record only primitives that participate in the slice:

| Local name | Primitive | Owner and lifetime | Who waits or writes | Invariant | Cancellation or failure behavior |
| --- | --- | --- | --- | --- | --- |

Translate the primitive into its local job first. For example, describe a
one-permit Semaphore as the actor's exclusive transition turn before teaching
Semaphore terminology.

Draw the smallest resource tree that shows which lifetime owns each child task,
subscription, finalizer, or latch. For an Effect slice, name the Scope and Fiber
ownership explicitly. State which owner is deliberately outside the slice.

## Expose the schedule

For each behavior-defining race, write a short happens-before timeline:

```text
1. Operation A reaches barrier X.
2. Operation B changes or closes the shared lifecycle.
3. Release X.
4. Name the result that is accepted, discarded, interrupted, or published.
```

Answer these questions before proposing simplification:

1. What is serialized, and where is the serialization boundary rechecked?
2. Which work is interruptible, and which critical section must finish?
3. What identity or generation makes an asynchronous result stale?
4. Which lifetime owns every child task and finalizer? In Effect code, which
   Scope owns each Fiber?
5. How are normal completion, expected failure, unexpected failure, and
   cancellation distinguished? In Effect code, name typed failure, defect, and
   interruption explicitly.
6. Must multiple observers receive the same value, object identity, terminal
   result, or failure? In Effect code, name any required `Exit` or `Cause`
   identity.
7. For a replaying Stream, what does a current subscriber see versus a late
   terminal subscriber?

## Guard simplification

- Do not replace a primitive until the replacement preserves every row in the
  ownership ledger and every happens-before outcome.
- Keep replay and the subsequent tail on one subscription when a second
  subscription could create a lost-update gap.
- Keep terminal observation distinct from ordinary data when clean completion
  and failure have different semantics.
- Do not flatten nested Scopes when a supervisor must outlive the work it
  observes.
- Do not widen an uninterruptible region merely to make cancellation easier to
  describe.

## Make concurrency tests readable

- Name barriers after domain events such as `routeStarted` or
  `releaseActivation`, not `deferred1`.
- Put the schedule above the test, then let the test body enact that schedule.
- Extract a scenario driver only when several tests repeat the same schedule;
  return observations and keep assertions visible.
- Never trade deterministic barriers for sleeps, polling, or wall-clock
  assumptions.
