# Apply YAGNI before coordination machinery

Use this pattern when a change proposes a new capability, guarantee,
abstraction, compatibility path, or coordination mechanism, especially across
independently owned state or failure boundaries.

## Prove the root feature first

Do not implement a feature without an explicit current requirement or an
existing caller that needs it. Apply YAGNI to the root capability, not only to
its supporting implementation.

Do not justify machinery by problems created by an invented feature. Before
adding safety, lifecycle, recovery, retry, cycle-detection, or compatibility
machinery, first prove that the feature requiring it should exist. "Might be
useful," "makes composition convenient," and "now necessary because we added
X" are not requirements.

Name the explicit current requirement or existing caller and the observable
behavior. For defensive or safety machinery, also name the concrete failure it
prevents. If neither a requirement nor caller exists, or the behavior cannot be
stated observably, do not build the feature. Do not solve the consequences of a
feature before proving the feature is needed.

## Require coordination to purchase a system invariant

Coordination machinery must buy an explicitly required end-to-end invariant.
Before adding lock-held external calls, nested calls between independently
owned state, call-chain tracking, cycle detection, compensation, rollback,
fencing, or similar machinery, state:

1. The observable invariant being purchased.
2. The ownership and failure boundaries across which it must hold.
3. Its behavior under interruption, retry, and partial completion.
4. The blocking, coupling, recovery, and deadlock costs it introduces.
5. Why explicit orchestration, one-way intent, or release-and-revalidate is
   insufficient.

A local scheduling fact is not automatically a system guarantee. For example,
"A cannot change while A waits for B" does not make independently committed A
and B atomic, consistent, or safely recoverable. It does not justify holding
A's exclusive gate across B unless that exact non-interleaving behavior was
explicitly required and its partial-completion behavior is complete.

Default to independent owners not synchronously calling one another while
holding local exclusivity. Coordinate outside the owners, emit a one-way
intent, or release and revalidate. Atomic commit, idempotent forward recovery,
compensation, fencing, or explicitly accepted partial completion can justify a
different design when the requirement actually needs one; rollback is not the
default requirement.

The juice must be worth the squeeze: do not pay transaction-shaped complexity
for a microscopic scheduling convenience. If the guarantee was not requested,
cannot be stated observably, or does not justify its new failure modes, stop and
ask before building it.
