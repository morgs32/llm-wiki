# `wrangler dev` readiness

Do not treat a fixed sleep as ready. Background `wrangler dev`, then wait for:

```
Ready on http://
```

Do not wait for process exit — the dev server stays up. If that line never
appears, report the terminal tail and stop.
