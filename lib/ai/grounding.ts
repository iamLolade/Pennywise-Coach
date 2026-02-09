import type { Transaction, UserProfile } from "@/types";
import { formatMoney } from "@/lib/utils/money";
import {
  humanizeConcernIds,
  humanizeGoalIds,
  humanizeIncomeRange,
} from "@/lib/ai/profileHumanizer";

type GroundedAnswer =
  | { kind: "profile_salary_range"; response: string }
  | { kind: "profile_currency"; response: string }
  | { kind: "profile_goals"; response: string }
  | { kind: "profile_concerns"; response: string }
  | { kind: "transactions_last_expense"; response: string }
  | { kind: "transactions_last_income"; response: string }
  | { kind: "transactions_last_transaction"; response: string }
  | { kind: "transactions_spend_total"; response: string }
  | { kind: "transactions_spend_by_category"; response: string };

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

export function questionNeedsTransactions(question: string): boolean {
  const q = normalize(question);
  return (
    q.includes("last expense") ||
    q.includes("last transaction") ||
    q.includes("last purchase") ||
    q.includes("last spend") ||
    q.includes("most recent") ||
    q.includes("recent expense") ||
    q.includes("what did i spend") ||
    q.includes("what was my last") ||
    q.includes("how much did i spend") ||
    q.includes("this week") ||
    q.includes("last week") ||
    q.includes("this month") ||
    q.includes("today") ||
    q.includes("yesterday")
  );
}

function getWindowDays(question: string): number | null {
  const q = normalize(question);
  if (q.includes("today")) return 0;
  if (q.includes("yesterday")) return 1;
  if (q.includes("this week") || q.includes("last week")) return 7;
  if (q.includes("this month")) return 30;
  return null;
}

function filterTransactionsByDays(transactions: Transaction[], days: number): Transaction[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (days > 0) start.setDate(start.getDate() - days);
  // days === 0 means "today"
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= start;
  });
}

function findCategoryMention(question: string, transactions: Transaction[]): string | null {
  const q = normalize(question);
  const categories = Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);
  const exact = categories.find((c) => q.includes(c.toLowerCase()));
  return exact || null;
}

export function buildGroundedAnswer(args: {
  question: string;
  userProfile: UserProfile;
  transactions?: Transaction[];
}): GroundedAnswer | null {
  const { question, userProfile, transactions } = args;
  const q = normalize(question);
  const currency = userProfile.currency || "USD";

  // Profile facts (deterministic)
  if (
    q.includes("annual salary") ||
    q.includes("salary range") ||
    q.includes("income range") ||
    q.includes("my income")
  ) {
    const incomeLabel = humanizeIncomeRange(userProfile.incomeRange, currency);
    return {
      kind: "profile_salary_range",
      response: `Your annual income range (from your profile) is **${incomeLabel}**.`,
    };
  }

  if (q.includes("my currency") || q.includes("preferred currency")) {
    return {
      kind: "profile_currency",
      response: `Your preferred currency (from your profile) is **${currency}**.`,
    };
  }

  if (q.includes("my goals") || q.includes("financial goals")) {
    const goals = humanizeGoalIds(userProfile.goals || []);
    return {
      kind: "profile_goals",
      response:
        goals.length > 0
          ? `Your financial goals (from your profile): ${goals.join(", ")}.`
          : `You don’t have any goals saved yet. You can add them in Settings.`,
    };
  }

  if (q.includes("my concerns") || q.includes("financial concerns")) {
    const concerns = humanizeConcernIds(userProfile.concerns || []);
    return {
      kind: "profile_concerns",
      response:
        concerns.length > 0
          ? `Your financial concerns (from your profile): ${concerns.join(", ")}.`
          : `You don’t have any concerns saved yet. You can add them in Settings.`,
    };
  }

  // Transaction facts (deterministic). If we don't have transactions, we must not guess.
  const txs = transactions || [];
  if (txs.length === 0) {
    if (questionNeedsTransactions(question)) {
      return {
        kind: "transactions_last_transaction",
        response:
          "I don’t have any transactions available yet, so I can’t answer that accurately. Add a transaction first, then ask again.",
      };
    }
    return null;
  }

  const latest = txs[0]; // already ordered desc by date in DB helper
  const latestExpense = txs.find((t) => t.amount < 0);
  const latestIncome = txs.find((t) => t.amount > 0);

  // Deterministic spend totals in common time windows (to prevent guessing)
  const windowDays = getWindowDays(question);
  if (
    (q.includes("how much") || q.includes("what did i spend")) &&
    (q.includes("spend") || q.includes("spent"))
  ) {
    const windowTxs = windowDays === null ? txs : filterTransactionsByDays(txs, windowDays);
    const expenseTxs = windowTxs.filter((t) => t.amount < 0);
    const category = findCategoryMention(question, txs);

    if (category) {
      const categoryTotal = expenseTxs
        .filter((t) => t.category.toLowerCase() === category.toLowerCase())
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return {
        kind: "transactions_spend_by_category",
        response: `You spent **${formatMoney(categoryTotal, currency, {
          maximumFractionDigits: 2,
        })}** on **${category}**${
          windowDays === null ? "" : windowDays === 0 ? " today" : ` in the last ${windowDays} days`
        }.`,
      };
    }

    const total = expenseTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return {
      kind: "transactions_spend_total",
      response: `Your total spending is **${formatMoney(total, currency, {
        maximumFractionDigits: 2,
      })}**${
        windowDays === null ? "" : windowDays === 0 ? " today" : ` in the last ${windowDays} days`
      }.`,
    };
  }

  if (q.includes("last expense") || q.includes("last purchase") || q.includes("last spend")) {
    if (!latestExpense) {
      return {
        kind: "transactions_last_expense",
        response: "I don’t see any expenses yet—only income transactions so far.",
      };
    }
    return {
      kind: "transactions_last_expense",
      response: `Your last expense was **${formatMoney(Math.abs(latestExpense.amount), currency, {
        maximumFractionDigits: 2,
      })}** in **${latestExpense.category}** on **${latestExpense.date}** (“${latestExpense.description}”).`,
    };
  }

  if (q.includes("last income") || q.includes("last paycheck") || q.includes("last salary")) {
    if (!latestIncome) {
      return {
        kind: "transactions_last_income",
        response: "I don’t see any income transactions yet.",
      };
    }
    return {
      kind: "transactions_last_income",
      response: `Your last income was **${formatMoney(latestIncome.amount, currency, {
        maximumFractionDigits: 2,
      })}** on **${latestIncome.date}** (“${latestIncome.description}”).`,
    };
  }

  if (q.includes("last transaction") || q.includes("most recent transaction")) {
    return {
      kind: "transactions_last_transaction",
      response: `Your most recent transaction was **${formatMoney(
        Math.abs(latest.amount),
        currency,
        { maximumFractionDigits: 2 }
      )}** in **${latest.category}** on **${latest.date}** (“${latest.description}”).`,
    };
  }

  return null;
}

