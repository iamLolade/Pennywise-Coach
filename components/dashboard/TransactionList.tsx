"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  limit = 20,
  currency = "USD",
  onEdit,
  onDelete,
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
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 py-3 px-1 -mx-1 rounded-md hover:bg-muted/50 transition-colors border-b border-border last:border-0 last:pb-0 first:pt-0"
              >
                <div className="flex-1 min-w-0">
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
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                  <div className={`text-sm sm:text-base font-semibold whitespace-nowrap ${amountColor}`}>
                    {isIncome ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount), currency)}
                  </div>
                  {(onEdit || onDelete) && (
                    <div className="flex items-center gap-1.5 sm:gap-2 opacity-100">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          onClick={() => onEdit(transaction)}
                          className="h-7 sm:h-8 px-1.5 sm:px-2 text-foreground bg-muted/60 hover:bg-muted border border-border"
                          aria-label="Edit transaction"
                        >
                          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" strokeWidth={2} />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          onClick={() => onDelete(transaction)}
                          className="h-7 sm:h-8 px-1.5 sm:px-2 text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/30"
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" strokeWidth={2} />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
