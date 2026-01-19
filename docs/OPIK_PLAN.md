# Opik Evaluation Plan

This document defines how we will use Opik to evaluate, track, and improve the AI
financial coach. It is designed to satisfy the "Best Use of Opik" criteria and to
drive measurable quality improvements.

## Goals

- Prove that the AI system improves via experiments and evaluation.
- Provide clear, auditable metrics for quality, safety, and usefulness.
- Showcase Opik dashboards and logs during judging.

## What We Will Track (Opik Traces)

Each AI response will log a trace with:

- Input payload (user context, recent transactions, user question).
- Prompt template version and model version.
- Output response and final suggested actions.
- Timing (latency) and token usage (if available).

## Evaluation Suite

We will run automated evaluations on a fixed dataset of user scenarios. Each run
is an Opik experiment with a named version.

### Metrics

- Clarity (0-5): is the explanation easy to understand?
- Helpfulness (0-5): is the response actionable and realistic?
- Tone (0-5): is the response supportive and non-judgmental?
- Financial alignment (0-5): does it encourage responsible decisions?
- Safety flags (boolean): any PII leakage or risky advice?

### LLM-as-Judge

We will use a dedicated evaluation prompt to score each output. Scores will be
stored in Opik metrics per run.

### Example Judge Prompt (Summary)

- Score clarity, helpfulness, tone, and financial alignment.
- Flag any unsafe or speculative advice.
- Provide short reasoning notes for failed cases.

## Dataset Design

We will include a small, fixed dataset of scenarios to make results comparable:

- Overspending in one category (e.g. dining).
- Irregular income months.
- Low emergency fund and upcoming expense.
- High subscription creep.
- A user asking for "what should I do next?"

Each scenario includes:
- User profile (income range, goals, concerns).
- 10-20 transactions.
- A user question or prompt.

## Experiment Plan

We will compare at least two prompt versions:

- v1: baseline prompt
- v2: improved prompt based on evaluation feedback

Optional: compare two model versions if feasible.

### Success Criteria

- +0.5 improvement in average clarity/helpfulness/tone
- 0 safety flags on core dataset
- Lower variance (more consistent results)

## Observability and Dashboards

We will present:

- Opik experiment runs with side-by-side comparisons.
- A dashboard with averages and distribution of scores.
- Example traces showing inputs, outputs, and evaluations.

## Integration Points in Codebase

Planned files:

- `app/api/ai/analyze/route.ts` for inference and logging
- `lib/ai/prompts.ts` for prompt templates and versioning
- `lib/ai/eval.ts` for evaluation utilities
- `lib/data/evalDataset.ts` for the fixed dataset

## Development Workflow

1. Add dataset and baseline prompt.
2. Run Opik experiment (v1).
3. Review weak cases and adjust prompt.
4. Run Opik experiment (v2).
5. Report improvement in metrics.

## Demo Narrative for Judges

- Show the product flow (onboarding -> analysis -> coach).
- Explain that every AI response is logged and evaluated.
- Show an experiment with v1 vs v2 and the improvements.
- Highlight Opik dashboards and example traces.

## Deliverables Checklist

- Opik integrated with inference logging.
- At least two experiments with clear comparison.
- Evaluation dataset and judge prompt.
- Screenshots or live dashboard views for judging.
