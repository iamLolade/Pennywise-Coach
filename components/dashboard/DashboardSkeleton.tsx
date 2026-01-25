"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton loading state for dashboard
 * Matches the actual dashboard layout structure
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header skeleton */}
        <div className="mb-8 lg:mb-12">
          <div className="h-9 w-48 bg-muted rounded-md mb-2 animate-pulse" />
          <div className="h-5 w-64 bg-muted rounded-md animate-pulse" />
        </div>

        <div className="space-y-6 lg:space-y-8">
          {/* Summary cards skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-9 w-32 bg-muted rounded mb-2 animate-pulse" />
                  <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis panel skeleton */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-72 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="space-y-2.5">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                  <div className="space-y-2.5">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom grid skeleton */}
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
            {/* Category breakdown skeleton */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transaction list skeleton */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <div className="h-6 w-40 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0 last:pb-0 first:pt-0"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse mb-1.5" />
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-1 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
