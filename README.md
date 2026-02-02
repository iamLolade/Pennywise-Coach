# Pennywise Coach

Pennywise Coach is a web-based AI financial health assistant that helps people understand their spending, build healthier money habits, and make confident decisions through calm, non-judgmental guidance. Built for hackathon submission with a focus on clarity, empathy, and responsible AI.

## Product Goals

- Reduce financial anxiety by explaining spending in plain language
- Provide gentle, practical coaching and next steps
- Highlight patterns without shame or complexity
- Keep the UI minimal, calm, and easy to navigate

## Core Features (MVP)

- **Onboarding**: capture income range, goals, concerns, and currency
- **Dashboard**: spending summary, categories, transactions, and AI analysis
- **Coach**: conversational AI guidance with saved history
- **Insights**: daily and weekly guidance with AI generation
- **Settings**: update onboarding preferences anytime

## Tech Stack

- **Next.js (App Router)**, **React**, **TypeScript**
- **Tailwind CSS v4**, **Framer Motion**
- **Supabase** for auth + data storage
- **Hugging Face Inference API** for AI responses
- **Opik** for observability and evaluation
- **react-hot-toast**, **react-select**, **lucide-react**

## Project Structure

- `app/` — Next.js routes (auth + dashboard groups)
- `components/` — reusable UI, dashboard, coach, insights
- `lib/ai/` — prompts + Hugging Face integration
- `lib/supabase/` — auth + database helpers
- `lib/api/` — client-side API wrappers
- `docs/` — design + Opik plans

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Hugging Face AI
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Opik (for observability and evaluation)
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE=pennywise-coach
OPIK_PROJECT_NAME=pennywise-coach
OPIK_URL_OVERRIDE=https://www.comet.com/opik  # Optional, for Opik Cloud
OPIK_LLM_JUDGE_ENABLED=true  # Optional, enables LLM-as-judge evaluations
```

## Setup

### Supabase Setup

Run the schema in `lib/supabase/schema.sql` in the Supabase SQL editor.

Tables included:
- `user_profiles`
- `transactions`
- `coach_conversations`
- `insights`

### Opik Setup

1. **Create Opik Account**: Sign up at [https://www.comet.com/opik](https://www.comet.com/opik)
2. **Create Workspace**: Create a workspace named `pennywise-coach` (or update `OPIK_WORKSPACE` in `.env.local`)
3. **Get API Key**: Copy your Opik API key from the workspace settings
4. **Add to `.env.local`**: Set `OPIK_API_KEY`, `OPIK_WORKSPACE`, and `OPIK_PROJECT_NAME`
5. **Verify**: Run the app and check Opik dashboard for traces (may take a few seconds)

**Quick Test**: 
- Sign up and use the coach chat
- Check Opik dashboard → LLM Evaluation → Traces
- You should see a `coach-chat` trace with your interaction

## AI + Opik Integration

### Hugging Face AI
- **Model**: `meta-llama/Llama-3.1-8B-Instruct` via Hugging Face Inference API
- **Client**: `@huggingface/inference` with `InferenceClient` and `chatCompletion`
- **Features**: 30s timeout, automatic retries (2 retries with exponential backoff), friendly error messages
- **Prompts**: Versioned in `lib/ai/prompts.ts` (v1, v2, v3)
- **Fallbacks**: Rule-based responses when AI fails (graceful degradation)

### Opik Observability
- **Trace Logging**: All AI interactions (coach, insights, analysis) are logged to Opik
- **Pipeline Spans**: Breakdown of prompt-build → LLM call → parse → evaluation
- **Automated Evaluation**: Heuristic + optional LLM-as-judge evaluations
- **Experiment Tracking**: Run and compare prompt versions with regression detection
- **Safety Metrics**: False positive/negative tracking with precision/recall/F1
- **Error Taxonomy**: Categorized errors (timeout, parse, API, fallback, validation)

**Opik Dashboard**: [https://www.comet.com/opik/pennywise-coach/home](https://www.comet.com/opik/pennywise-coach/home)

**Documentation**:
- [Opik Judge Guide](docs/OPIK_JUDGE_GUIDE.md) - How to navigate Opik dashboard
- [Opik Experiments](docs/OPIK_EXPERIMENTS.md) - How to run experiments
- [Experiment Results](docs/EXPERIMENT_RESULTS_SUMMARY.md) - v1 vs v3 comparison
- [Demo Script](docs/DEMO_SCRIPT.md) - Step-by-step demo walkthrough

## Scripts

```
npm run dev
npm run build
npm run start
```

## Deployment

Deploy on Vercel or any Next.js host. Make sure the env vars are set and the Supabase schema has been applied.

## License

MIT
