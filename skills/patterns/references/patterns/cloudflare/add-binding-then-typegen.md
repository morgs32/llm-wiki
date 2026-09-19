# Adding a binding or var

1. Add non-secret bindings in `wrangler.jsonc` (`vars`, `r2_buckets`,
   `kv_namespaces`, `durable_objects`, `services`, etc.).
2. Run the typegen target (or `wrangler types` when none exists).
3. Use `env.YOUR_BINDING` — the generated `Env` is the source of truth.

Do not also declare that binding in a custom `env.d.ts` / `env.ts`.
Do not put secret values in `vars`.

Declare secret **names** in config, not values:

```jsonc
{
  "secrets": {
    "required": ["API_KEY"]
  }
}
```

Local values live in `.dev.vars` (gitignored). Production values are set with
`wrangler secret put` / `wrangler secret bulk`. `wrangler types` reads
`secrets.required` for `Env` — it does not need the remote secret value.

For Workers RPC, pass the callee Wrangler configs too so `Service<>` and
`DurableObjectNamespace<>` get a type parameter:

```bash
nx run <project>:<typegen-target> -- -c ./wrangler.jsonc -c ../other-worker/wrangler.jsonc
# fallback when no typegen target exists:
pnpm wrangler types -c ./wrangler.jsonc -c ../other-worker/wrangler.jsonc
```
