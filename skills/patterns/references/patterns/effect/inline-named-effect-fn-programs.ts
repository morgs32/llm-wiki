import { Clock, Effect } from 'effect';

declare const eventSource: {
  catchup: () => Effect.Effect<readonly { cursor: string }[], never, never>;
};

/**
 * Name inline Effect programs with Effect.fn at the existing expression site.
 * Domain-named Effects are the implementation unit; async Promise wrappers
 * belong at runtime entrypoints and immediately run or encode that Effect.
 * Do not add an Effect suffix to preserve an async wrapper with the domain name.
 * Do not parenthesize yield* merely to cast its result.
 *
 * @bad Anonymous `Effect.gen` assigned to an exported Effect value.
 * @bad `() => Effect.gen(...)` when `Effect.fn('name')` preserves the same call shape.
 * @bad Extracting a one-off helper/export just to name an inline Effect program.
 */
export const logCurrentTime = Effect.fn('logCurrentTime')(function* () {
  const now = yield* Clock.currentTimeMillis;
  yield* Effect.logDebug(`current time: ${now}`);
})();

export const timeUtils = {
  now: Effect.fn('timeUtils.now')(function* () {
    return yield* Clock.currentTimeMillis;
  }),
};

export const catchupEvents = Effect.fn('catchupEvents')(function* () {
  let lastCursor: string | null = null;

  const events = yield* eventSource.catchup();

  yield* Effect.fn('catchupEvents.recordCursor')(function* () {
    const batchCursor = events[events.length - 1]?.cursor;
    lastCursor = batchCursor ?? lastCursor;
    yield* Effect.void;
  })();

  return lastCursor;
});
