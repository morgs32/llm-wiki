import { it } from '@effect/vitest';
import { Clock, DateTime, Effect, TestClock } from 'effect';
import { describe, expect } from 'vitest';

/**
 * In `it.effect`, read time from Effect's clock and advance `TestClock` explicitly.
 *
 * @bad `new Date()` or `Date.now()` in specs — they bypass TestClock.
 * @bad Asserting wall-clock time in `it.effect` without `TestClock.adjust`.
 */
describe('clock', () => {
  it.effect('advances time', () =>
    Effect.gen(function* () {
      expect(yield* Clock.currentTimeMillis).toBe(0);
      yield* TestClock.adjust('1 second');
      const now = yield* DateTime.now;
      expect(DateTime.toEpochMillis(now)).toBe(1000);
    }),
  );
});
