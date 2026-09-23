---
name: update-vendor
description: >-
  Pull, push, inspect, or propagate Git subtrees under vendor/. Use when the
  user asks to update, sync, pull, push, publish, inspect, scan, or propagate
  vendors such as Effect or a sibling checkout like zerospin.
---

# Update Vendor

Configured vendors live under `vendor/<name>` or `vendor/<owner>/<name>` only.
Do not use `subrepos/`. Do not recurse into vendored package trees (e.g.
`vendor/effect/packages`). `llm-wiki/` at a repository root is first-party and
is never a vendor target.

## Source ownership

Treat `vendor/**` as read-only in the consumer. Make source changes in the
upstream repository, commit and push them there, then pull through this
workflow. Keep consumer integrations outside vendor trees. Only this workflow
may change vendored files, including verbatim restoration of consumer metadata.
Do not edit or subtree-push from the consumer unless the user explicitly
requests an exception; the Push procedure below applies only to that exception.
A request to edit this skill is not a request to run a subtree operation.

## Consumer origin manifest

The **consumer** root `README.md` is the sole manifest: each configured vendor
names its prefix, origin, and branch there. `AGENTS.md` should route to this
skill rather than duplicate the manifest. Example shape:

| Prefix | Origin | Branch |
| --- | --- | --- |
| `vendor/zerospin` | `../zerospin` | `main` |
| `vendor/effect` | `https://github.com/Effect-TS/effect.git` | `main` |

### Origin kind

1. If a same-named sibling Git checkout exists next to the consumer, the origin
   must be that relative path (e.g. `../zerospin`).
2. If there is no sibling, the origin must be the GitHub URL.
3. Do not use a GitHub URL for a vendor whose sibling checkout is present.

### Vendor README metadata is secondary

If `vendor/<prefix>/README.md` has a `## Subrepo metadata` or
`## Zerospin subrepo metadata` section, it must agree with the consumer docs.
Retain that section verbatim before a pull and restore it afterward if the pull
removes or changes it. Never reconstruct metadata from memory.

Do not stuff consumer origin into an upstream-owned subtree root README (for
example `vendor/zerospin/README.md` is Zerospin's README, not the consumer's
manifest).

Discovery for configured prefixes:

1. Immediate children of `vendor/` (e.g. `vendor/effect`).
2. Immediate children of each `vendor/<org>/` directory (one nesting level for
   namespaced vendors).

## Safety checks

1. Run from the consumer repository root (the repo that owns `vendor/`), or
   from the source repository root when propagating to siblings.
2. Stop if tracked or untracked worktree changes exist. Report them; never
   stash, discard, commit, or mix them into a subtree operation without explicit
   permission.
3. Verify every requested target is a discovered configured vendor path, has
   a prefix, origin, and branch in the consumer README, and is tracked by Git.
4. Use `--squash` for every pull. Never force-push a subtree split.
5. Process targets sequentially and stop on the first conflict or failed
   command. Report completed and unprocessed targets.

## Pull

When invoked without an operation or targets, pull every configured vendor.
Also accept one named target or an explicit set of targets.

For each target, read `PREFIX`, `ORIGIN`, and `BRANCH` from the consumer
root README, retain any vendor README metadata
section verbatim, then run:

```bash
git subtree pull --prefix="$PREFIX" "$ORIGIN" "$BRANCH" --squash
```

`$ORIGIN` is the sibling path or GitHub URL from the consumer docs. Before each
pull, show the target, origin, and branch. Afterward, report the created squash
commit or that no update was needed. If the pull removes or changes a retained
vendor README metadata section, restore it exactly and commit only that README
restoration before processing the next target.

## Push

Accept either one named target or explicit `all`. Never infer a push from a bare
invocation.

For each requested target:

1. Fetch its configured origin branch (for a sibling path, use that checkout;
   for a GitHub URL, fetch the remote).
2. Run `git subtree split --prefix="$PREFIX"` without `--rejoin` and retain the
   resulting split commit.
3. Show `git log --oneline` for commits reachable from the split commit but not
   the fetched upstream tip. If the upstream tip is not an ancestor of the
   split commit, stop and require a pull or manual reconciliation.
4. Show the exact `git subtree push` command for every target.
5. Ask one blocking confirmation covering the displayed targets and commits.
6. Only after confirmation, run each push sequentially:

```bash
git subtree push --prefix="$PREFIX" "$ORIGIN" "$BRANCH"
```

If there are no outgoing commits for a target, report it and skip its push.

## Propagate from a source

When asked to scan, propagate, or refresh sibling consumers of the current
repository's tree:

### Establish the source

1. Resolve the source root with `git rev-parse --show-toplevel`.
2. Require a named branch with a configured upstream.
3. Stop before scanning when the source has tracked or untracked changes.
   Uncommitted additions cannot be represented by a subtree update.
4. Run `git pull --ff-only` to fetch and fast-forward the source branch before
   discovering or comparing siblings.
5. Stop when the pull cannot fast-forward. Do not merge, rebase, reset, commit,
   or push the source repository.
6. Record the source `HEAD` after the pull. A source branch ahead of upstream is
   valid and its committed additions are included.

### Discover sibling consumers

Inspect only immediate child directories of the source repository's parent.
Exclude the source repository itself. A sibling is a candidate when it is a Git
worktree and contains a configured vendor at either:

1. `vendor/<name>`
2. `vendor/<owner>/<name>`

Do not recurse farther into vendor contents.

Treat a candidate as a consumer of this source only when all of these are true:

1. Its vendor directory is tracked by the sibling repository.
2. Its root `README.md` names the prefix, origin, and branch for that vendor.
3. The origin resolves to this source: either the realpath of a relative sibling
   path (e.g. `../zerospin`) matches the source root, or the normalized GitHub
   URL matches one of the source repository's remote URLs (ignore trailing
   `.git` and trailing slash).
4. Git history contains a `git-subtree-dir: <prefix>` trailer for that prefix.
   The trailer confirms the subtree; it does not substitute for the consumer
   docs.

Do not infer consumers from directory names alone. Record malformed or
ambiguous metadata as a skipped candidate.

### Sync sibling remotes

Before comparing a confirmed consumer with the source:

1. Require a named sibling branch with a configured upstream.
2. If the sibling worktree is clean, run `git pull --ff-only` and record its
   resulting `HEAD` before comparison.
3. If the sibling is dirty, do not pull it. Record its changed paths and treat
   it as ineligible for an update.
4. If the pull cannot fast-forward, classify that consumer as failed and do not
   run a subtree operation in it. Do not merge, rebase, reset, change branches,
   commit, or push to resolve remote divergence.

Remote synchronization is part of propagate. Never compare or update a clean
consumer from a stale local branch.

### Compare

For every confirmed consumer:

1. Record the sibling's branch, synchronized `HEAD`, worktree status, prefix,
   vendor origin, vendor branch, and sibling branch upstream.
2. Fetch the source branch from the local source repository into the sibling
   without changing the sibling's checked-out branch.
3. Compare the fetched source commit's complete tree with `HEAD:<prefix>`.
   Compare trees, not commit IDs: squash subtrees intentionally have different
   histories.
4. Classify the consumer as current, stale, dirty-stale, or failed.

The complete-tree comparison must detect additions, deletions, renames, and
content changes. Do not compare only files already present in the vendor.

### Update stale consumers

Update every stale consumer whose worktree is clean. Never stash, discard,
commit unrelated files, change branches, or push a sibling repository.

Before each update, show the sibling path, prefix, old `HEAD`, source commit,
and exact operation. Then run:

```bash
git subtree pull --prefix="$PREFIX" "$SOURCE_ROOT" "$SOURCE_BRANCH" --squash
```

Use the local source repository so committed additions that have not yet been
pushed are propagated. Process siblings independently; one dirty or failed
repository must not hide the status of the others.

After each pull:

1. Record the resulting squash commit.
2. Compare the resulting `HEAD:<prefix>` tree with the recorded source commit.
3. Mark the update successful only when the trees are identical and the
   sibling worktree is clean.
4. If the subtree pull conflicts or verification fails, stop modifying that
   sibling, preserve its exact state, and report the conflict or diff. Do not
   abort, reset, or invent a compatibility edit.

Do not update dirty-stale consumers. Report their status and changed paths so
the user can decide how to handle their WIP.

### Report

Return one row per sibling repository with:

1. Repository path
2. Detected prefix
3. Previous commit
4. Source commit
5. Initial classification
6. Resulting commit or skip/failure reason
7. Verification result

Explicitly list sibling repositories that are not consumers separately from
malformed or ambiguous candidates. State that changes are local and were not
pushed.

## Result

For pull or push in a consumer, report each vendor prefix, operation, origin
branch, resulting commit, any metadata-restoration commit, and any conflict or
skipped state.
