import { it } from '@effect/vitest';
import { Effect } from 'effect';
import { describe, expect } from 'vitest';

declare function loadRows(props: {
  db: unknown;
}): Effect.Effect<readonly { id: string; name: string }[], never, never>;

const db = {};

/**
 * Use `it.effect` for Effect-native specs — not `async` + `Effect.runPromise` around the whole test.
 *
 * `it.effect` is `Tester<Scope.Scope>`: it runs `Effect.scoped` and provides
 * Effect test services (`TestClock`, `TestConsole`). Use `it.live` when the
 * test must see the real clock, logger, or other live services.
 *
 * @bad `it('runs query', async () => { await Effect.runPromise(Effect.gen(...)) })`.
 * @bad Wrapping the `it.effect` body in another `Effect.scoped` — `it.effect` already scopes.
 * @bad Looking for `it.scoped` — it is not on the current `@effect/vitest` methods object.
 * @bad Using `it.effect` when log output is the assertion — `it.effect` suppresses logs; use `it.live`.
 */
describe('loadRows', () => {
  it.effect('loads rows', () =>
    Effect.fn('loadRowsSpec')(function* () {
      const rows = yield* loadRows({ db });
      expect(rows).toEqual([{ id: 'usr_1', name: 'Alice' }]);
    }),
  );
});
