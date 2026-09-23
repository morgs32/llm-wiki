declare function acquireBackupWorker(): unknown;

const singleton = Symbol.for('example.browserBackup');

/**
 * File: getBrowserBackup/getBrowserBackup.ts
 *
 * A module's directory and filename follow its primary export and abstraction.
 * Rename the path in the same cutover when a factory becomes a singleton
 * accessor, or when any other primary responsibility changes.
 *
 * @bad Keeping `makeBackup/makeBackup.ts` after its primary export becomes
 * `getBrowserBackup` — the stale path advertises construction and ownership
 * semantics the module no longer has.
 * @bad Renaming the export while leaving imports, tests, or documentation on
 * the superseded module path.
 */
export function getBrowserBackup(): unknown {
  const slot = globalThis as typeof globalThis & Record<symbol, unknown>;
  slot[singleton] ??= acquireBackupWorker();
  return slot[singleton];
}
