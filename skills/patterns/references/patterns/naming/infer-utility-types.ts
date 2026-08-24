/**
 * Domain types use `I`. Conditional extractors use `Infer` — not `I`.
 *
 * @bad `export type ICommandFrom<VALUE>` — extractor with `I` prefix.
 * @bad `export type CommandFrom<VALUE>` — extractor without `Infer`.
 * @bad `export type AttributesOf<STATE>` — `Of` suffix without `Infer`.
 */
export interface ICommand<
  NAME extends string,
  FROM extends readonly unknown[],
  PAYLOAD,
  SUCCESS,
  ERROR,
  REQUIREMENTS
> {
  readonly name: NAME;
  readonly from: FROM;
  readonly payload: PAYLOAD;
  readonly program: (payload: PAYLOAD) => SUCCESS;
}

export type InferCommandFrom<VALUE> = VALUE extends {
  readonly from: infer FROM extends readonly unknown[];
}
  ? FROM[number]
  : never;

export type InferCommandPayload<VALUE> = VALUE extends {
  readonly payload: infer PAYLOAD;
}
  ? PAYLOAD
  : never;

export type InferCommandSuccess<VALUE> = VALUE extends ICommand<
  any,
  any,
  any,
  infer SUCCESS,
  any,
  any
>
  ? SUCCESS
  : never;
