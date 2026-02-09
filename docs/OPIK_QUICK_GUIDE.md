# Opik Dashboard Quick Guide

Quick reference for navigating the Opik dashboard to evaluate our submission.

## Access

**URL**: [https://www.comet.com/opik/pennywise-coach/home](https://www.comet.com/opik/pennywise-coach/home)

## Quick Navigation

### 1. View Traces (30 seconds)

1. Click **"LLM Evaluation (Opik)"** in the left sidebar
2. Click **"Traces"**
3. Filter by tag: `pennywise-coach`
4. **What you'll see**: List of all AI interactions (coach, insights, analysis)

**Key traces to look for**:
- `coach-chat` - AI coach conversations
- `insights-generation` - Daily/weekly insights
- `spending-analysis` - Dashboard analysis
- `evaluation` - Automated evaluations
- `experiment-comparison` - Experiment comparisons

### 2. View Pipeline Spans (30 seconds)

1. In **Traces**, filter by tag: `span`
2. **What you'll see**: Breakdown of each AI interaction:
   - `prompt-build` - Prompt construction time
   - `llm-call` - LLM API call time + token usage
   - `parse` - Response parsing time
   - `evaluation` - Evaluation time

**Key metrics**:
- Latency breakdown per stage
- Token usage (input/output)
- Error taxonomy (if errors occurred)

### 3. View Evaluations (30 seconds)

1. In **Traces**, filter by tag: `evaluation`
2. **What you'll see**: Evaluation scores for each AI response
3. Filter by evaluator: `evaluator:heuristic` or `evaluator:llm_judge`

**Key metrics**:
- Clarity, helpfulness, tone, financial alignment (0-10 each)
- Average score
- Safety flags (should be 0 for production)

### 4. View Experiments (1 minute)

1. In the app, go to `/experiments` page
2. Run an experiment (select `v3-structured-json`)
3. Compare two experiments (v1 vs v3)
4. In Opik, filter by tag: `experiment-comparison`

**What you'll see**:
- Improvement deltas (v1 → v3)
- Regression detection
- Safety metrics

### 5. View Safety Metrics (30 seconds)

1. In **Traces**, filter by tag: `safety-tradeoff-metrics`
2. **What you'll see**:
   - Precision, recall, F1 scores
   - True positives, false positives, false negatives

## Common Filters

| Filter | What It Shows |
|--------|---------------|
| `pennywise-coach` | All our traces |
| `span` | Pipeline breakdown spans |
| `evaluation` | Evaluation scores |
| `evaluator:heuristic` | Rule-based evaluations |
| `evaluator:llm_judge` | LLM-as-judge evaluations |
| `prompt:v1-baseline` | Baseline prompt version |
| `prompt:v3-structured-json` | Improved prompt version |
| `experiment-comparison` | Experiment comparisons |
| `safety-tradeoff-metrics` | Safety detection metrics |

## What to Look For

### ✅ Good Signs
- **Traces appear quickly** after interactions
- **Evaluation scores** are logged for every response
- **Spans show** full pipeline breakdown
- **Experiments show** measurable improvements (v1 → v3)
- **Safety flags** are 0 for production responses
- **Token usage** is tracked when available

### ⚠️ Things to Note
- **Latency**: LLM calls typically take 1-3 seconds
- **Fallbacks**: If AI fails, fallback responses are also logged
- **Errors**: Check error taxonomy in spans for categorized errors
- **Experiments**: May take 1-2 minutes to run (5 scenarios)

## Quick Checklist

- [ ] Can see traces in Opik dashboard
- [ ] Can see spans showing pipeline breakdown
- [ ] Can see evaluations with scores
- [ ] Can see experiment comparisons
- [ ] Can see safety tradeoff metrics
- [ ] Can filter by prompt version
- [ ] Can filter by evaluator type

## Troubleshooting

**No traces showing?**
- Check `OPIK_API_KEY` is set in `.env.local`
- Check `OPIK_WORKSPACE` matches your workspace name
- Wait a few seconds (traces may take time to appear)
- Check browser console for errors

**Can't find specific trace?**
- Use filters to narrow down
- Check timestamp (traces are time-ordered)
- Try filtering by experiment name or prompt version

**Experiments not running?**
- Make sure app is running (`npm run dev`)
- Check `/experiments` page loads
- Check browser console for errors

---

**For detailed navigation**, see `docs/OPIK_JUDGE_GUIDE.md`
**For demo walkthrough**, see `docs/DEMO_SCRIPT.md`
