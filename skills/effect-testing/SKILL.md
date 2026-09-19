---
name: effect-testing
description: >-
  Testing guidelines for Effect-based code with @effect/vitest. Use when
  writing or reviewing specs, it.effect, it.layer, TestClock, Effect.exit,
  workerd tests, or anything that returns an Effect in a *.spec.* file.
---

# Effect testing

Use this skill when writing or reviewing tests for Effect-based code. For
code-shape examples, also read `$patterns` under `references/patterns/testing/`
and `references/patterns/effect/`.

## Import `it` from `@effect/vitest`

```ts
import { it } from '@effect/vitest';
import { describe, expect, beforeEach, vi } from 'vitest';
```

- Do not import `it` from `vitest` for Effect tests.
- Do not alias (`import { it as effectIt } from '@effect/vitest'`).
- Vitest still owns the suite shell: `describe`, `expect`, `beforeEach`, `vi`.

## `it.effect` for Effect subjects

When the subject returns an `Effect`, return an Effect from `it.effect`. Do
not wrap the whole test in `async` + `Effect.runPromise` / `Effect.runSync`.

```ts
it.effect('loads rows', () =>
  Effect.fn('loadRowsSpec')(function* () {
    const rows = yield* loadRows({ db });
    expect(rows).toEqual([{ id: 'usr_1', name: 'Alice' }]);
  }),
);
```

`it.effect` is `Tester<Scope.Scope>`: it runs `Effect.scoped` and provides
Effect test services (`TestClock`, `TestConsole`). Use it for
`Effect.acquireRelease` and other scoped resources. Do not wrap the test body
in another `Effect.scoped`. Do not look for `it.scoped` — that tester is not
on the current `@effect/vitest` methods object.

Use `it.live` only when the test must see the real clock, logger, or other
live services. `it.effect` suppresses logs; provide a logger or use `it.live`
when log output is the assertion.

## Failures as `Exit`

Assert expected failures with `Effect.exit`. Do not let the test Effect fail
unless the test itself should fail.

```ts
it.effect('rejects divide by zero', () =>
  Effect.gen(function* () {
    const result = yield* Effect.exit(divide(4, 0));
    expect(result).toStrictEqual(Exit.fail('Cannot divide by zero'));
  }),
);
```

## `it.layer` for services

When the Effect needs services, share a `Layer` with `it.layer`. Use the `it`
passed into the callback — not the outer `it` — or Vitest reports no tests.

```ts
it.layer(Layer.mergeAll(NanoIdFactory, UlidMonotonicFactory))(scopedIt => {
  scopedIt.effect('deploys', () =>
    Effect.fn('deploySpec')(function* () {
      const result = yield* deployOrderWorker({ apiKey: 'key' });
      expect(result.success).toBe(true);
    }),
  );
});
```

The layer is created once for the block, not per test. Nested `it.layer` adds
more context. Do not invent a `managedRuntime.runPromise` wrapper just to
feed services into an `async` spec.

## Promise-based test calls

When a test must call a Promise API and should fail on rejection, lift it:

```ts
const encoded = yield* Effect.promise(() => fanout.publish({ payload }));
```

Inline `Effect.promise` + decode at the call site. Do not hide that sequence
behind a one-call `decodeWire` / `publishPayload` helper.

## Time

Never `new Date()` or `Date.now()` in specs — they bypass Effect's clock.

In `it.effect`, `DateTime.now` / `Clock.currentTimeMillis` read `TestClock`,
which starts at `0`. Advance it explicitly:

```ts
import { Clock, DateTime, Effect, TestClock } from 'effect';

it.effect('advances time', () =>
  Effect.gen(function* () {
    expect(yield* Clock.currentTimeMillis).toBe(0);
    yield* TestClock.adjust('1 second');
    const now = yield* DateTime.now;
    expect(DateTime.toEpochMillis(now)).toBe(1000);
  }),
);
```

If a `Date` is required, use `yield* DateTime.nowAsDate` (still TestClock)
or `DateTime.toDateUtc(yield* DateTime.now)`. Use `it.live` only for the
real wall clock.

## Type-level assertions

Use `tsafe` for exact compile-time equality. Do not use `extends` ternaries.

```ts
import { assert } from 'tsafe';
import type { Equals } from 'tsafe';

assert<Equals<ActualType, ExpectedType>>();
```

## Runtime lanes and file names

One Vitest config per runtime. The spec suffix must match that config's
`include` glob:

- `*.node.spec.ts` → node config
- `*.workerd.spec.ts` → workerd / Workers pool
- `*.playwright.spec.ts` / `*.playwright.spec.tsx` → browser e2e

Do not put workerd and browser specs in one config. Colocate a focused spec
with its source basename (`makeWidget.ts` → `makeWidget.node.spec.ts`). Keep
cross-module lifecycle tests under `test/` or `e2e/` with scenario names.

## Live secrets

Live integration specs must fail at module load when a required secret is
missing. Do not `describe.skipIf(!process.env.API_KEY)` — that passes with
zero tests.

## Workers Vitest bindings

```ts
import { env } from 'cloudflare:workers';
import { introspectWorkflow } from 'cloudflare:test';
```

Do not import `env` from `cloudflare:test`.
