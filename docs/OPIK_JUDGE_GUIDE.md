# Opik Dashboard Guide for Judges

This guide helps judges navigate the Opik dashboard to evaluate our "Best Use of Opik" submission.

**Quick Navigation**: See [OPIK_QUICK_GUIDE.md](OPIK_QUICK_GUIDE.md) for a faster reference.

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

### 4a. Safety Tradeoff Metrics (False Positives/Negatives)

**Location**: LLM Evaluation (Opik) → Traces (filter by tag: `safety-tradeoff-metrics`)

**What You'll See**:
Traces showing safety detection performance:
- **True Positives (TP)**: Correctly flagged unsafe content
- **False Positives (FP)**: Incorrectly flagged safe content (overly cautious)
- **False Negatives (FN)**: Missed unsafe content (safety gap)
- **True Negatives (TN)**: Correctly identified safe content

**Metrics**:
- **Precision**: TP / (TP + FP) - How many flagged items were actually unsafe (higher = fewer false alarms)
- **Recall**: TP / (TP + FN) - How many unsafe items were caught (higher = fewer missed risks)
- **F1 Score**: Harmonic mean of precision and recall (balanced metric)

**Interpretation**:
- **High Precision + High Recall**: Ideal - catches unsafe content without false alarms
- **High Precision + Low Recall**: Overly cautious - misses some risks but rarely false alarms
- **Low Precision + High Recall**: Overly sensitive - catches risks but many false alarms
- **Low Precision + Low Recall**: Poor safety detection

**Example**: Precision 0.95, Recall 0.90, F1 0.92 means:
- 95% of flagged content is actually unsafe (5% false positives)
- 90% of unsafe content is caught (10% false negatives)
- Overall balanced performance (F1 = 0.92)

### 5. Pipeline Spans (Deep Observability)

**Location**: LLM Evaluation (Opik) → Traces (filter by tag: `span`)

**What You'll See**:
Each AI interaction is broken down into spans showing the full pipeline:
- **prompt-build**: Time to construct the prompt from user context
- **llm-call**: Time for the LLM API call (includes token usage if available)
- **parse**: Time to parse and structure the LLM response
- **evaluation**: Time to evaluate response quality and safety

**Key Metrics in Spans**:
- **Latency breakdown**: See where time is spent (prompt build vs LLM call vs parse)
- **Token usage**: Input/output token counts (when available from API)
- **Error taxonomy**: Categorized errors (timeout, parse, API, fallback, validation)
- **Structured vs plain text**: Whether response was successfully parsed as JSON

**How to View**:
1. Filter traces by tag: `span`
2. Filter by parent trace ID: `parent:trace-id-here`
3. Check metadata for latency breakdown and token usage
4. Look for error categories in failed spans

**Example Pipeline Breakdown**:
- prompt-build: 5ms
- llm-call: 2100ms (input: 150 tokens, output: 80 tokens)
- parse: 12ms (isStructured: true)
- evaluation: 8ms (averageScore: 8.2)

### 6. Regression Tracking

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
- [ ] Pipeline spans showing breakdown (prompt-build → llm-call → parse → evaluation)
- [ ] Latency breakdown per pipeline stage
- [ ] Token usage tracking (input/output tokens)
- [ ] Error taxonomy (timeout, parse, API, fallback, validation)
- [ ] Automated evaluation on 4+ metrics (clarity, helpfulness, tone, alignment)
- [ ] Safety flagging for PII and risky advice
- [ ] Safety tradeoff metrics (precision, recall, F1) for false positive/negative tracking
- [ ] Experiment comparison shows measurable improvements

### ✅ Goal Alignment (Opik Integration)
- [ ] Traces logged to Opik with proper tags and metadata
- [ ] Experiments track prompt versions systematically
- [ ] Comparison utilities show clear improvements (v1 → v3)
- [ ] Regression detection flags quality decreases
- [ ] Dashboard clearly shows evaluation scores and safety metrics
- [ ] Safety tradeoff metrics demonstrate guardrail effectiveness (precision/recall/F1)

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
