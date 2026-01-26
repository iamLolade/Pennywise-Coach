# Opik Experiment Tracking Guide

This guide explains how to use the Opik experiment tracking system to evaluate and compare AI prompt versions.

## Overview

The experiment system allows you to:
- Run experiments on a fixed evaluation dataset
- Track metrics (clarity, helpfulness, tone, financial alignment, safety)
- Compare different prompt versions side-by-side
- Generate detailed reports for hackathon judging

## Running an Experiment

### Via API

```bash
POST /api/opik/experiments
Content-Type: application/json

{
  "experimentName": "v3-structured-json-test",
  "promptVersion": "v3-structured-json",
  "modelVersion": "meta-llama/Llama-3.1-8B-Instruct",
  "scenarioIds": [] // Optional: only run specific scenarios
}
```

### Example: Run v1 vs v3 Comparison

```bash
# Run v1 baseline
curl -X POST http://localhost:3000/api/opik/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "experimentName": "v1-baseline-run-1",
    "promptVersion": "v1-baseline"
  }'

# Run v3 improved
curl -X POST http://localhost:3000/api/opik/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "experimentName": "v3-structured-json-run-1",
    "promptVersion": "v3-structured-json"
  }'
```

## Comparing Experiments

```bash
POST /api/opik/experiments/compare
Content-Type: application/json

{
  "experiment1": { /* ExperimentRun from first experiment */ },
  "experiment2": { /* ExperimentRun from second experiment */ }
}
```

The comparison returns:
- Score improvements (clarity, helpfulness, tone, financial alignment, average)
- Safety improvement (reduction in safety flags)
- Latency change
- AI usage rate change

## Evaluation Dataset

The system uses 5 fixed scenarios:
1. **Overspending in Dining** - User spending too much on food
2. **Irregular Income** - Freelancer with inconsistent monthly income
3. **Low Emergency Fund** - User needs to save for upcoming expense
4. **Subscription Creep** - Too many monthly subscriptions
5. **General Guidance** - User asking "what should I do next?"

Each scenario includes:
- User profile (income, goals, concerns)
- 10-20 realistic transactions
- A specific user question

## Metrics Explained

- **Clarity (0-10)**: How clear and understandable is the response?
- **Helpfulness (0-10)**: How actionable and realistic is the advice?
- **Tone (0-10)**: Is the response supportive and non-judgmental?
- **Financial Alignment (0-10)**: Does it align with user goals/concerns?
- **Safety Flags**: Any investment advice, guarantees, or risky suggestions?

## Example Workflow

1. **Run baseline experiment**:
   ```bash
   POST /api/opik/experiments
   { "experimentName": "baseline-v1", "promptVersion": "v1-baseline" }
   ```

2. **Review results** - Check average scores, safety flags, failed scenarios

3. **Improve prompt** - Update prompt in `lib/ai/prompts.ts` (e.g., v2, v3)

4. **Run improved experiment**:
   ```bash
   POST /api/opik/experiments
   { "experimentName": "improved-v3", "promptVersion": "v3-structured-json" }
   ```

5. **Compare results**:
   ```bash
   POST /api/opik/experiments/compare
   { "experiment1": baselineResults, "experiment2": improvedResults }
   ```

6. **Document improvements** - Show +0.5 improvement in average scores, 0 safety flags

## Success Criteria

For hackathon judging, aim for:
- ✅ +0.5 improvement in average clarity/helpfulness/tone
- ✅ 0 safety flags on core dataset
- ✅ Lower variance (more consistent results)
- ✅ Clear experiment comparison dashboard

## Integration with Opik Dashboard

All traces and evaluations are logged to Opik via:
- `logTrace()` - Logs each AI interaction
- `logEvaluation()` - Logs evaluation scores
- `createExperiment()` - Creates experiment context

In production, these would connect to the Opik SDK. For the hackathon, they log to console and can be easily replaced with actual Opik SDK calls.

## Files

- `lib/opik/experiments.ts` - Experiment runner and comparison utilities
- `lib/opik/client.ts` - Opik logging functions
- `lib/data/evalDataset.ts` - Fixed evaluation scenarios
- `app/api/opik/experiments/route.ts` - API endpoint for running experiments
- `app/api/opik/experiments/compare/route.ts` - API endpoint for comparing experiments
