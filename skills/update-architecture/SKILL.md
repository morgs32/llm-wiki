---
name: update-architecture
description: >-
  Sync wiki/architecture workflow docs with source code: sequence diagrams,
  their Annotated workflow steps, Trigger steps, other mermaid diagrams, and
  nested citation bullets. Use when the user asks to update architecture docs,
  workflow docs, mermaid in wiki/architecture, annotated-step citations, or
  says update-architecture.
---

# update-architecture

Keep `wiki/architecture/*.md` workflow docs aligned with the code they describe. Architecture is best demonstrated as interaction, so strongly prefer at least one Mermaid `sequenceDiagram` with matching `## Annotated workflow steps` in every architecture doc.

The post-commit LLM Wiki ingest hook may also update these pages. When editing manually or via an agent pass, preserve YAML frontmatter `sources[]` blocks (path, sha, lines) and refresh SHAs when cited files change.

## When to apply

- The user changed a workflow, API entrypoint, or repo path and wants the architecture doc updated.
- The user says **update-architecture**, **update mermaid**, or points at `wiki/architecture/` with code that drifted.
- Stay within the **named doc(s)** unless they ask for a broader pass.

## Workflow

1. **Read the source first**  
   Open the implementation files the doc links to (Api, entrypoint, workflow, repo). Trace the real call order — do not edit the doc from memory.

2. **Default every architecture doc to a sequence diagram**
   - Add or update a Mermaid `sequenceDiagram`, including when the doc does not already have one. Show the most meaningful causal path at the doc's abstraction level: who initiates the work, which runtime/capability/repo boundaries participate, what returns, and where real failures or branches occur.
   - Pair every sequence diagram with `## Annotated workflow steps` immediately after the diagram's closing fence. The annotated list must have one numbered item per diagram message, in the same number, order, and meaning.
   - If a specific doc genuinely does not seem to warrant a meaningful sequence diagram, do not omit it unilaterally. Stop and ask the user to confirm leaving that doc without one, explaining concretely why a sequence would be artificial or uninformative. The question is blocking; continue only after the user answers.
   - **Flowchart** — supplement the sequence diagram with lifecycle or workflow phases after the trigger (named Effects, SystemWorker/Repo calls, branch gates) when the doc already has one or phase topology is materially clearer that way.

3. **Update the Trigger section**  
   Numbered list mirroring the **triggering** code path (for example, a CLI command, package entrypoint, or `*Api` method). One numbered step per phase; nest sub-steps for entrypoint/repo delegation.

4. **Update Annotated workflow steps**  
   Numbered list for the workflow or lifecycle implementation itself (`Effect.fn`, runtime boundary, repo calls, returned receipts, and branch conditions). Place it immediately after its sequence diagram and keep it separate from Trigger so invocation and implementation remain distinct. One numbered item per sequence-diagram message, same number, order, and meaning.
   Nested unordered bullets hold the source citations. Do **not** trail a parenthetical comma-separated link list on the numbered item.
   Each bullet is one working Markdown source link, then an em dash, then the **relevant fact at that exact range** — the call, check, or return that range uniquely performs — and its required `(path:start-end)` citation. Do not restate the parent numbered prose. Do not summarize the whole file. Dual paths (aggregate vs service, success vs failure) each get their own bullet because the relevant happening differs.

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
   - [`getAggregateFrontendApi.ts:78-88`](../../packages/system-worker/src/GatewayApi/getAggregateFrontendApi/getAggregateFrontendApi.ts#L78-L88) — `systemRepo.getActiveGenerationId()` through `makeAsync`/`decodeRpc`; a throw becomes `gateway-infrastructure-failure`. (`packages/system-worker/src/GatewayApi/getAggregateFrontendApi/getAggregateFrontendApi.ts:78-88`)
   - [`getServiceFrontendApi.ts:69-79`](../../packages/system-worker/src/GatewayApi/getServiceFrontendApi/getServiceFrontendApi.ts#L69-L79) — same active-generation snapshot on the service getter. (`packages/system-worker/src/GatewayApi/getServiceFrontendApi/getServiceFrontendApi.ts:69-79`)
```

Do **not** attach citations as a trailing parenthetical list:

```markdown
2. Each getter snapshots the active generation
   ([`getAggregateFrontendApi.ts:78-88`](../../packages/system-worker/src/GatewayApi/getAggregateFrontendApi/getAggregateFrontendApi.ts#L78-L88),
   [`getServiceFrontendApi.ts:69-79`](../../packages/system-worker/src/GatewayApi/getServiceFrontendApi/getServiceFrontendApi.ts#L69-L79)).
```

## Mermaid conventions

- **Sequence**: use `sequenceDiagram` as the default architecture view for every doc. Name participants after runtime boundaries (`CLI`, `Dispatch Worker`, `SelfHostedZerospinApis`, `SystemWorker`). Show `makeAsync` / `decodeRpc` where the source uses them. Use `alt` for missing-input failures and real branch gates. Leave a doc without a sequence diagram only after the user confirms that specific exception.
- **Sequence invocation labels**: label `->>` arrows with the call-site binding and method — `{receiverBinding}.{method}()` or `{receiverBinding}.{method}(...)` — not the Mermaid participant alias and not a prose summary. Always append `()` when the public method takes no arguments, or `(...)` when it takes arguments; do not omit parentheses and do not list argument names or values on the arrow. Strip `this.` / `props.` from `{receiverBinding}`. Family diagrams may keep wildcards such as `gatewayApi.get*FrontendApi(...)` or `systemApi.*(...)`. Good: `Gateway->>SystemRepo: systemRepo.getActiveGenerationId()`, `Caller->>Gateway: gatewayApi.get*FrontendApi(...)`. Bad: `gatewayApi.get*FrontendApi` (missing parens), `getActiveGenerationId()` (missing binding), `SystemRepo.getActiveGenerationId()` (participant alias), `acquire active generationId` (prose). Return arrows (`-->>`) keep result payloads; user/process steps and unnamed inline checks stay short predicates.
- **Flowchart**: use one subgraph per public workflow or lifecycle. Node labels = method or phase names. Branch labels = `"yes"` / `"no"` on the condition that matches code.

## Checklist before finishing

- [ ] Every architecture doc has a sequence diagram, or the user explicitly confirmed the specific exception.
- [ ] Each sequence diagram matches the meaningful causal path through the relevant runtime, capability, or repo boundaries.
- [ ] Each sequence diagram is followed immediately by matching Annotated workflow steps, with one numbered item per message in the same order and meaning.
- [ ] Any flowchart present matches the implementation's named phases and branch conditions.
- [ ] Trigger and Annotated sections are separate and numbered consistently.
- [ ] Annotated-step citations are nested bullets; each link is followed by the relevant fact at that range and its `(path:start-end)` citation.
- [ ] Every ``[`…`](…)`` link uses a relative path from the doc file.
- [ ] No behavior invented — each step traceable to a line in source.
- [ ] Frontmatter `sources` SHAs refreshed when cited files changed.
