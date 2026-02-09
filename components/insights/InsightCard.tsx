"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeModelField, isLikelyJsonFragment } from "@/lib/utils/text";

interface InsightCardProps {
  title: string;
  content: string;
  suggestedAction?: string;
  highlight?: string;
}

export function InsightCard({
  title,
  content,
  suggestedAction,
  highlight,
}: InsightCardProps) {
  const safeTitle = (() => {
    const t = sanitizeModelField(title) || "Financial insight";
    return isLikelyJsonFragment(t) ? "Financial insight" : t;
  })();

  const safeContent = (() => {
    const c = sanitizeModelField(content);
    return !c || isLikelyJsonFragment(c) ? "Here’s a quick insight based on your recent activity." : c;
  })();

  const safeAction = suggestedAction ? sanitizeModelField(suggestedAction) : "";

  return (
    <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{safeTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {highlight && (
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {highlight}
          </div>
        )}
        <p className="text-sm text-foreground leading-relaxed">{safeContent}</p>
        {safeAction && !isLikelyJsonFragment(safeAction) && (
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Suggested action
            </p>
            <p className="text-sm text-foreground mt-2">{safeAction}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
