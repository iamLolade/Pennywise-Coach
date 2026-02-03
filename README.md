# Pennywise Coach

Pennywise Coach is an AI-powered financial health assistant that turns transaction data into clear, non-judgmental guidance. It helps people understand spending patterns, build healthier money habits, and take realistic next steps without overwhelm.

## Features

- **Onboarding**: capture currency, income range, goals, and concerns
- **Dashboard**: spending summary, categories, transactions, and AI analysis
- **Coach**: conversational guidance with saved history
- **Insights**: daily/weekly insights generated from recent activity
- **Settings**: update preferences anytime

## Tech Stack

- **Next.js (App Router)**, **React**, **TypeScript**
- **Tailwind CSS v4**, **Framer Motion**
- **Supabase** (auth + persistence)
- **Hugging Face Inference API** (LLM responses)
- **Opik** (tracing, evaluations, experiments)

## Project Structure

- `app/` — routes (auth + dashboard route groups)
- `components/` — UI and feature components
- `lib/ai/` — prompts, model calls, evaluations
- `lib/opik/` — tracing + experiments
- `lib/supabase/` — auth + database helpers
- `docs/` — product/design notes and Opik guides

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Configuration

Create `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Hugging Face
HUGGINGFACE_API_KEY=...

# Opik (optional, enables observability)
OPIK_API_KEY=...
OPIK_WORKSPACE=...
OPIK_PROJECT_NAME=...
OPIK_URL_OVERRIDE=...         # Optional
OPIK_LLM_JUDGE_ENABLED=false  # Optional
```

### Supabase setup

Run `lib/supabase/schema.sql` in the Supabase SQL editor.

### Opik setup (optional)

If `OPIK_API_KEY` is not set, the app **no-ops** Opik logging (local/dev-friendly).

- **Dashboard**: `https://www.comet.com/opik/pennywise-coach/home`
- **Guides**:
  - `docs/OPIK_QUICK_GUIDE.md`
  - `docs/OPIK_JUDGE_GUIDE.md`
  - `docs/OPIK_EXPERIMENTS.md`

## AI behavior and evaluation

- **Model**: `meta-llama/Llama-3.1-8B-Instruct`
- **Prompts**: versioned in `lib/ai/prompts.ts`
- **Guardrails**: safety + PII checks in `lib/ai/evaluations.ts`
- **Observability**:
  - Traces for coach/insights/analysis
  - Spans for prompt-build → LLM call → parse → evaluation
  - Optional online LLM-as-judge when `OPIK_LLM_JUDGE_ENABLED=true`

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Deployment

Deploy on Vercel (recommended) or any Next.js-compatible host.

- Set the env vars above in your hosting provider
- Apply the Supabase schema
- Ensure Supabase auth redirect URLs are configured for your deployed domain

## License

MIT
