import { Schema } from 'effect';

declare const PropsSchema: Schema.Schema<{ readonly name: string; readonly input: unknown }>;
declare const StrictParseOptions: { readonly onExcessProperty: 'error' };

/**
 * Do not extract a function that has one caller and wraps one simple call.
 * Keep the call at the use site. Extract only when the helper owns a block
 * with its own invariant.
 *
 * @bad A sibling-file wrapper whose body is one `Schema.decodeUnknownSync(...)`
 * imported only by the factory.
 * @bad A same-file `const decodeProps = (input) => Schema.decodeUnknownSync(...)(input)` used once.
 * @bad Creating that file to satisfy one export per file.
 */
export const makeThing = (props: unknown) => {
  const decoded = Schema.decodeUnknownSync(
    PropsSchema,
    StrictParseOptions,
  )(props);

  return decoded;
};
