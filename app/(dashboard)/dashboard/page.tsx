export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Dashboard
      </h1>
      <div className="grid gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-lg font-medium text-foreground mb-2">
            Spending Overview
          </h2>
          <p className="text-muted-foreground">
            Transaction list and analysis will be displayed here.
          </p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-lg font-medium text-foreground mb-2">
            Summary Cards
          </h2>
          <p className="text-muted-foreground">
            Financial summaries and quick stats will be shown here.
          </p>
        </div>
      </div>
    </div>
  );
}
