---
name: cloudflare-workers
description: >-
  Cloudflare Workers Env types, Wrangler typegen, bindings, wrangler.jsonc,
  Durable Object startup, and Workers Vitest env imports. Use when adding
  bindings, fixing Env types, writing Worker entrypoints, configuring
  wrangler types / worker-configuration.d.ts, running wrangler dev, or
  writing workerd specs.
---

# Cloudflare Workers

Use this skill when writing or reviewing Cloudflare Worker, Durable Object, or
Workers Vitest code. For code-shape examples, also read `$patterns` under
`references/patterns/cloudflare/`, `durable-objects/`, and `testing/`.

## Env types come from `wrangler types`

Never hand-write Worker `Env`:

- no `src/env.ts` that exports or defines `Env`
- no `src/env.d.ts` that augments `Cloudflare.Env` or declares `Env`
- no duplicate binding interfaces kept in sync with `wrangler.jsonc`

Wrangler generates the canonical `Env` from the Wrangler config, compatibility
date, compatibility flags, and bindings.

```bash
pnpm wrangler types
# or: wrangler types
```

That writes `worker-configuration.d.ts` (default) with:

- runtime types matched to this Worker
- `Cloudflare.Env` from bindings and vars
- a global `Env` that extends `Cloudflare.Env`

Put the generated file in `compilerOptions.types`. If the Worker uses
`nodejs_compat`, also include `node` (and `@types/node`):

```jsonc
{
  "compilerOptions": {
    "types": ["./worker-configuration.d.ts", "node"]
  }
}
```

Run `wrangler types` after any Wrangler config change, and before typecheck /
CI. Prefer `--check` in CI when the generated file is committed:

```bash
pnpm wrangler types --check
```

Prefer `wrangler types` over `@cloudflare/workers-types` in Worker apps so
types match this Worker's compat date and flags. Keep
`@cloudflare/workers-types` for libraries that cannot run typegen against a
single Wrangler config.

## Use the global `Env` — do not import it

In Worker / Durable Object code, use the global `Env`. Do not import it from a
hand-rolled module.

```ts
export default {
  async fetch(req: Request, env: Env) {
    const db = env.SOME_BINDING;
    return new Response('ok');
  },
};
```

```ts
// BAD — duplicates typegen and drifts from wrangler.jsonc
import type { Env } from '../env.js';

export class Worker {
  constructor(private env: Env) {}
}
```

If another package needs a named alias, use `type Env = globalThis.Env`. Do
not recreate the binding surface.

## Adding a binding or var

1. Add it in `wrangler.jsonc` (`vars`, `r2_buckets`, `kv_namespaces`,
   `durable_objects`, `services`, secrets, etc.).
2. Run `wrangler types`.
3. Use `env.YOUR_BINDING` — the generated `Env` is the source of truth.

Do not also declare that binding in a custom `env.d.ts` / `env.ts`.

For Workers RPC, pass the callee Wrangler configs too so `Service<>` and
`DurableObjectNamespace<>` get a type parameter:

```bash
pnpm wrangler types -c ./wrangler.jsonc -c ../other-worker/wrangler.jsonc
```

## Hono

Hono owns its own `Env`. Generate a distinct interface name instead of
colliding with the global `Env`:

```bash
pnpm wrangler types --env-interface CloudflareBindings
```

```ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

Read bindings from `c.env` (or `import { env } from 'cloudflare:workers'`).
Do not assume `process.env` unless the Worker opted into
`nodejs_compat_populate_process_env`.

## `wrangler dev` readiness

Do not treat a fixed sleep as ready. Background `wrangler dev`, then wait for:

```
Ready on http://
```

Do not wait for process exit — the dev server stays up. If that line never
appears, report the terminal tail and stop.

## Workers Vitest

Import bindings from `cloudflare:workers`. Import test helpers from
`cloudflare:test`.

```ts
import { env } from 'cloudflare:workers';
import { introspectWorkflow } from 'cloudflare:test';
```

Do not `import { env } from 'cloudflare:test'`.

Keep workerd specs on a workerd Vitest config and a matching suffix (for
example `*.workerd.spec.ts`). Do not mix workerd and browser pools in one
config.

## Durable Object constructor

`#initialize` returns values; the constructor assigns fields. Schema migrate
and one-time wake work run inside `blockConcurrencyWhile`.

- `#initialize` — parse the DO name, open storage/db, return fields to assign
- `#provisionSchema` / `#migrate` — schema work
- `#bootstrap` — one-time wake work (subscribe, kick a queue)

Do not hide constructor field assignment inside `#initialize` (that forces
definite-assignment assertions). Do not use a vague `#setup` that both opens
storage and kicks fanout. Details: `$patterns`
`durable-objects/do-constructor-init-returns-assigns.ts` and
`durable-objects/lifecycle-names-describe-startup-phase.ts`.
