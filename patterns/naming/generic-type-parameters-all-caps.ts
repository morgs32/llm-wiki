/**
 * Generic type parameters use screaming snake case (`NAME`, `FROM`, `PAYLOAD`).
 *
 * @bad PascalCase generics such as `<Name, From, Payload>` on `ICommand`.
 * @bad Single-letter generics except where a library convention owns the name.
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
  readonly program: (
    payload: PAYLOAD
  ) => { readonly success: SUCCESS; readonly error: ERROR; readonly requirements: REQUIREMENTS };
}

export const makeCommand = <
  const NAME extends string,
  const FROM extends readonly unknown[],
  PAYLOAD,
  SUCCESS,
  ERROR,
  REQUIREMENTS
>(
  name: NAME,
  options: {
    readonly from: FROM;
    readonly payload: PAYLOAD;
    readonly program: (
      payload: PAYLOAD
    ) => { readonly success: SUCCESS; readonly error: ERROR; readonly requirements: REQUIREMENTS };
  }
): ICommand<NAME, FROM, PAYLOAD, SUCCESS, ERROR, REQUIREMENTS> =>
  Object.freeze({
    name,
    from: options.from,
    payload: options.payload,
    program: options.program,
  });
