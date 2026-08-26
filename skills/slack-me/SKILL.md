---
name: slack-me
description: Send the current user a Slack DM from Codex. Use when the user says "slack me", "Slack this to me", "DM me", "send me this in Slack", "message me the status", or otherwise asks Codex to deliver a summary, result, reminder text, link, or status update to the user's own Slack account.
---

# Slack Me

## Overview

Use this skill to deliver a concise Slack message to the user's own Slack account
through a preconfigured incoming webhook.

## Required env

`SLACK_ME_WEBHOOK_URL` must already be present in the inherited process
environment:

```bash
if [[ -z "${SLACK_ME_WEBHOOK_URL:-}" ]]; then
  echo "SLACK_ME_WEBHOOK_URL is required" >&2
  exit 1
fi
```

Do not search for or source `.env`, `.env.local`, shell profile, or other
configuration files. Do not invent a value, and never commit the URL into this
skill or any other tracked file. If the variable is absent or empty, stop and
report the missing environment variable; do not use the Slack connector as a
fallback.

Post using the inherited value:

```bash
curl -sS -X POST -H 'Content-Type: application/json' \
  --data "$(jq -n --arg text "$MESSAGE" '{text:$text}')" \
  "$SLACK_ME_WEBHOOK_URL"
```

## Workflow

1. Compose the message for Slack.
   - Keep it short and self-contained.
   - Preserve important file paths, links, command names, dates, owners, and error text.
   - Do not add broad mentions or channel references.
   - Append this italic fine print on the same line as the message: `_-- Sent via /slack-me_`.
2. Post the message through the incoming webhook from `SLACK_ME_WEBHOOK_URL`.
   - Use `curl` with `Content-Type: application/json` and a JSON body containing `text`.
   - Do not use the Slack connector as a send or draft fallback.
3. Report whether the webhook returned success.

## Failure Handling

- If `SLACK_ME_WEBHOOK_URL` is absent or empty in the inherited environment,
  fail immediately and report that it must be configured before Codex starts;
  do not load a file or fall back to the Slack connector.
- If the webhook request fails, report the HTTP response; do not fall back to
  the Slack connector.
- If the message depends on missing task context, ask for that content instead of sending a vague placeholder.
