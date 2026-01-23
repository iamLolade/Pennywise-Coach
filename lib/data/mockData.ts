/**
 * Mock data generator for sample transactions
 * 
 * Generates realistic transaction data based on user profile
 * to populate the dashboard with sample financial data.
 */

import type { Transaction, UserProfile } from "@/types";

const categories = {
    income: ["Salary", "Freelance", "Investment", "Bonus"],
    expenses: [
        "Dining",
        "Groceries",
        "Transportation",
        "Housing",
        "Utilities",
        "Entertainment",
        "Shopping",
        "Healthcare",
        "Education",
        "Subscriptions",
        "Travel",
        "Personal Care",
    ],
};

const descriptions = {
    Dining: [
        "Restaurant - Dinner",
        "Coffee shop",
        "Fast food",
        "Restaurant - Lunch",
        "Restaurant - Brunch",
        "Food delivery",
        "Cafe",
        "Restaurant - Group dinner",
    ],
    Groceries: [
        "Supermarket",
        "Grocery store",
        "Farmers market",
        "Convenience store",
        "Online grocery order",
    ],
    Transportation: [
        "Gas station",
        "Uber/Lyft",
        "Public transit",
        "Parking",
        "Car maintenance",
        "Taxi",
    ],
    Housing: ["Rent", "Mortgage", "Home insurance", "Property tax"],
    Utilities: [
        "Electric bill",
        "Water bill",
        "Internet",
        "Phone bill",
        "Gas bill",
    ],
    Entertainment: [
        "Movie tickets",
        "Concert",
        "Streaming service",
        "Video games",
        "Books",
        "Theater",
    ],
    Shopping: [
        "Clothing",
        "Electronics",
        "Home goods",
        "Online purchase",
        "Department store",
    ],
    Healthcare: [
        "Doctor visit",
        "Pharmacy",
        "Dental",
        "Health insurance",
        "Gym membership",
    ],
    Education: ["Course", "Books", "Workshop", "Online course"],
    Subscriptions: [
        "Netflix",
        "Spotify",
        "Amazon Prime",
        "Software subscription",
        "Magazine",
    ],
    Travel: [
        "Hotel",
        "Flight",
        "Airbnb",
        "Travel booking",
        "Vacation",
    ],
    "Personal Care": [
        "Haircut",
        "Spa",
        "Cosmetics",
        "Personal care products",
    ],
};

// Income ranges mapped to monthly income estimates
const incomeRangeToMonthly: Record<string, number> = {
    "under-30k": 2000,
    "30k-50k": 3500,
    "50k-75k": 5000,
    "75k-100k": 7000,
    "100k-150k": 10000,
    "over-150k": 15000,
    "prefer-not-to-say": 5000, // Default to middle range
};

// Typical spending percentages by category (as fraction of income)
const spendingPatterns: Record<string, number> = {
    Housing: 0.30,
    Groceries: 0.12,
    Dining: 0.08,
    Transportation: 0.10,
    Utilities: 0.05,
    Entertainment: 0.05,
    Shopping: 0.08,
    Healthcare: 0.05,
    Education: 0.03,
    Subscriptions: 0.02,
    Travel: 0.04,
    "Personal Care": 0.03,
};

/**
 * Generate a random date within the last N days
 */
function randomDateInPast(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString().split("T")[0];
}

/**
 * Generate a random description for a category
 */
function randomDescription(category: string): string {
    const categoryDescriptions = descriptions[category as keyof typeof descriptions];
    if (!categoryDescriptions || categoryDescriptions.length === 0) {
        return `${category} - Transaction`;
    }
    return categoryDescriptions[
        Math.floor(Math.random() * categoryDescriptions.length)
    ];
}

/**
 * Generate a random amount for a category based on income range
 */
function randomAmount(
    category: string,
    monthlyIncome: number,
    isIncome: boolean = false
): number {
    if (isIncome) {
        // Income transactions are typically larger and positive
        if (category === "Salary") {
            return monthlyIncome;
        }
        // Other income types (freelance, bonus, etc.)
        return Math.floor(Math.random() * (monthlyIncome * 0.3)) + monthlyIncome * 0.1;
    }

    // Expense transactions are negative
    const monthlyBudget = monthlyIncome * (spendingPatterns[category] || 0.05);
    const variance = monthlyBudget * 0.4; // 40% variance
    const baseAmount = monthlyBudget / 4; // Assume ~4 transactions per month per category
    const amount = baseAmount + (Math.random() * variance * 2 - variance);

    return -Math.max(5, Math.floor(amount)); // Minimum $5, negative for expenses
}

/**
 * Generate mock transactions for a user profile
 */
export function generateMockTransactions(
    userProfile: UserProfile,
    daysBack: number = 60
): Transaction[] {
    const monthlyIncome = incomeRangeToMonthly[userProfile.incomeRange] || 5000;
    const transactions: Transaction[] = [];
    let transactionId = 1;

    // Generate income transactions (salary every 2 weeks, occasional bonuses)
    const salaryAmount = monthlyIncome;
    const payPeriods = Math.floor(daysBack / 14);

    for (let i = 0; i < payPeriods; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 14) - Math.floor(Math.random() * 3));
        transactions.push({
            id: `income-${transactionId++}`,
            amount: salaryAmount,
            category: "Salary",
            date: date.toISOString().split("T")[0],
            description: "Salary",
        });
    }

    // Occasionally add bonus or freelance income
    if (Math.random() > 0.7) {
        transactions.push({
            id: `income-${transactionId++}`,
            amount: Math.floor(monthlyIncome * 0.3),
            category: "Bonus",
            date: randomDateInPast(daysBack),
            description: "Bonus",
        });
    }

    // Generate expense transactions
    const expenseCategories = categories.expenses;
    const transactionsPerCategory = Math.floor(daysBack / 7); // Roughly weekly transactions

    expenseCategories.forEach((category) => {
        const count = Math.floor(transactionsPerCategory * (spendingPatterns[category] || 0.05) * 4);

        for (let i = 0; i < count; i++) {
            transactions.push({
                id: `expense-${transactionId++}`,
                amount: randomAmount(category, monthlyIncome, false),
                category,
                date: randomDateInPast(daysBack),
                description: randomDescription(category),
            });
        }
    });

    // Sort by date (most recent first)
    return transactions.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

/**
 * Get mock transactions from localStorage or generate new ones
 */
export function getMockTransactions(userProfile: UserProfile | null): Transaction[] {
    if (!userProfile) {
        return [];
    }

    // Check if we already have transactions stored
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("transactions");
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                // If parsing fails, generate new ones
            }
        }
    }

    // Generate new transactions
    const transactions = generateMockTransactions(userProfile);

    // Store in localStorage
    if (typeof window !== "undefined") {
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }

    return transactions;
}

/**
 * Clear stored transactions (useful for testing or reset)
 */
export function clearMockTransactions(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem("transactions");
    }
}
