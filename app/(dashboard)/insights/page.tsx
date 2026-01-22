export default function InsightsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Daily Insights
      </h1>
      <div className="space-y-4">
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-muted-foreground">
            Daily and weekly financial insights will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
