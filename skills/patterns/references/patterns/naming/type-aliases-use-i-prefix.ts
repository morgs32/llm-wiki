/**
 * Named domain types — interfaces and aliases — start with `I`.
 * Extractor utilities use `Infer*` instead (see `infer-utility-types.ts`).
 *
 * @bad `export interface Command<…>` — PascalCase interface without `I`.
 * @bad `export type MachineStateTuple = …` — PascalCase alias without `I`.
 */
export interface ICommand<NAME extends string> {
  readonly name: NAME;
}

export type IAnyCommand = ICommand<string>;

export type IMachineStateTuple = readonly [
  { readonly key: string },
  ...Array<{ readonly key: string }>
];
