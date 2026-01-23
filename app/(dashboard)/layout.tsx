import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-xl font-semibold text-primary"
            >
              Pennywise Coach
            </Link>
            <div className="flex gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Dashboard
              </Link>
              <Link
                href="/coach"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Coach
              </Link>
              <Link
                href="/insights"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Insights
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
