# Demo Script for Hackathon Judges

This document provides a step-by-step walkthrough to demonstrate Pennywise Coach's features and Opik integration.

## Quick Start (2 minutes)

### 1. Landing Page
- **URL**: `http://localhost:3000` (or your deployed URL)
- **What to show**: Clean, calm landing page with clear value proposition
- **Key points**: 
  - "Understand your spending without the overwhelm"
  - Mobile-responsive design
  - Smooth scrolling navigation
  - Sample insight modal (click "See a sample insight")

### 2. Sign Up / Onboarding
- **Flow**: Sign up → Onboarding
- **What to show**:
  - Currency selection (USD, EUR, GBP, NGN, SEK)
  - Income range (dynamically updates based on currency)
  - Goals and concerns selection
  - Mascot branding consistency

### 3. Dashboard
- **What to show**:
  - Spending summary cards (Income, Expenses, Net)
  - Category breakdown with progress bars
  - Recent transactions list
  - **AI Spending Analysis** panel (bottom right)
    - Shows patterns, anomalies, suggestions
    - Includes trace ID and prompt version info

### 4. AI Coach
- **What to show**:
  - Ask a question: "I feel like I'm spending too much on dining. What should I do?"
  - Show AI response with structured format (key points, suggested actions)
  - Show conversation history persistence
  - **Key point**: Every coach interaction is logged to Opik with evaluation scores

### 5. Insights
- **What to show**:
  - Daily/weekly insight generation
  - Personalized, actionable insights
  - **Key point**: Insights are evaluated for relevance, actionability, and safety

## Opik Integration Demo (5 minutes)

### 1. Access Opik Dashboard
- **URL**: `https://www.comet.com/opik/pennywise-coach/home`
- **Project**: `pennywise-coach`

### 2. Show Traces
- **Location**: LLM Evaluation (Opik) → Traces
- **Filter by**: `pennywise-coach`
- **What to show**:
  - Recent traces for `coach-chat`, `insights-generation`, `spending-analysis`
  - Each trace shows:
    - Input (user profile, question, transactions)
    - Output (AI response)
    - Metadata (latency, token usage, evaluation scores)
    - Tags (prompt version, experiment ID)

### 3. Show Pipeline Spans
- **Filter by**: `span`
- **What to show**:
  - Spans for `prompt-build`, `llm-call`, `parse`, `evaluation`
  - Latency breakdown per stage
  - Token usage (input/output tokens)
  - Error taxonomy (if any errors occurred)

### 4. Show Evaluations
- **Filter by**: `evaluation`
- **What to show**:
  - Evaluation traces with scores (clarity, helpfulness, tone, financial alignment)
  - Safety flags (should be 0 for production responses)
  - Evaluator tags (`evaluator:heuristic` or `evaluator:llm_judge`)

### 5. Show Experiments
- **Location**: `/experiments` page in the app
- **What to show**:
  - Run an experiment (select `v3-structured-json` prompt version)
  - Show experiment results with summary statistics
  - Compare two experiments (v1 vs v3)
  - Show improvement metrics and regression detection

### 6. Show Safety Tradeoff Metrics
- **Filter by**: `safety-tradeoff-metrics`
- **What to show**:
  - Precision, recall, F1 scores
  - True positives, false positives, false negatives
  - Demonstrates guardrail effectiveness

## Key Talking Points

### Best Use of Opik
1. **Comprehensive Trace Logging**: Every AI interaction is logged with full context
2. **Pipeline Observability**: Spans show breakdown of prompt-build → LLM call → parse → evaluation
3. **Automated Evaluation**: Both heuristic and LLM-as-judge evaluations
4. **Experiment Tracking**: Systematic comparison of prompt versions with regression detection
5. **Safety Metrics**: False positive/negative tracking with precision/recall/F1
6. **Error Taxonomy**: Categorized errors for better debugging

### Financial Health
1. **Real-world Relevance**: Addresses actual user concerns (overspending, irregular income, emergency funds)
2. **Calm, Supportive Tone**: Reduces financial anxiety with non-judgmental guidance
3. **Actionable Insights**: Provides specific, realistic next steps
4. **Safety First**: No risky advice, no guarantees, no PII leakage
5. **Goal Alignment**: Responses align with user goals and concerns

## Demo Flow Summary

1. **Landing → Sign Up** (30s)
2. **Onboarding** (30s)
3. **Dashboard** (1min) - Show AI analysis
4. **Coach Chat** (1min) - Ask a question, show response
5. **Opik Dashboard** (3min) - Show traces, spans, evaluations, experiments
6. **Q&A** (remaining time)

## Tips for Judges

- **If Opik dashboard is slow**: Use filters to narrow down traces
- **If experiments take time**: Pre-run experiments before demo
- **If AI is slow**: Show fallback responses (they're also logged to Opik)
- **If something breaks**: Show error taxonomy in spans (demonstrates observability)

---

**For detailed Opik navigation**, see `docs/OPIK_JUDGE_GUIDE.md`
**For experiment results**, see `docs/EXPERIMENT_RESULTS_SUMMARY.md`
