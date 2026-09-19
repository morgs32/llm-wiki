import { Hono } from 'hono';

/**
 * Generate a distinct Wrangler env interface for Hono instead of colliding with the Worker global `Env`.
 *
 * `wrangler types --env-interface CloudflareBindings` (via the Nx typegen target when one exists).
 *
 * @bad Reusing the generated global `Env` as Hono's `Bindings` type.
 * @bad Reading secrets from `process.env` without `nodejs_compat_populate_process_env`.
 */
const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get('/orders', c => {
  const queue = c.env.ORDER_QUEUE;
  return c.json({ ok: Boolean(queue) });
});

export { app };
