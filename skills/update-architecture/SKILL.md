---
name: update-architecture
description: >-
  Sync wiki/architecture workflow docs with source code: mermaid diagrams,
  Trigger steps, Annotated workflow steps, and citation bullets with
  range-relevant facts. Use when the user asks to update architecture docs,
  workflow docs, mermaid in wiki/architecture, annotated-step citations,
  architecture citation bullets, or says update-architecture.
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
   Numbered list mirroring the **triggering** code path (for example, a CLI command, package entrypoint, or `*Api` method). One numbered step per phase; nest sub-steps for entrypoint/repo delegation. Source citations on Trigger steps use nested citation bullets, not trailing parenthetical link lists.

4. **Update Annotated workflow steps**  
   Numbered list for the workflow or lifecycle implementation itself (`Effect.fn`, runtime boundary, repo calls, returned receipts, and branch conditions). Separate it from Trigger so invocation and implementation remain distinct. One numbered item per sequence-diagram message, same number, order, and meaning.
   Nested unordered bullets hold the source citations. Do **not** trail a parenthetical comma-separated link list on the numbered item.
   Each bullet is one working Markdown source link, then an em dash, then the **relevant fact at that exact range** — the call, check, or return that range uniquely performs. Do not restate the parent numbered prose. Do not summarize the whole file. Dual paths (aggregate vs service, success vs failure) each get their own bullet because the relevant happening differs.

5. **Cite section prose the same way**
   Every architecture source citation — Trigger, Annotated, lifecycle asides, grant boundaries, and section prose on pages without annotated steps — is an unordered bullet after the claim paragraph or under the numbered item. Each bullet is one working Markdown range link, then an em dash, then the fact that range uniquely performs. Do **not** attach citations as trailing parenthetical comma-separated lists. Opening prose that only summarizes the immediately following `## Annotated workflow steps` must not repeat those step citations.

6. **Use preview-safe relative links**
   From `wiki/architecture/Foo.md`:
   - Source under repo root: `../../packages/...`, `../../examples/...`, `../../docs/...`
   - Sibling architecture doc: `./OtherWorkflow.md`
   - Do **not** use root-absolute paths like `/packages/...` — Markdown preview will not open them.

7. **Link labels**
   Prefer ``[`Symbol.method`](relative/path.ts)`` or ``[`file.ts`](relative/path.ts)``. Match symbol names in the linked file. Citation bullets that target a range use ``[`file.ts:78-88`](relative/path.ts#L78-L88)``.

8. **Keep scope tight**
   Update only the sections that drifted. Do not rewrite unrelated architecture docs or fix root-absolute links elsewhere unless asked.

9. **Frontmatter**
   After substantive edits, update `sources[].sha` via `git hash-object <path>` for each cited file and bump `updated`.

## Section templates

### Trigger (CLI → dispatch boundary)

Numbered item = triggering phase. Nested bullets = citations.

```markdown
## Trigger

1. [`devFn`](../../packages/cli/src/dev/devFn.ts)
   - [`devFn.ts:222-317`](../../packages/cli/src/dev/devFn.ts#L222-L317) — loads config, writes Wrangler config, and starts the dispatch Worker.
2. [`E2eWorker.fetch`](../../packages/dispatch-worker/src/Worker.ts)
   - [`Worker.ts:45-80`](../../packages/dispatch-worker/src/Worker.ts#L45-L80) — resolves `SelfHostedZerospinApis` and forwards the request.
```

### Annotated workflow steps (lifecycle implementation)

Numbered item = diagram-message meaning. Nested bullets = citations. After each link, name what that range does.

```markdown
## Annotated workflow steps

1. Each getter snapshots the active generation before constructing the returned capability
   - [`getAggregateFrontendApi.ts:78-88`](../../packages/system-worker/src/GatewayApi/getAggregateFrontendApi/getAggregateFrontendApi.ts#L78-L88) — `systemRepo.getActiveGenerationId()` through `makeAsync`/`decodeRpc`; a throw becomes `gateway-infrastructure-failure`.
   - [`getServiceFrontendApi.ts:69-79`](../../packages/system-worker/src/GatewayApi/getServiceFrontendApi/getServiceFrontendApi.ts#L69-L79) — same active-generation snapshot on the service getter.
```

### Section prose (no annotated steps)

End the claim paragraph, then list citation bullets. Do not trail a parenthetical dump on the paragraph.

```markdown
SystemRepo imports only generation-manifest metadata and routes lifecycle work through stable supervisors.

- [`GenerationManifestSchema.ts:7-13`](../../packages/core/src/system/GenerationManifestSchema.ts#L7-L13) — generation manifest identity fields the catalog stores.
- [`SystemRepo.ts:1-80`](../../packages/system-worker/src/SystemRepo/SystemRepo.ts#L1-L80) — SystemRepo imports only generation-manifest metadata and routes through stable supervisors.
```

Do **not** attach citations as a trailing parenthetical list:

```markdown
2. Each getter snapshots the active generation
   ([`getAggregateFrontendApi.ts:78-88`](../../packages/system-worker/src/GatewayApi/getAggregateFrontendApi/getAggregateFrontendApi.ts#L78-L88),
   [`getServiceFrontendApi.ts:69-79`](../../packages/system-worker/src/GatewayApi/getServiceFrontendApi/getServiceFrontendApi.ts#L69-L79)).
```

## Mermaid conventions

- **Sequence**: name participants after runtime boundaries (`CLI`, `Dispatch Worker`, `SelfHostedZerospinApis`, `SystemWorker`). Show `makeAsync` / `decodeRpc` where the source uses them. Use `alt` for missing-input failures and real branch gates.
- **Sequence invocation labels**: label `->>` arrows with the call-site binding and method — `{receiverBinding}.{method}()` or `{receiverBinding}.{method}(...)` — not the Mermaid participant alias and not a prose summary. Always append `()` when the public method takes no arguments, or `(...)` when it takes arguments; do not omit parentheses and do not list argument names or values on the arrow. Strip `this.` / `props.` from `{receiverBinding}`. Family diagrams may keep wildcards such as `gatewayApi.get*FrontendApi(...)` or `systemApi.*(...)`. Good: `Gateway->>SystemRepo: systemRepo.getActiveGenerationId()`, `Caller->>Gateway: gatewayApi.get*FrontendApi(...)`. Bad: `gatewayApi.get*FrontendApi` (missing parens), `getActiveGenerationId()` (missing binding), `SystemRepo.getActiveGenerationId()` (participant alias), `acquire active generationId` (prose). Return arrows (`-->>`) keep result payloads; user/process steps and unnamed inline checks stay short predicates.
- **Flowchart**: use one subgraph per public workflow or lifecycle. Node labels = method or phase names. Branch labels = `"yes"` / `"no"` on the condition that matches code.

## Checklist before finishing

- [ ] Sequence diagram matches the triggering path through the first public runtime or repo boundary.
- [ ] Flowchart matches the implementation's named phases and branch conditions.
- [ ] Trigger and Annotated sections are separate and numbered consistently.
- [ ] Every architecture source citation is a nested bullet; each link is followed by the relevant fact at that range.
- [ ] No trailing parenthetical comma-separated citation lists remain.
- [ ] Every ``[`…`](…)`` link uses a relative path from the doc file.
- [ ] No behavior invented — each step traceable to a line in source.
- [ ] Frontmatter `sources` SHAs refreshed when cited files changed.
