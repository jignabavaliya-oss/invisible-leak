# The Invisible Leak

Project-based AI analysis of cloud spend. Identifies "invisible" waste (unattached volumes, idle LBs, stale snapshots, abandoned SaaS seats, near-idle compute), explains *why* a workspace's bill is what it is, and forecasts end-of-month spend using sprint velocity.

## Quick start

```bash
cd invisible-leak
npm install
npm run dev
# open http://localhost:3000
```

Runs out of the box with bundled mock billing data — no API keys required.

## Optional integrations

Copy `.env.example` to `.env.local` and fill what you want enabled:

- **OpenRouter (Qwen)** — `OPENROUTER_API_KEY`. The `/api/explain` route will call the model; without a key the app uses a deterministic mock explainer.
- **Supabase** — apply `supabase/schema.sql` and set the URL/key envs. (The current app reads from `lib/mockData.ts`; swap to Supabase by replacing `LINE_ITEMS` with a query.)
- **Cloudflare Worker** — `workers/poll-billing.ts` + `wrangler.toml` for the daily cron poll.

## What's in here

| Path | Purpose |
|---|---|
| `app/page.tsx` | Workspace dashboard (FR-2, 5.1) |
| `app/workspace/[id]/page.tsx` | Detail view (FR-3, 5.2) |
| `app/api/explain/route.ts` | NL cost explainer (FR-4) |
| `app/api/forecast/route.ts` | Velocity-based forecast (FR-5) |
| `app/api/resolve/route.ts` | "Resolve with AI" — CLI + Terraform |
| `lib/leakDetection.ts` | Zombie-resource detection (FR-3) |
| `lib/forecast.ts` | Hybrid burn + velocity forecast |
| `lib/openrouter.ts` | Qwen via OpenRouter, with mock fallback |
| `lib/mockData.ts` | Mock billing across 5 workspaces |
| `supabase/schema.sql` | `workspaces`, `line_items`, `ai_insights`, `resolutions` |
| `workers/poll-billing.ts` | Cloudflare cron worker (FR-1) |

## Demo path (for the < 5s "time to insight" metric)

1. Land on `/` → red "Leak Detected" badges + sorted by waste.
2. Click **Project Gamma** → see ~$370/mo of leaks, AI explainer at top.
3. Hit **Resolve with AI** on any leak → CLI command + Terraform stub.
