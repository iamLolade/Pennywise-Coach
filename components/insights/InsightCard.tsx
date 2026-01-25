"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {highlight && (
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {highlight}
          </div>
        )}
        <p className="text-sm text-foreground leading-relaxed">{content}</p>
        {suggestedAction && (
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Suggested action
            </p>
            <p className="text-sm text-foreground mt-2">{suggestedAction}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
