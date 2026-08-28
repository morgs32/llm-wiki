---
name: update-architecture
description: >-
  Sync wiki/architecture workflow docs with source code: mermaid diagrams,
  Trigger steps, and Annotated workflow steps with nested citation bullets.
  Use when the user asks to update architecture docs, workflow docs, mermaid
  in wiki/architecture, annotated-step citations, or says update-architecture.
---

# update-architecture

Keep `wiki/architecture/*.md` workflow docs aligned with the code they describe.

The post-commit LLM Wiki ingest hook may also update these pages. When editing manually or via an agent pass, preserve YAML frontmatter `sources[]` blocks (path, sha, lines) and refresh SHAs when cited files change.

## When to apply

- The user changed a workflow, API entrypoint, or repo path and wants the architecture doc updated.
- The user says **update-architecture**, **update mermaid**, or points at `wiki/architecture/` with code that drifted.
- Stay within the **named doc(s)** unless they ask for a broader pass.

## Workflow

1. **Read the source first**  
   Open the implementation files the doc links to (Api, entrypoint, workflow, repo). Trace the real call order — do not edit the doc from memory.

2. **Update both diagram types when the doc has them**
   - **Sequence diagram** — trust-boundary and RPC path (who calls whom, `makeAsync`, `decodeRpc`, early failures, conditional branches).
   - **Flowchart** — lifecycle or workflow phases after the trigger (named Effects, SystemWorker/Repo calls, branch gates).

3. **Update the Trigger section**  
   Numbered list mirroring the **triggering** code path (for example, a CLI command, package entrypoint, or `*Api` method). One numbered step per phase; nest sub-steps for entrypoint/repo delegation.

4. **Update Annotated workflow steps**  
   Numbered list for the workflow or lifecycle implementation itself (`Effect.fn`, runtime boundary, repo calls, returned receipts, and branch conditions). Separate it from Trigger so invocation and implementation remain distinct. One numbered item per sequence-diagram message, same number, order, and meaning.
   Nested unordered bullets hold the source citations. Do **not** trail a parenthetical comma-separated link list on the numbered item.
   Each bullet is one working Markdown source link, then an em dash, then the **relevant fact at that exact range** — the call, check, or return that range uniquely performs. Do not restate the parent numbered prose. Do not summarize the whole file. Dual paths (aggregate vs service, success vs failure) each get their own bullet because the relevant happening differs.

5. **Use preview-safe relative links**  
   From `wiki/architecture/Foo.md`:
   - Source under repo root: `../../packages/...`, `../../examples/...`, `../../docs/...`
   - Sibling architecture doc: `./OtherWorkflow.md`
   - Do **not** use root-absolute paths like `/packages/...` — Markdown preview will not open them.

6. **Link labels**  
   Prefer ``[`Symbol.method`](relative/path.ts)`` or ``[`file.ts`](relative/path.ts)``. Match symbol names in the linked file. Annotated-step citation bullets that target a range use ``[`file.ts:78-88`](relative/path.ts#L78-L88)``.

7. **Keep scope tight**  
   Update only the sections that drifted. Do not rewrite unrelated architecture docs or fix root-absolute links elsewhere unless asked.

8. **Frontmatter**  
   After substantive edits, update `sources[].sha` via `git hash-object <path>` for each cited file and bump `updated`.

## Section templates

### Trigger (CLI → dispatch boundary)

```markdown
## Trigger

1. [`devFn`](../../packages/cli/src/dev/devFn.ts)
   1. Load and validate the project configuration.
   2. Generate the local Wrangler configuration and start the dispatch Worker.
2. [`E2eWorker.fetch`](../../packages/dispatch-worker/src/Worker.ts)
   1. Resolve `SelfHostedZerospinApis` by the stable self-hosted system-worker name.
   2. Forward the request to that Durable Object.
```

### Annotated workflow steps (lifecycle implementation)

Numbered item = diagram-message meaning. Nested bullets = citations. After each link, name what that range does.

```markdown
## Annotated workflow steps

1. Each getter snapshots the active generation before constructing the returned capability
   - [`getAggregateFrontendApi.ts:78-88`](../../packages/system-worker/src/GatewayApi/getAggregateFrontendApi/getAggregateFrontendApi.ts#L78-L88) — `systemRepo.getActiveGenerationId()` through `makeAsync`/`decodeRpc`; a throw becomes `gateway-infrastructure-failure`.
   - [`getServiceFrontendApi.ts:69-79`](../../packages/system-worker/src/GatewayApi/getServiceFrontendApi/getServiceFrontendApi.ts#L69-L79) — same active-generation snapshot on the service getter.
```

Do **not** attach citations as a trailing parenthetical list:

```markdown
2. Each getter snapshots the active generation
   ([`getAggregateFrontendApi.ts:78-88`](../../packages/system-worker/src/GatewayApi/getAggregateFrontendApi/getAggregateFrontendApi.ts#L78-L88),
   [`getServiceFrontendApi.ts:69-79`](../../packages/system-worker/src/GatewayApi/getServiceFrontendApi/getServiceFrontendApi.ts#L69-L79)).
```

## Mermaid conventions

- **Sequence**: name participants after runtime boundaries (`CLI`, `Dispatch Worker`, `SelfHostedZerospinApis`, `SystemWorker`). Show `makeAsync` / `decodeRpc` where the source uses them. Use `alt` for missing-input failures and real branch gates.
- **Flowchart**: use one subgraph per public workflow or lifecycle. Node labels = method or phase names. Branch labels = `"yes"` / `"no"` on the condition that matches code.

## Checklist before finishing

- [ ] Sequence diagram matches the triggering path through the first public runtime or repo boundary.
- [ ] Flowchart matches the implementation's named phases and branch conditions.
- [ ] Trigger and Annotated sections are separate and numbered consistently.
- [ ] Annotated-step citations are nested bullets; each link is followed by the relevant fact at that range.
- [ ] Every ``[`…`](…)`` link uses a relative path from the doc file.
- [ ] No behavior invented — each step traceable to a line in source.
- [ ] Frontmatter `sources` SHAs refreshed when cited files changed.
