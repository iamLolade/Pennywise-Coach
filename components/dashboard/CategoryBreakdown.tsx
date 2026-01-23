"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateByCategory,
  getTopCategories,
  formatCurrency,
} from "@/lib/utils/transactions";
import type { Transaction } from "@/types";

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

export function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const byCategory = calculateByCategory(transactions);
  const topCategories = getTopCategories(byCategory, 5);
  const totalExpenses = topCategories.reduce((sum, cat) => sum + cat.amount, 0);

  if (topCategories.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No spending data available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Spending Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCategories.map((item, index) => {
            const percentage = (item.amount / totalExpenses) * 100;
            return (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {item.category}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
