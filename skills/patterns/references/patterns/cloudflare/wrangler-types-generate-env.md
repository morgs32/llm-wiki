# Env types come from `wrangler types`

Never hand-write Worker `Env`:

- no `src/env.ts` that exports or defines `Env`
- no `src/env.d.ts` that augments `Cloudflare.Env` or declares `Env`
- no duplicate binding interfaces kept in sync with `wrangler.jsonc`

Wrangler generates the canonical `Env` from the Wrangler config, compatibility
date, compatibility flags, and bindings.

In an Nx workspace, run the project's typegen target so its dependencies and
task pipeline run. Invoke `wrangler types` directly only when no such target
exists:

```bash
nx run <project>:<typegen-target>
# fallback when no typegen target exists:
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

Run typegen after any Wrangler config change, and before typecheck / CI.
Prefer `--check` in CI when the generated file is committed:

```bash
nx run <project>:<typegen-target> -- --check
# fallback when no typegen target exists:
pnpm wrangler types --check
```

Prefer `wrangler types` over `@cloudflare/workers-types` in Worker apps so
types match this Worker's compat date and flags. Keep
`@cloudflare/workers-types` for libraries that cannot run typegen against a
single Wrangler config.
