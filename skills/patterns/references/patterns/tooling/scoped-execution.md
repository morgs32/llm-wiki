# Scoped execution and context use

## Exploration and scope

- Read the named file or bounded source range first when the location is known. Search before loading whole files or indexes; reuse findings until relevant files change. Do not skip required evidence merely because a file is large.
- Use the repository's routing for the task: target/dependency questions use Nx tooling; architecture questions use relevant docs and source. Do not run every discovery tool or load unrelated skills for each task.
- Graphs and generated indexes locate evidence; verify current source before editing or claiming behavior. Ranked results do not establish exhaustive coverage.
- Complete the requested behavior, including error and resume paths. Preserve unrelated WIP; do not stabilize unfinished glue or substitute another application's wiring. Do not broaden scope to satisfy unrelated failures.
- Read only directly relevant guidance. An existing example is not a universal requirement. Correct or consolidate existing instructions before adding a standing rule; distinguish user decisions, repository invariants, tool requirements, and incidental implementation choices.

## Task execution

- Use Nx for existing workspace targets, following the workspace's package-manager invocation guidance. Do not require a global Nx installation.
- Default to one project/target. For multiple projects, use one task graph with an explicit project list; omit that list only for requested whole-workspace work. For affected runs, select the intended files or revision range so unrelated WIP does not enlarge the task.
- Inspect relevant target and dependency configuration once and reuse it while current. Let one task graph schedule shared dependencies; do not launch overlapping invocations that rebuild the same dependencies or write the same outputs.
- Preserve dependency execution and caching. Skip dependencies only when their required outputs are demonstrably current. Do not disable caches merely to obtain a fresh-looking log.
- Do not use `nx exec` as a general shell wrapper: it can execute per selected project. Run read-only shell commands directly. If no suitable Nx target exists, run the native tool on explicitly scoped files.
- Run the smallest checks that establish the requested behavior, including required dependencies. Do not repeat passing checks without relevant changes or new evidence, or broaden verification just because additional targets exist.
- Save verbose logs outside the repository. Inspect summaries and bounded failure excerpts; do not return complete successful logs to the conversation. Identify unrelated blockers and report them without repairing or exhaustively investigating them.

## Budget and session hygiene

- Honor explicit token, cost, time, or execution budgets. Check usage at meaningful phase boundaries and stop for direction at the agreed limit. Do not invent or claim an enforced spending cap.
- Where `ccusage` is available, use `ccusage codex session` with date filters and JSON, selecting only the current session. Costs are API-equivalent estimates, not actual bills; this reporting is not an enforced cap.
- Recommend a new session when switching to unrelated work.

## Long-running servers

- Wait for actual ready output rather than a fixed sleep or a task-graph success message. Use an output matcher when available; otherwise bounded polling is acceptable.
- Choose the signal from the actual server: Wrangler `Ready on http://`, Next.js `Ready in`, Astro's printed `Local` URL. For another server, inspect its output to identify the signal.
- Do not wait for a dev server to exit. If readiness fails, report the bounded log tail and stop; after readiness, verify the relevant route or RPC.
