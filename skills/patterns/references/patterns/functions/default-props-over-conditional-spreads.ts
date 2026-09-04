/**
 * Prefer defaulted props destructuring (and callee null/empty sentinels) over
 * conditional object spreads when forwarding optional factory arguments.
 *
 * @bad Do not forward with `...(baseClass === undefined ? {} : { baseClass })`.
 * @bad Do not keep a callee prop optional only so callers can omit the key —
 * prefer `null | T` (or an empty default) and always pass the binding.
 */
export function makeBoundRepo(props: {
  baseClass?:
    | null
    | (new (ctx: unknown, env: unknown) => unknown);
  namePattern: string;
}) {
  const { baseClass = null, namePattern } = props;
  return makeDORepo({
    baseClass,
    namePattern,
  });
}

declare function makeDORepo(props: {
  baseClass:
    | null
    | (new (ctx: unknown, env: unknown) => unknown);
  namePattern: string;
}): unknown;
