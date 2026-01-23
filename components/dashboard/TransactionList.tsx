"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  formatDate,
  getRecentTransactions,
} from "@/lib/utils/transactions";
import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionList({
  transactions,
  limit = 20,
}: TransactionListProps) {
  const recentTransactions = getRecentTransactions(transactions, 30);
  const displayTransactions = recentTransactions.slice(0, limit);

  if (displayTransactions.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No transactions found. Complete onboarding to generate sample data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayTransactions.map((transaction, index) => {
            const isIncome = transaction.amount > 0;
            const amountColor = isIncome ? "text-success" : "text-foreground";

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {transaction.category}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>
                <div className={`ml-4 text-sm font-semibold ${amountColor}`}>
                  {isIncome ? "+" : "-"}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
