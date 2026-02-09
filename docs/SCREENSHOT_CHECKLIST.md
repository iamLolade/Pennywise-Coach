# Screenshot Checklist for Judge Evaluation

Use this checklist to capture key screenshots demonstrating the Opik integration and financial health features.

## Required Screenshots

### 1. Application Screenshots

#### Landing Page
- [ ] Full landing page (hero section visible)
- [ ] Mobile responsive view (narrow viewport)
- [ ] Sample insight modal (click "See a sample insight")

#### Onboarding
- [ ] Currency selection dropdown (showing multiple currencies)
- [ ] Income range (dynamically updated based on currency)
- [ ] Goals and concerns selection

#### Dashboard
- [ ] Full dashboard with spending summary
- [ ] AI Spending Analysis panel (showing trace ID and prompt version)
- [ ] Category breakdown with progress bars
- [ ] Recent transactions list

#### AI Coach
- [ ] Coach chat interface with conversation
- [ ] Structured AI response (key points, suggested actions)
- [ ] Conversation history

#### Insights
- [ ] Daily/weekly insight generation
- [ ] Insight card with title, content, suggested action

#### Experiments UI
- [ ] `/experiments` page
- [ ] Experiment run form
- [ ] Experiment comparison results
- [ ] Experiment history list

### 2. Opik Dashboard Screenshots

#### Traces Overview
- [ ] LLM Evaluation → Traces (filtered by `pennywise-coach`)
- [ ] List of recent traces (coach-chat, insights-generation, spending-analysis)
- [ ] One detailed trace view (showing input, output, metadata)

#### Pipeline Spans
- [ ] Spans filtered by tag: `span`
- [ ] One span showing latency breakdown (prompt-build, llm-call, parse, evaluation)
- [ ] Span with token usage (input/output tokens)
- [ ] Span with error taxonomy (if any errors)

#### Evaluations
- [ ] Evaluations filtered by tag: `evaluation`
- [ ] Evaluation trace showing scores (clarity, helpfulness, tone, financial alignment)
- [ ] Evaluator tags (`evaluator:heuristic` and `evaluator:llm_judge`)

#### Experiments
- [ ] Experiment traces (filtered by `experiment:experiment-id`)
- [ ] Experiment comparison trace (filtered by `experiment-comparison`)
- [ ] Comparison showing improvements (v1 → v3)

#### Safety Metrics
- [ ] Safety tradeoff metrics trace (filtered by `safety-tradeoff-metrics`)
- [ ] Metrics showing precision, recall, F1 score
- [ ] TP/FP/FN/TN breakdown

### 3. Code Screenshots (Optional but Helpful)

- [ ] Opik client code (`lib/opik/client.ts`) showing trace logging
- [ ] Experiment runner code (`lib/opik/experiments.ts`) showing comparison logic
- [ ] Evaluation code (`lib/ai/evaluations.ts`) showing safety checks
- [ ] Span logging in route (`app/api/ai/coach/route.ts`)

## Screenshot Organization

Organize screenshots in folders:
```
screenshots/
├── app/
│   ├── landing.png
│   ├── onboarding.png
│   ├── dashboard.png
│   ├── coach.png
│   ├── insights.png
│   └── experiments.png
├── opik/
│   ├── traces-overview.png
│   ├── trace-detail.png
│   ├── spans.png
│   ├── evaluations.png
│   ├── experiments.png
│   └── safety-metrics.png
└── code/
    ├── opik-client.png
    ├── experiments.png
    └── evaluations.png
```

## Tips for Screenshots

1. **Use high resolution**: At least 1920x1080 for desktop, 375x667 for mobile
2. **Show relevant data**: Make sure traces show actual data (not empty states)
3. **Include filters**: Show Opik filters in screenshots (demonstrates navigation)
4. **Highlight key metrics**: Use annotations or arrows to point out important numbers
5. **Show progression**: Screenshot experiment comparison showing v1 → v3 improvement

## Quick Screenshot Commands

### macOS
```bash
# Full screen
Cmd + Shift + 3

# Selection
Cmd + Shift + 4

# Window
Cmd + Shift + 4, then Space
```

### Windows
```bash
# Snipping Tool
Win + Shift + S
```

---

**Note**: Screenshots should be taken after running at least one experiment and generating some coach/insight interactions to show real data in Opik.
