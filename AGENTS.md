# AGENTS.md

**Agents and LLMs may not add `ALLOWED_CAST` comments.** Only the human user may add an `ALLOWED_CAST` marker manually, or authorize one through an explicit prompt or explicit permission in chat. If a cast appears necessary and no permission has been given, stop and ask instead of adding the marker yourself.

**Run npm scripts through Nx.** When running package scripts or npm-style targets in this workspace, use Nx (`nx run ...`, `nx affected ...`, or the appropriate Nx target) instead of direct `pnpm --filter ... run ...` commands so dependency targets and configured task pipelines run too. Use direct package-manager commands only when the user explicitly asks for them or when no Nx target exists. Run `nx` directly — it is a global npm dependency in this workspace; do not prefix with `pnpm` or `npm exec`.

**Do not write new code around deprecated database state or old persisted patterns.** If stale local, dev, or remote state blocks current code, prefer wiping or explicitly migrating that state after user approval. Do not add fallback fields, compatibility schemas, nullable defaults, or alternate runtime paths just to keep deprecated rows working.

**Do not create local wrapper functions for a single call expression.** A binding like `const authorizeActor = props => actorRepo.authorize(props)` is not an abstraction; it hides the only meaningful details and forces readers to jump around for no reuse, no naming gain, and no test boundary. Inline the call at the use site unless the wrapper is reused, carries real policy, or removes substantial repeated structure. System-worker repo and ledger lookup helpers named `get*Repo` are explicit durable-object lookup boundaries, not local one-call wrappers.

**System-worker repo public methods live in same-named method folders.** For `packages/system-worker/src/**/*Repo*`, each public DO RPC/lifecycle instance method should delegate to a same-named `Effect.fn` in a same-named folder/file. Non-public one-consumer helper bodies still stay inline unless they are reused, independently tested, or explicitly approved as `shared/` utilities.

**Please do not give me PARTIAL implementations!** Ship the full behavior (happy path, error path, and any deferred/resume path) in one pass. Do not land stubs, no-op hooks, or “follow-up” wiring when the intended design is already known — especially when the data or result is already computed and only discarded or left unsignaled.

**This is an Effect-first repo.** The essential implementation unit is an `Effect.fn` / Effect value with the domain name. Do **not** create or preserve names ending in `*Effect` (for example `finalizeAccountBlockEffect`) as a workaround for async wrappers. Async `Promise` methods belong only at runtime boundaries such as Durable Object RPC methods, API handlers, or framework entrypoints, and they should be thin wrappers that immediately run or encode the named Effect. When refactoring repo code, prefer moving behavior into the named Effect and leave async methods as minimal boundary glue.

**Do not strip down command objects.** Command ledger/sync/websocket paths should preserve the full encoded command shape they receive (`IEncodedCommand<IExecutedAccountCommand>`, `IEncodedCommand<IFailedAccountCommand>`, etc.). Do not rebuild command payloads field-by-field, null provenance, or switch to pushed/session-only command subsets just to cross a boundary. Storage tables may still have their own lifecycle row shapes where explicitly documented.

## Behaviors

### Work habits

- Think before acting. Read existing files before writing code.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read unless the file may have changed.
- Skip files over 100KB unless explicitly required.
- Test your code before declaring done.
- Keep solutions simple and direct.
- User instructions always override this file.
- Do your best to work around existing changes in a file you want to touch.

### Pull request publication and auto-merge

- Use `chatgpt-codex-connector` for GitHub branch, commit, pull-request, review,
  and auto-merge operations in `morgs32/llm-wiki`. Do not publish through a
  personal-account Git push or `gh`.
- Create a non-`main` topic branch from the current remote `main` SHA before
  creating a publication commit. Never commit or push directly to `main`.
- A request only to create, open, or draft a pull request does not authorize
  merge. Enable auto-merge only when the user has also authorized merge or
  auto-merge for that task.
- Auto-merge is allowed only when the pull request targets `main`, is ready for
  review, and changes only `skills/**` or `README.md`. A pull request that
  changes `AGENTS.md` or `.github/workflows/validate-skills.yml` is never
  auto-merge eligible because those files define this policy and its required
  check.
- Before enabling auto-merge or performing an explicitly authorized direct
  merge, re-read the pull request and verify its exact head SHA and file list;
  require the `validate-skills` check to have succeeded for that SHA; require a
  Codex review to have completed for that SHA with no P0 or P1 finding; and
  require every review thread to be resolved. Automatic review is preferred;
  use `@codex review` when bootstrapping or re-reviewing.
- Enable eligible GitHub auto-merge through `chatgpt-codex-connector`. A pull
  request that changes `AGENTS.md` or the validator workflow instead requires
  explicit user authorization for a direct connector merge after the same
  gates pass. Never bypass protection, force-update `main`, or use an admin
  override.
- Report "auto-merge enabled" separately from "merged". Verify remote `main`
  contains the pull-request commit before refreshing installed skills or
  downstream repository guidance.

### Session hygiene

- Suggest running /cost when a session is running long to monitor cache ratio.
- Recommend starting a new session when switching to an unrelated task.

### Long-running dev servers

When starting a long-lived process (`wrangler dev`, `next dev`, package `dev`, root `pnpm dev` / `nx run-many -t dev`), **do not** treat a fixed sleep as readiness. Background the process, then wait on stdout/stderr with a ready regex (`AwaitShell` / equivalent `pattern`). Only fall back to timed polls if the tool cannot match output.

Pick the pattern from what actually runs (check the package `dev` script if unsure):

1. **Wrangler** (`wrangler dev`): wait for `Ready on http://`
2. **Next.js** (`next dev`, including the runnable examples): wait for `Ready in` (Next also prints `Local:`; either is fine; prefer `Ready in` as the stable “compiled and listening” signal)
3. **Astro docs** (`pnpm dev` → `nx run docs:dev`): wait for Astro's printed `Local` URL
4. **Unknown server**: read the first ready-looking line from the terminal, then wait on that substring — never invent a silent N-second sleep as the primary strategy

Do **not** wait for process exit on `dev` / `wrangler dev` — they stay up. After the ready match, proceed (e2e, curl, RPC). If the pattern never appears, report the terminal tail and stop; do not assume ready after timeout.

### Communication

- Any question asked to the user is blocking. Do not set an auto-resolution timeout, infer an answer, skip the question, or continue past it. Keep the question active until the user explicitly answers it or explicitly withdraws it.
- Be terse. No sycophantic openers or closing fluff.
- Treat me as an expert.
- Be accurate and thorough.
- Give the answer immediately. Provide detailed explanations and restate my query in your own words if necessary after giving the answer.
- Value good arguments over authorities; the source is irrelevant.
- Consider new technologies and contrarian ideas, not just the conventional wisdom.
- You may use high levels of speculation or prediction; flag it for me.
- No moral lectures.
- Discuss safety only when it's crucial and non-obvious.
- If your content policy is an issue, provide the closest acceptable response and explain the content policy issue afterward.
- Cite sources whenever possible at the end, not inline.
- Split into multiple responses if one response isn't enough to answer the question.

### Code output

- Respect my formatting preferences when you provide code.
- Do not wrap `yield*` in parentheses (e.g. `return (yield* effect.pipe(...)) as T`) — use `return yield* effect.pipe(...)` or assign to a const first.
- Preserve code comments; they are usually there for a reason. Remove them only if completely irrelevant after a code change. If unsure, do not remove the comment.
- If I ask for adjustments to code I have provided, do not repeat all of my code unnecessarily. Give just a couple lines before/after any changes. Multiple code blocks are ok.

### Research and docs routing

- Shared pattern source: [`skills/engineering-patterns/references/patterns/`](./skills/engineering-patterns/references/patterns/index.md). Project-local guidance: [`llm-wiki/patterns/`](./llm-wiki/patterns/index.md). Workflow skills: [`.agents/skills/`](./.agents/skills/).
- Every task: use [Docs lookup](#docs-lookup) for keyword-to-section routing.
- Local Effect reference: Effect v4 is cloned to `~/.local/share/effect-solutions/effect` for APIs, examples, and implementation details when docs are not enough.

## Rules

### Do not sprinkle `as const`

Do **not** add `as const` (or `as const satisfies …`) on object literals, schema records, or shape maps unless the user asks for it or TypeScript fails without it. Prefer plain object literals and fix the actual type at the factory, annotation, or call site instead of widening/narrowing via assertion soup.

### Consult architecture docs first

**CONSULT [`wiki/architecture/`](./wiki/architecture/) BEFORE RESPONDING THOUGHTFULLY.** Read the relevant architecture doc and cleanup doc sections (see [Docs lookup](#docs-lookup)) before reasoning about repo roles, finalize vs ledger paths, block ledger flows, or trust boundaries. Do **not** infer target behavior from stale `*Repo` DO method names or WIP glue — the docs describe the intended topology; code may lag.

### Docs stay in sync

When a change moves, renames, inlines, or deletes code that architecture docs, `skills/engineering-patterns/references/patterns/`, `llm-wiki/patterns/`, `AGENTS.md` docs lookup, or `TODOS.md` terminology reference, **update those docs in the same pass**. Do not finish with stale file paths, module procedures, or symbol names and offer doc updates as a follow-up.

### Scope and WIP

Treat the codebase as partially authored by whoever is iterating in the IDE.

- Do **not** "restore", rewrite, prettify imports, refactor call sites, or add dependencies when a file reads like **glue in progress** (e.g. a `return` references a binding that isn't wired yet). Assume **WIP**. Don't stabilize it unless the user asks. Especially if the file is CHANGED from an earlier version created IN THE SAME CHAT!
- If you see a broken file, first check your own chat history to see if the human edited the file in the IDE.
- When fixing a type/build error in one file, do **not** replace intentional local wiring (Effect layers, runtimes, app-specific glue) with a "canonical" shared export from another app or package unless the user asked to unify them — fix the error in place or ask.
- When a request sounds **explicit** or direct, be as **microscopic** as makes sense. Don't add packages, chase type errors elsewhere, or "fix tests" unless that scope appears in their message.
- Do what I ask and **only that**. Do not take it upon yourself to fix type errors or dependency issues that already exist. Tell me about them maybe but do **not** fix things unless I explicitly say so.
- If you know what I'm asking for (which is often what I'm telling you), do **not** get clever. Do what I ask and then prompt me to look at something broken **before** trying to fix it yourself.
- Do **not** do extra or alternate work in the same pass: no "helpful" refactors, convenience wrappers, import rewires, or cleanups in files they did not name, unless they explicitly ask for that scope.
- **Bad** — The user asked to add or export a default in one place (e.g. `defaultManagedRuntime` next to `makeSession`). The agent also removed the same kind of default from another module, added a new helper API, or changed call sites, without being asked.
- **Good** — Make the exact change requested; leave everything else as-is. If something else is worth doing, say it in the reply; do not bundle it into the same diff unless the user asked for a broader pass.

DO NOT GIVE ME HIGH LEVEL SHIT. IF I ASK FOR FIX OR EXPLANATION, I WANT ACTUAL CODE OR EXPLANATION! I DON'T WANT "Here's how you can blablabla"

DO NOT ADD UNREQUESTED FUNCTIONALITY. IF I GIVE YOU A COMPONENT TO ADD WITH MOCK DATA, USE MOCK DATA. DO NOT CHANGE THE PROPS OR ARGS ON ANY OTHER COMPONENT OR FUNCTION.

### Ask before abstractions

I am explicitly asking for this because it keeps happening and I do not want surprise architecture changes:

- Before adding any new helper/function/wrapper/utility/service/abstraction, **ask me first** and get explicit confirmation.
- If you think an abstraction is better, stop and prompt me with the proposed name, purpose, and exact call sites.
- If I did not approve it, do not add it.

### Ask before new type assignments

Before adding any new `type` alias, `interface`, or other named type assignment, **ask me first** and get explicit confirmation.

- Prompt with the proposed name, shape, and exact use sites (or why it must be exported).
- Prefer inlining single-use shapes at the use site — e.g. `satisfies Readonly<{ … }>` on the return — instead of a file-local alias used once.
- If I did not approve it, do not add it.

### Ask before runtime-boundary moves

The CLI, dispatch Worker, browser packages, and `system-worker` execute in different runtimes. Do not treat those boundaries as interchangeable.

- Before moving validation, RPC methods, or trust-boundary checks between **CLI**, **dispatch-worker**, browser packages, or **system-worker**, **ask first** with options and tradeoffs.
- If a dependency fails in Workers (e.g. `eval` / `new Function` / dynamic codegen), **state the runtime error and constraint**, then propose fixes — do **not** silently relocate logic to CLI or another package.
- Removing or adding a public RPC is an architectural change; get explicit approval.

### No re-exports outside barrels or worker entrypoints

Per [no re-exports outside `index.ts` or worker entrypoints](./skills/engineering-patterns/references/patterns/naming/):

- Do **not** re-export anything — types, functions, classes, constants, schemas — from a runtime/feature module (`utils/*`, `session/*`, `*Repo/*`, `types.ts`, etc.). That includes `export { … } from '…'` and `export type { … } from '…'`.
- **Only** intentional package **`index.ts`** barrels and **Cloudflare Worker entrypoints** (e.g. `SystemWorker.ts`, `Worker.ts`) may aggregate exports.
- Import from the module that **defines** the symbol (e.g. `ISessionCursorId` from `@zerospin/core/models/types`, not `@zerospin/core/utils/types`).

### No one-consumer shape files

Do **not** create a dedicated file for a shape, schema const, or table binding used by **only one** sibling module (e.g. `actorRepoMutationShape.ts` imported solely from `actorRepoTables`). Define it inline in the module that owns the table — typically `{repo}RepoTables` next to the repo's `makeTable` shapes for that repo. Details: [Good vs bad: repo table shapes live in `*RepoTables`](./skills/engineering-patterns/references/patterns/naming/).

### No bolt-on type fixes

When a generic factory's return type does not match, **fix the factory or the base type** — never paper over the error. Annotating `: ISystem` to silence a missing field, spreading `makeSystem(...)` and bolting on `id` outside the factory, or returning `SomeGeneric<...> & { name: Literal }` because the base type widens `name` to `string` are **shameful bolted-on fixes**. They throw away the inference the factory exists for and copy bad templates into the next file. If you are about to propose one of these, stop — the fix belongs in `@zerospin/core`, not at the call site. Details: [makeSystem system entry exports](./llm-wiki/patterns/typescript/), [intersection return types on generic factories](./llm-wiki/patterns/typescript/).

### Plan documents

All plans and specs live under `.plans/`:

- design specs → `.plans/specs/XXX-spec-<topic>.md` with a zero-padded three-digit prefix
- implementation plans → `.plans/plans/XXX-plan-<topic>.md` using the exact same prefix and topic as their source spec
- determine a new `XXX` for every new spec/plan pair or standalone plan by checking filenames recursively anywhere under `.plans/` and using one more than the highest three-digit prefix; ignore legacy filenames without a numeric prefix
- a plan derived from a spec reuses the spec's `XXX`; never allocate a second number for the pair
- once a spec has been turned into an implementation plan, move the spec to `.plans/archived/` and preserve its filename
- after fully implementing and verifying work from a plan, move that plan to `.plans/archived/` and preserve its filename; do not archive the plan while implementation remains incomplete or unverified
- update an existing plan in place when the user is revising an existing plan file
- number plan bullets and steps with ordered lists; do not use unordered `-` bullets in plan documents
- do **not** write plans or specs under `plans/`, `docs/superpowers/plans/`, or `docs/superpowers/specs/`

When reviewing a plan, **always present the issues or suggestions as a numbered list** so each item can be referenced by number.

### Doc placement

- If guidance is mostly static reference material, it belongs in `skills/engineering-patterns/references/patterns/**` or `llm-wiki/patterns/**`.
- If guidance tells an agent how to execute a multi-step workflow, it can remain a skill unless you intentionally standardize it as a repo doc.

### LLM Wiki ingest

Post-commit hook (`.llmwiki/ingest.sh`) updates `wiki/` from code diffs. **This section is the operating manual** for ingest, lint, and manual wiki edits — there is no separate schema file.

**Role:** Source of truth is code at `HEAD`. Only modify `wiki/` (hook commits for you). Produce draft reference docs, not polished product copy. Prefer `> TODO-VERIFY:` over fabricated claims.

**Before ingest:** Read `.llmwiki/config.yml` (enabled doc types, include/exclude globs), `wiki/index.md`, last 5 entries of `wiki/log.md`.

**Wiki layout:**

```
wiki/
  index.md, log.md, overview.md, glossary.md
  architecture/   ← subsystem + *Api gateway delegation docs
  api/            ← exported package surface (@zerospin/core, etc.)
  user/           ← only when doc_types.user: true
  decisions/, concepts/, sources/
```

**Architecture pages (`wiki/architecture/`):** mermaid diagrams; **Trigger** (numbered `*Api` / entrypoint path); **Annotated methods** / **Annotated workflow steps** (SystemWorker → `*Repo`); **Callers**. Gateway docs (`AccountApi`, `FrontendApi`, …) live here, not `wiki/api/`. Links from `wiki/architecture/Foo.md`: `../../packages/...`, `../../examples/...`, sibling `./Other.md` — no root-absolute repository links.

**Page frontmatter** (required except `index.md`, `log.md`):

```yaml
---
title: ...
type: module | api | ...
updated: YYYY-MM-DD
sources:
  - path: packages/foo/bar.ts
    sha: <git hash-object output>
    lines: 1-120
---
```

Refresh `sources[].sha` after edits (`git hash-object <path>`). `freshness.sh` uses these.

**Hard rules:**

1. Cite or do not claim — `(path:start-end)` on every non-trivial statement.
2. Never describe APIs or behavior not at HEAD.
3. No runtime/UI behavior unless tests confirm it.
4. No citations outside this repo.
5. On diff vs page conflict: `> CONTRADICTION:` blockquote + fix + note in `log.md`.
6. Do not duplicate pattern subtrees — link [`skills/engineering-patterns/references/patterns/`](./skills/engineering-patterns/references/patterns/index.md) and [`llm-wiki/patterns/`](./llm-wiki/patterns/index.md).
7. Respect target-vs-current naming in [`TODOS.md`](./TODOS.md).

**Ingest output:** Update affected pages; create pages for new public surface when doc type enabled; refresh glossary/index/overview when warranted; append `## [YYYY-MM-DD HH:MM] ingest | <sha> | <subject>` to `wiki/log.md`. Do not commit — hook does `wiki: update (<sha>)`.

Manual architecture edits: use [update-architecture](./.agents/skills/update-architecture/SKILL.md); preserve frontmatter `sources[]`.

Use this table to route requests to the right pattern sections (by keyword). See [`skills/engineering-patterns/references/patterns/index.md`](./skills/engineering-patterns/references/patterns/index.md) and [`llm-wiki/patterns/index.md`](./llm-wiki/patterns/index.md).

| Doc                                                                                               | Section                                                                                                                                                                                        | Keywords                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `./skills/engineering-patterns/references/patterns/index.md`                                                           | [Cleanup Index](./skills/engineering-patterns/references/patterns/index.md)                                                                                                                                         | cleanup index, docs routing, agent guidance, maintenance checklist, cleanup mode, case studies, effect, tooling                                                                                                                                                                |
| `./llm-wiki/patterns/cases/index.md`                                            | [Case study index](./llm-wiki/patterns/cases/index.md)                                                                                                                       | cleanup case, inline, bloated, smell, before after, cleanup examples                                                                                                                                                                                                           |
| `./.agents/skills/cleanup/SKILL.md`                                                               | [When to invoke](./.agents/skills/cleanup/SKILL.md#when-to-invoke)                                                                                                                             | cleanup, /cleanup, /cleanup-mode, cleanup pass, simplify, inline, import cleanup, judge, prune, pass mode, case studies, codify cleanup, code-shape cleanup                                                                                                                    |
| `./.agents/skills/update-llm-wiki/SKILL.md`                                                       | [When to use](./.agents/skills/update-llm-wiki/SKILL.md#when-to-use)                                                                                                                           | update llm wiki, /update-llm-wiki, good vs bad, case study, codify lesson, pattern subtree, @bad jsdoc                                                                                                                                                                         |
