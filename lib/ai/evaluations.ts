/**
 * Evaluation logic for AI responses
 * 
 * Provides automated scoring of coach and insight responses
 * for quality, safety, and alignment with user goals.
 */

export interface CoachResponseEvaluation {
  clarity: number; // 0-10: How clear and understandable is the response?
  helpfulness: number; // 0-10: How helpful and actionable is the response?
  tone: number; // 0-10: Is the tone supportive and non-judgmental?
  financialAlignment: number; // 0-10: Does it align with user's goals/concerns?
  safetyFlags: boolean; // Are there any safety concerns (advice, guarantees, etc.)?
  average: number; // Average of all scores
  reasoning?: string; // Brief explanation of scores
}

/**
 * Evaluate a coach response for quality and safety
 */
export function evaluateCoachResponse(
  response: string,
  userQuestion: string,
  userProfile: {
    goals: string[];
    concerns: string[];
  }
): CoachResponseEvaluation {
  const lowerResponse = response.toLowerCase();
  const lowerQuestion = userQuestion.toLowerCase();

  // Safety checks
  const safetyFlags =
    lowerResponse.includes("guarantee") ||
    lowerResponse.includes("guaranteed") ||
    lowerResponse.includes("will definitely") ||
    lowerResponse.includes("promise") ||
    lowerResponse.includes("invest in") ||
    lowerResponse.includes("buy stock") ||
    lowerResponse.includes("buy crypto") ||
    lowerResponse.includes("specific investment");

  // Clarity: Check for jargon, length, structure
  let clarity = 10;
  const jargonWords = [
    "amortization",
    "liquidity",
    "equity",
    "derivative",
    "leverage",
    "arbitrage",
    "hedge",
  ];
  const hasJargon = jargonWords.some((word) => lowerResponse.includes(word));
  if (hasJargon) clarity -= 3;
  if (response.length > 500) clarity -= 2; // Too long
  if (response.length < 20) clarity -= 3; // Too short
  if (!response.includes(".") && !response.includes("?")) clarity -= 1; // No sentence structure
  clarity = Math.max(0, Math.min(10, clarity));

  // Helpfulness: Check for actionable advice, relevance to question
  let helpfulness = 7; // Start with baseline
  if (lowerResponse.includes("suggest") || lowerResponse.includes("try") || lowerResponse.includes("consider")) {
    helpfulness += 1;
  }
  if (lowerResponse.includes("step") || lowerResponse.includes("action")) {
    helpfulness += 1;
  }
  // Check if response addresses the question
  const questionKeywords = lowerQuestion.split(" ").filter((w) => w.length > 3);
  const relevantKeywords = questionKeywords.filter((kw) => lowerResponse.includes(kw));
  if (relevantKeywords.length > 0) {
    helpfulness += 1;
  }
  helpfulness = Math.max(0, Math.min(10, helpfulness));

  // Tone: Check for supportive language, avoid judgmental language
  let tone = 8; // Start positive
  const supportiveWords = [
    "support",
    "help",
    "understand",
    "progress",
    "achieve",
    "encourage",
    "small step",
    "you've got this",
  ];
  const judgmentalWords = [
    "should have",
    "shouldn't have",
    "bad decision",
    "wrong",
    "mistake",
    "irresponsible",
    "waste",
  ];
  const hasSupportive = supportiveWords.some((word) => lowerResponse.includes(word));
  const hasJudgmental = judgmentalWords.some((word) => lowerResponse.includes(word));
  if (hasSupportive) tone += 1;
  if (hasJudgmental) tone -= 3;
  tone = Math.max(0, Math.min(10, tone));

  // Financial Alignment: Check if response references user goals/concerns
  let financialAlignment = 6; // Baseline
  const allGoals = userProfile.goals.join(" ").toLowerCase();
  const allConcerns = userProfile.concerns.join(" ").toLowerCase();
  const responseLower = lowerResponse;
  if (userProfile.goals.some((goal) => responseLower.includes(goal.toLowerCase()))) {
    financialAlignment += 2;
  }
  if (userProfile.concerns.some((concern) => responseLower.includes(concern.toLowerCase()))) {
    financialAlignment += 2;
  }
  financialAlignment = Math.max(0, Math.min(10, financialAlignment));

  const average = (clarity + helpfulness + tone + financialAlignment) / 4;

  const reasoning = `Clarity: ${clarity}/10 (${hasJargon ? "contains jargon" : "clear language"}), ` +
    `Helpfulness: ${helpfulness}/10 (${helpfulness >= 8 ? "actionable" : "general"}), ` +
    `Tone: ${tone}/10 (${hasJudgmental ? "judgmental" : hasSupportive ? "supportive" : "neutral"}), ` +
    `Alignment: ${financialAlignment}/10 (${financialAlignment >= 8 ? "aligned with goals" : "generic"})`;

  return {
    clarity,
    helpfulness,
    tone,
    financialAlignment,
    safetyFlags,
    average: Math.round(average * 10) / 10,
    reasoning,
  };
}

/**
 * Evaluation result for insights
 */
export interface InsightEvaluationResult {
  clarity: number; // 0-10: How clear and understandable is the insight?
  relevance: number; // 0-10: How relevant is it to the user's financial situation?
  tone: number; // 0-10: Is the tone supportive and encouraging?
  actionability: number; // 0-10: Is the suggested action clear and achievable?
  safetyFlags: boolean; // Are there any safety concerns?
  average: number; // Average of all scores
  reasoning?: string; // Brief explanation of scores
}

/**
 * Evaluate an insight for quality and safety
 */
export function evaluateInsight(
  insight: { title: string; content: string; suggestedAction: string },
  userProfile: {
    goals: string[];
    concerns: string[];
  },
  type: "daily" | "weekly"
): InsightEvaluationResult {
  const lowerContent = (insight.content + " " + insight.title).toLowerCase();
  const lowerAction = insight.suggestedAction.toLowerCase();

  // Safety checks
  const safetyFlags =
    lowerContent.includes("guarantee") ||
    lowerContent.includes("guaranteed") ||
    lowerContent.includes("will definitely") ||
    lowerContent.includes("promise") ||
    lowerContent.includes("invest in") ||
    lowerContent.includes("buy stock") ||
    lowerContent.includes("buy crypto") ||
    lowerContent.includes("specific investment");

  // Clarity: Check for jargon, length, structure
  let clarity = 10;
  const jargonWords = [
    "amortization",
    "liquidity",
    "equity",
    "derivative",
    "leverage",
    "arbitrage",
    "hedge",
  ];
  const hasJargon = jargonWords.some((word) => lowerContent.includes(word));
  if (hasJargon) clarity -= 3;
  const totalLength = insight.title.length + insight.content.length;
  if (totalLength > 200) clarity -= 1; // Too long
  if (totalLength < 30) clarity -= 2; // Too short
  if (!insight.content.includes(".")) clarity -= 1; // No sentence structure
  clarity = Math.max(0, Math.min(10, clarity));

  // Relevance: Check if insight references user's financial situation, goals, or concerns
  let relevance = 7; // Baseline
  const allGoals = userProfile.goals.join(" ").toLowerCase();
  const allConcerns = userProfile.concerns.join(" ").toLowerCase();
  if (userProfile.goals.some((goal) => lowerContent.includes(goal.toLowerCase()))) {
    relevance += 2;
  }
  if (userProfile.concerns.some((concern) => lowerContent.includes(concern.toLowerCase()))) {
    relevance += 1;
  }
  // Check for financial context words
  const financialWords = ["spending", "saving", "budget", "expense", "income", "transaction"];
  if (financialWords.some((word) => lowerContent.includes(word))) {
    relevance += 1;
  }
  relevance = Math.max(0, Math.min(10, relevance));

  // Tone: Check for supportive language, avoid judgmental language
  let tone = 8; // Start positive
  const supportiveWords = [
    "great",
    "good",
    "progress",
    "encourage",
    "support",
    "help",
    "achieve",
    "you've got this",
    "keep up",
    "well done",
  ];
  const judgmentalWords = [
    "should have",
    "shouldn't have",
    "bad",
    "wrong",
    "mistake",
    "irresponsible",
    "waste",
    "too much",
  ];
  const hasSupportive = supportiveWords.some((word) => lowerContent.includes(word));
  const hasJudgmental = judgmentalWords.some((word) => lowerContent.includes(word));
  if (hasSupportive) tone += 1;
  if (hasJudgmental) tone -= 3;
  tone = Math.max(0, Math.min(10, tone));

  // Actionability: Check if suggested action is clear and specific
  let actionability = 7; // Baseline
  if (insight.suggestedAction && insight.suggestedAction.length > 0) {
    actionability += 1; // Has an action
  }
  if (lowerAction.includes("try") || lowerAction.includes("consider") || lowerAction.includes("set")) {
    actionability += 1; // Action-oriented language
  }
  if (lowerAction.includes("specific") || lowerAction.match(/\d+/)) {
    actionability += 1; // Specific or numeric
  }
  if (insight.suggestedAction.length < 10) {
    actionability -= 2; // Too vague
  }
  if (insight.suggestedAction.length > 150) {
    actionability -= 1; // Too long/complex
  }
  actionability = Math.max(0, Math.min(10, actionability));

  const average = (clarity + relevance + tone + actionability) / 4;

  const reasoning = `Clarity: ${clarity}/10 (${hasJargon ? "contains jargon" : "clear language"}), ` +
    `Relevance: ${relevance}/10 (${relevance >= 8 ? "highly relevant" : "generic"}), ` +
    `Tone: ${tone}/10 (${hasJudgmental ? "judgmental" : hasSupportive ? "supportive" : "neutral"}), ` +
    `Actionability: ${actionability}/10 (${actionability >= 8 ? "clear action" : "vague"})`;

  return {
    clarity,
    relevance,
    tone,
    actionability,
    safetyFlags,
    average: Math.round(average * 10) / 10,
    reasoning,
  };
}
