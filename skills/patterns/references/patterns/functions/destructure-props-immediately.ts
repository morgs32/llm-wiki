import { Effect } from 'effect';

/**
 * Keep `props` as the only function argument, then destructure on the first
 * line of the body. Do this even when the rest of the body is
 * `return yield* Effect.gen(...)`.
 *
 * @bad Do not destructure the parameter: `function* ({ request, runtime })` —
 * take `props`, then `const { … } = props`.
 * @bad Do not thread `props.request` / `props.runtime` through the body,
 * including an inner `Effect.gen`.
 */
export const getFrontendApi = Effect.fn('getFrontendApi')(function* (props: {
  identityResolver: {
    resolve: (props: { apiKey: string }) => Effect.Effect<{ systemId: string }>;
  };
  request: { apiKey: string };
  runtime: { name: string };
  systemRepo: { getActiveGenerationId: () => Effect.Effect<string> };
}) {
  const { identityResolver, request, runtime, systemRepo } = props;
  return yield* Effect.gen(function* () {
    const generationId = yield* systemRepo.getActiveGenerationId();
    const claims = yield* identityResolver.resolve({
      apiKey: request.apiKey,
    });
    return { claims, generationId, runtime };
  });
});
