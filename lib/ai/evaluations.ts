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
