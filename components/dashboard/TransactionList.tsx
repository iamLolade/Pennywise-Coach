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
  currency?: string;
}

export function TransactionList({
  transactions,
  limit = 20,
  currency = "USD",
}: TransactionListProps) {
  const recentTransactions = getRecentTransactions(transactions, 30);
  const displayTransactions = recentTransactions.slice(0, limit);

  if (displayTransactions.length === 0) {
    return (
      <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No transactions found. Add transactions to see your recent activity here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {displayTransactions.map((transaction, index) => {
            const isIncome = transaction.amount > 0;
            const amountColor = isIncome ? "text-success" : "text-foreground";

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-3 px-1 -mx-1 rounded-md hover:bg-muted/50 transition-colors border-b border-border last:border-0 last:pb-0 first:pt-0"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-foreground truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {transaction.category}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>
                <div className={`text-base font-semibold whitespace-nowrap ${amountColor}`}>
                  {isIncome ? "+" : "-"}
                  {formatCurrency(Math.abs(transaction.amount), currency)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
