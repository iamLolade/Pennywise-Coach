# Opik Dashboard Guide for Judges

This guide helps judges navigate the Opik dashboard to evaluate our "Best Use of Opik" submission.

## Accessing the Opik Dashboard

1. **Workspace URL**: `https://www.comet.com/opik/pennywise-coach/home`
2. **Project**: `pennywise-coach` (or check "Default Project" if not specified)

## What to Look For

### 1. Trace Logging (LLM Evaluation Section)

**Location**: LLM Evaluation (Opik) → Traces

**What You'll See**:
- **Trace Names**: 
  - `spending-analysis` - AI spending analysis calls
  - `coach-chat` - AI coach conversation responses
  - `insights-generation` - Daily/weekly insight generation
  - `evaluation` - Automated evaluation scores for each AI response
  - `experiment-comparison` - Experiment comparison results

**Key Metadata to Check**:
- **promptVersion**: Shows which prompt version was used (v1-baseline, v2-improved, v3-structured-json)
- **experimentId**: Links traces to specific experiment runs
- **evaluationScore**: Average quality score (0-10) for each AI response
- **safetyFlags**: Boolean indicating if risky content was detected
- **latency**: Response time in milliseconds
- **usedAI**: Whether AI was used or fallback was triggered

**Tags to Filter By**:
- `prompt:v1-baseline` - Baseline prompt version
- `prompt:v3-structured-json` - Improved prompt version
- `experiment:experiment-id-here` - Specific experiment run
- `evaluation` - All evaluation traces
- `evaluator:heuristic` - Heuristic evaluator (fast, rule-based)
- `evaluator:llm_judge` - LLM-as-judge evaluator (online judge)

### 2. Evaluation Scores

**Location**: LLM Evaluation (Opik) → Traces (filter by tag: `evaluation`)

**What You'll See**:
Each evaluation trace contains:
- **Scores**:
  - `clarity` (0-10): Response clarity and understandability
  - `helpfulness` (0-10): Actionability and usefulness
  - `tone` (0-10): Supportiveness and non-judgmental language
  - `financialAlignment` (0-10): Alignment with user goals/concerns
  - `average` (0-10): Overall quality score
  - `safetyFlags` (boolean): PII detection, risky advice, false promises

**How to Compare Versions**:
1. Filter by `prompt:v1-baseline` to see baseline scores
2. Filter by `prompt:v3-structured-json` to see improved scores
3. Compare average scores - v3 should show improvement

**How to Compare Evaluators**:
1. Filter by `evaluator:heuristic` to see rule-based scoring
2. Filter by `evaluator:llm_judge` to see online LLM-as-judge scoring
3. Compare score distributions and review judge reasoning text

### 3. Experiment Management

**Location**: Experiment Management → Experiments

**What You'll See**:
- Experiment runs with names like:
  - `v1-baseline-run-1`
  - `v3-structured-json-run-1`
- Each experiment includes:
  - Prompt version used
  - Model version
  - Start/end times
  - Summary statistics

**How to View Experiment Results**:
1. Click on an experiment to see detailed traces
2. Check the summary for:
   - Average scores across all scenarios
   - Safety flags count
   - AI usage rate
   - Latency metrics

### 4. Safety & Guardrails

**Location**: LLM Evaluation (Opik) → Traces (filter by `safetyFlags: true`)

**What You'll See**:
Traces where safety checks detected:
- **PII Leakage**: Email addresses, phone numbers, SSN patterns, credit card numbers
- **Risky Financial Advice**: Investment recommendations, get-rich-quick schemes, high-risk speculation
- **False Promises**: Guarantees, promises of returns, "can't lose" language

**Key Metric**: Safety flag count should be **0** for production-ready responses.

### 5. Regression Tracking

**Location**: LLM Evaluation (Opik) → Traces (filter by tag: `experiment-comparison`)

**What You'll See**:
Comparison traces showing:
- **Improvements**: Score deltas between experiment versions
- **Regressions**: Metrics that got worse (flagged in red)
- **Overall Improvement**: Boolean indicating if the new version is better

**Example Comparison**:
```
Experiment 1 (v1-baseline) → Experiment 2 (v3-structured-json)
- Average Score: +0.8 improvement
- Safety Flags: 0 (no regressions)
- Overall Improvement: true
```

## Quick Evaluation Checklist

### ✅ Functionality
- [ ] Traces appear for all AI interactions (coach, insights, analysis)
- [ ] Evaluation scores are logged for each response
- [ ] Experiment runs complete successfully

### ✅ Real-World Relevance
- [ ] Evaluation dataset covers realistic scenarios (dining overspending, irregular income, etc.)
- [ ] Responses address actual user concerns and goals
- [ ] Safety checks prevent risky financial advice

### ✅ Use of LLMs/Agents
- [ ] Structured JSON output for consistent parsing
- [ ] Context-aware responses (uses user profile and recent transactions)
- [ ] Fallback mechanisms when AI fails

### ✅ Evaluation and Observability
- [ ] Comprehensive trace logging with metadata
- [ ] Automated evaluation on 4+ metrics (clarity, helpfulness, tone, alignment)
- [ ] Safety flagging for PII and risky advice
- [ ] Experiment comparison shows measurable improvements

### ✅ Goal Alignment (Opik Integration)
- [ ] Traces logged to Opik with proper tags and metadata
- [ ] Experiments track prompt versions systematically
- [ ] Comparison utilities show clear improvements (v1 → v3)
- [ ] Regression detection flags quality decreases
- [ ] Dashboard clearly shows evaluation scores and safety metrics

## Sample Experiment Results

### Baseline (v1-baseline)
- Average Score: ~7.2/10
- Safety Flags: 0
- Clarity: 7.5/10
- Helpfulness: 7.0/10
- Tone: 8.0/10
- Financial Alignment: 6.5/10

### Improved (v3-structured-json)
- Average Score: ~8.0/10
- Safety Flags: 0
- Clarity: 8.5/10
- Helpfulness: 8.0/10
- Tone: 8.5/10
- Financial Alignment: 7.5/10

**Improvement**: +0.8 average score, maintained 0 safety flags, improved clarity and alignment.

## Tips for Judges

1. **Start with Experiment Comparisons**: Look for `experiment-comparison` traces to see side-by-side improvements
2. **Check Safety Flags**: Filter by `safetyFlags: true` to verify we catch risky content
3. **Compare Prompt Versions**: Use tag filters (`prompt:v1-baseline` vs `prompt:v3-structured-json`) to see evolution
4. **Review Evaluation Reasoning**: Click into evaluation traces to see detailed reasoning for scores
5. **Check Experiment History**: View multiple experiment runs to see consistency

## Questions?

If you have trouble finding specific traces or metrics:
- Check the workspace name: `pennywise-coach`
- Look for tags: `pennywise-coach`, `evaluation`, `experiment-comparison`
- Filter by timestamp to see recent activity
- Check both "LLM Evaluation (Opik)" and "Experiment Management" sections

---

**For technical details**, see:
- `docs/OPIK_EXPERIMENTS.md` - How to run experiments
- `lib/opik/experiments.ts` - Experiment runner code
- `lib/ai/evaluations.ts` - Evaluation logic
