/**
 * Use the generated global `Env` in Worker / Durable Object code.
 *
 * @bad Hand-written `src/env.ts` or `src/env.d.ts` that duplicates wrangler.jsonc bindings.
 * @bad `import type { Env } from '../env.js'` instead of the typegen global.
 * @bad Recreating the binding surface for another package — use `type Env = globalThis.Env`.
 */
export default {
  async fetch(_req: Request, env: Env) {
    const db = env.SOME_BINDING;
    return new Response(db === undefined ? 'missing' : 'ok');
  },
};
