import { it } from '@effect/vitest';
import { Effect, Exit } from 'effect';
import { describe, expect } from 'vitest';

declare function divide(
  numerator: number,
  denominator: number,
): Effect.Effect<number, string>;

/**
 * Assert expected Effect failures with `Effect.exit`. Do not let the test Effect fail unless the test itself should fail.
 *
 * @bad Letting the subject Effect fail the test fiber instead of asserting `Exit.fail`.
 */
describe('divide', () => {
  it.effect('rejects divide by zero', () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(divide(4, 0));
      expect(result).toStrictEqual(Exit.fail('Cannot divide by zero'));
    }),
  );
});
