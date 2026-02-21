import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Plus, Download, ChevronRight } from "lucide-react";
import { getDashboardData } from "@/lib/queries";
import { timeAgo, statusLabel } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { counts, statusDistribution, recentLogs, recentCompanies, recentProjects } = data;

  const metrics = [
    { label: "Total Companies", value: String(counts.companies), delta: "total" },
    { label: "Active Projects", value: String(counts.projects), delta: "total" },
    { label: "Tools Deployed", value: String(counts.tools), delta: "total" },
    { label: "Blueprints", value: String(counts.blueprints), delta: "total" },
  ];

  const statusColors: Record<string, string> = {
    planning: "bg-accent",
    in_progress: "bg-info",
    review: "bg-success",
    completed: "bg-warning",
  };

  const maxCount = Math.max(...statusDistribution.map((s) => s.count), 1);

  // Merge recent activity from logs, companies, and projects
  const activity = [
    ...recentLogs.map((l) => ({
      text: `${l.projectName}: ${l.phase}${l.note ? ` — ${l.note}` : ""}`,
      time: l.loggedAt,
      color: "bg-info",
    })),
    ...recentCompanies.map((c) => ({
      text: `New company: ${c.name}`,
      time: c.createdAt,
      color: "bg-success",
    })),
    ...recentProjects.map((p) => ({
      text: `New project: ${p.name}`,
      time: p.createdAt,
      color: "bg-accent",
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8 p-8 px-10">
      <Header
        title="Dashboard"
        subtitle="Overview of your chatbot implementations"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={14} />}>Export</Button>
            <Button variant="primary" icon={<Plus size={14} />}>New Project</Button>
          </>
        }
      />

      {/* Metrics */}
      <div className="flex gap-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex gap-5 flex-1">
        {/* Chart Panel */}
        <div className="flex flex-col gap-5 bg-bg-card border border-border rounded-lg p-6 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
              Project Status
            </h2>
          </div>
          {statusDistribution.length > 0 ? (
            <div className="flex items-end gap-6 flex-1 pt-4">
              {(["planning", "in_progress", "review", "completed"] as const).map((status) => {
                const item = statusDistribution.find((s) => s.status === status);
                const value = item ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={status} className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-full flex items-end justify-center" style={{ height: 200 }}>
                      <div
                        className={`w-full max-w-16 ${statusColors[status] || "bg-accent"} rounded-t`}
                        style={{ height: `${Math.max(value, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted">{statusLabel(status)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 text-sm text-text-muted">
              No projects yet
            </div>
          )}
        </div>

        {/* Activity Panel */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 w-[380px] shrink-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
              Recent Activity
            </h2>
          </div>
          {activity.length > 0 ? (
            <div className="flex flex-col gap-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color}`} />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm text-text-primary truncate">{a.text}</span>
                    <span className="text-xs text-text-muted">{timeAgo(a.time)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 text-sm text-text-muted">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
