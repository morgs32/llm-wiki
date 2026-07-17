---
title: Log
type: meta
updated: 2026-07-16
---

# Log

Append-only chronological record for the fresh public repository. Every ingest,
lint, and query entry starts with
`## [YYYY-MM-DD HH:MM] <op> | <commit-sha> | <one-line summary>`.

## [2026-07-16 22:41] ingest | working-tree | session signatures, React push ownership, and mock provider

1. Documented session-owned signature generation, provider-owned automatic push, and the narrow DevTools manual-push capability.
2. Documented the local-only React mock provider's typed fixtures, real SQLite initialization, optimistic staging, unsupported remote boundary, and exactly-once cleanup paths.
