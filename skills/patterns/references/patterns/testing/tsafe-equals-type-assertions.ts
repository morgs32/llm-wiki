import { assert } from 'tsafe';
import type { Equals } from 'tsafe';

/**
 * Type-level spec assertions use `tsafe` `Equals` — not `extends` ternaries.
 *
 * @bad `type Check = Actual extends Expected ? true : false` as an equality test.
 */
assert<Equals<{ id: string }, { id: string }>>();
