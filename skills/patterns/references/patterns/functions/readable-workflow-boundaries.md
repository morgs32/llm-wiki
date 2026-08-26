# Readable workflow boundaries

Use these principles to choose a boundary that reduces cognitive load rather
than distributing it across more files.

## Make the important path obvious

- The parent should read as ordered domain operations.
- A name should state the outcome or policy, not repeat the implementation
  mechanism.
- Apply a new-noun test before accepting a boundary term such as `metadata`,
  `contract`, `descriptor`, or `runtime`: point to the distinct value,
  responsibility, or lifetime it denotes. If it only renames a view or shadow
  copy of an existing domain object, use the existing domain noun.
- Do not treat an accessor's vocabulary as evidence of the domain model.
  `readRouteMetadata(route)` can disguise a direct Route read; first determine
  what concrete value is returned and whether it is genuinely separate.
- Boundary members should make distinct access shapes obvious without forcing
  callers to choose between content and mechanism. Name both when both matter:
  `actor.handleStream` and `handleStore.handleStream` say what flows and how it
  is accessed. Do not rationalize incongruent public and internal vocabularies
  when one precise name works at both boundaries.
- Re-audit local names after extraction. Names such as `snapshot`, `value`,
  `data`, `current`, and `tail` are only useful when that is truly the most
  specific role available in the new boundary.
- Distinguish a container from its contents. Renaming `snapshots` to
  `streamStatus` is an overcorrection when the variable denotes a
  `SubscriptionRef<IActorStateSnapshot>`: it replaces the contained value's
  domain name with one downstream consumer's interpretation and still hides
  the container. Prefer `snapshotRef` for the `SubscriptionRef` and `snapshot`
  for one stored or emitted value. Echo the type's role only when it tells the
  reader which operations, mutation, subscription, ownership, or lifetime to
  expect.
- Keep different abstraction levels separate. Orchestration should not
  interleave route selection, schema details, resource cleanup, and Stream
  operators.
- Comments explain constraints, counterintuitive ordering, and why a simpler
  alternative is wrong. Named boundaries explain the ordinary sequence.

## Prefer deep boundaries

A useful boundary removes decisions from its caller and owns a complete
invariant, lifecycle, failure normalization rule, or transformation. Do not
force every implementation to be short. Several shallow wrappers can create
more navigation and coupling than one deep module with a small interface.

Reject an extraction when it:

- wraps one obvious call without adding a policy or meaningful name;
- moves arbitrary consecutive statements;
- exposes a bag of incidental locals;
- splits acquisition from cleanup or mutation from its required publication;
- reduces line count while leaving the parent responsible for the same
  branching and decisions.

## Prefer one readable workflow

When a file exists to implement one workflow, prefer one exported boundary
whose implementation follows the workflow in human reading order. Keep
one-use checks and ordinary branches in that function when extracting them
would make the reader jump among fragments to reconstruct the sequence. Use
stable phase comments when they make a longer cohesive function easier to
scan. Extract a helper only when it hides a separately meaningful rule rather
than merely shortening the parent.

This workflow preference combines Ousterhout's **deep module**—a small
interface hiding a substantial implementation—with Knuth's **literate
programming** emphasis on explaining a program to people in an intelligible
order. Neither source prescribes “one export per file” as a universal law;
that is this shared workflow convention.

## Split a boundary that hides multiple workflows

An immediate kind branch—such as a tag match or `if ('payload' in props)`—is
evidence, not proof, that the enclosing boundary is too broad. Inspect each
branch's callers and contract separately. Split the boundary when the branches
materially differ in one or more of these ways:

- different domain events or callers enter them;
- different required inputs make their signatures dishonest when combined;
- success, typed failure, defect, or interruption has different meaning;
- ownership, cancellation, or lifetime rules differ;
- each branch has its own coherent sequence that becomes linear when named.

A successful split creates domain-named workflows that can each be read in
human order without immediately redispatching by kind. Keep a shared function
only when it names an independently meaningful rule. For example, Command and
Activation Route services may warrant separate runners when their payload and
failure contracts differ, while both runners can still share destination
validation.

Do not split every conditional. Keep an ordinary branch inside one workflow
when both sides implement the same public promise and lifecycle. Do not create
two public filenames that merely delegate to the same broad, branchy private
function, and do not invent a shared helper solely because the new workflows
contain a few similar lines.

## Separate essential and accidental complexity

Classify each difficult part before refactoring:

| Question | Essential when | Accidental when |
| --- | --- | --- |
| Why does this branch exist? | It distinguishes observable outcomes | It compensates for tangled representation |
| Why is this state stored? | A later concurrent operation needs it | It is written but never read |
| Why is this primitive visible? | The caller chooses its semantics | The caller only needs a domain operation |
| Why is this test long? | The schedule itself is the contract | Fixture and barrier mechanics obscure assertions |

## References

- John Ousterhout, *A Philosophy of Software Design*: deep modules, information
  hiding, different layer/different abstraction, and making code obvious:
  <https://web.stanford.edu/~ouster/cgi-bin/book.php>
- Donald Knuth, *Literate Programming*: arrange programs to communicate their
  ideas and order to human readers:
  <https://www-cs-faculty.stanford.edu/~knuth/lp.html>
- Martin Fowler's refactoring catalog: Extract Function, Extract Class, and
  Split Phase are tools for boundaries, not goals by themselves:
  <https://refactoring.com/catalog/index.html>
