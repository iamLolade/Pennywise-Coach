"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton loading state for coach chat interface
 * Matches the actual coach chat layout structure
 */
export function CoachSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Card className="border-border bg-card shadow-sm flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader className="flex-shrink-0 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Message skeletons */}
          <div className="space-y-4">
            {/* Assistant message skeleton */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-muted rounded-lg px-4 py-2">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-background/50 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-background/50 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-background/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
            {/* User message skeleton */}
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-primary/20 rounded-lg px-4 py-2">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-primary/30 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-primary/30 rounded animate-pulse" />
                </div>
              </div>
            </div>
            {/* Assistant message skeleton */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-muted rounded-lg px-4 py-2">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-background/50 rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-background/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="flex-shrink-0 border-t border-border p-4">
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </Card>
    </div>
  );
}
