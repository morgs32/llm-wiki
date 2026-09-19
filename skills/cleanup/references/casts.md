# TypeScript cast lens

Use this lens for `fix-casts`, cast cleanup, or questions about whether an
`as`/angle-bracket assertion is necessary.

## Respect the requested action

- For an audit or review, inventory and explain candidates without editing.
- For removal or cleanup, work one assertion site at a time unless the user
  explicitly asks for a batch.

Inventory current source, not old plans. Prefer a TypeScript-AST scan for
`AsExpression` and `TypeAssertionExpression`; exclude an assertion only when an
`ALLOWED_CAST` comment is immediately above that exact site. Start with the
user's file, then nearby sites, then the same boundary family.

## Remove one site

1. Read the assertion's function signature, imports, surrounding expression,
   and relevant caller or return type.
2. Remove only that assertion. Do not replace it with another assertion or
   change a shared signature, generated declaration, public API, or runtime
   boundary as part of the trial.
3. Run the owning project's narrow typecheck through its repository task
   runner. Add runtime tests only when the site affects runtime behavior.
4. If the check passes, keep the removal.
5. If it fails, leave the assertion removed, stop, and report the exact error,
   what mismatch the cast hid, and the smallest non-cast repair options. The
   visible type error is intentional until the user chooses a repair or asks to
   restore that exact site.

Never add `ALLOWED_CAST`, restore the cast, or substitute a different cast
without explicit approval for that file and assertion. If no reasonable
non-cast repair exists, say so directly.

In an explicitly requested batch, verified removals stay removed and work
continues site by site only until the first blocked removal. Report verified
sites, commands run, the blocker and exact error, and that the blocker remains
cast-free.
