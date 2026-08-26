import type { Effect, Schema } from 'effect';

/**
 * Keep one canonical descriptor type for a resource. Inline related shapes
 * into that descriptor, and derive construction or instance views from it
 * (`Parameters`, indexed access, or an `Infer*` extractor). Do not publish a
 * constellation of sibling `I*` aliases for every piece of the same resource.
 *
 * @bad `IStateTaggedStruct`, `IStateMakeFields`, `IStateInstance`, and
 * `IStateSchema` exported beside `IState` when they only restate its fields.
 * @bad Exporting `IStateMakeFields` for a single factory that can use
 * `Parameters<IState<NAME, INPUT>['make']>[0]`.
 * @bad A public tag-only `IStateContext` whose name competes with
 * `InferStateContext` when the actor only needs a file-local `{ _tag: string }`.
 */
export type IState<
  NAME extends string = string,
  INPUT extends Schema.Struct<Schema.Struct.Fields> = Schema.Struct<any>
> = {
  readonly name: NAME;
  readonly input: INPUT;
  readonly schema: Schema.ConstraintCodec<
    Schema.Schema.Type<Schema.TaggedStruct<NAME, INPUT['fields']>>,
    Schema.Codec.Encoded<Schema.TaggedStruct<NAME, INPUT['fields']>>,
    Schema.Codec.DecodingServices<Schema.TaggedStruct<NAME, INPUT['fields']>>,
    Schema.Codec.EncodingServices<Schema.TaggedStruct<NAME, INPUT['fields']>>
  >;
  readonly make: (
    fields: Schema.Struct.MakeIn<INPUT['fields']>
  ) => Effect.Effect<
    Schema.Schema.Type<Schema.TaggedStruct<NAME, INPUT['fields']>>
  >;
};

export type InferStateContext<STATE> = STATE extends {
  readonly schema: infer STATE_SCHEMA extends Schema.Constraint;
}
  ? Schema.Schema.Type<STATE_SCHEMA>
  : never;

type IStateMakeSchema<
  NAME extends string,
  INPUT extends Schema.Struct<Schema.Struct.Fields>
> = IState<NAME, INPUT>['schema'] & {
  readonly makeEffect: (
    fields: Parameters<IState<NAME, INPUT>['make']>[0]
  ) => Effect.Effect<
    Effect.Success<ReturnType<IState<NAME, INPUT>['make']>>,
    unknown
  >;
};

declare const Generated: IStateMakeSchema<'idle', Schema.Struct<{ draft: typeof Schema.String }>>;

export const make = (
  fields: Parameters<IState<'idle', Schema.Struct<{ draft: typeof Schema.String }>>['make']>[0]
) => Generated.makeEffect(fields);
