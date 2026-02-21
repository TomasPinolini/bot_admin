import { Header } from "@/components/header";
import { getTimelineProjects } from "@/lib/queries";
import { statusLabel } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

const statusColorMap: Record<string, string> = {
  planning: "bg-warning",
  in_progress: "bg-info",
  review: "bg-accent",
  completed: "bg-success",
};

export default async function TimelinePage() {
  const projects = await getTimelineProjects();

  // Filter to projects with both dates
  const projectsWithDates = projects.filter(
    (p) => p.startDate && p.targetDate
  );

  if (projectsWithDates.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-8 px-10 h-full">
        <Header title="Timeline" subtitle="Cross-project timeline view" />
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-text-muted">
          <CalendarDays size={40} className="opacity-30" />
          <p className="text-sm">No projects with scheduled dates</p>
        </div>
      </div>
    );
  }

  // Calculate date range
  const allDates = projectsWithDates.flatMap((p) => [
    new Date(p.startDate!),
    new Date(p.targetDate!),
  ]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  // Expand to full months
  minDate.setDate(1);
  maxDate.setMonth(maxDate.getMonth() + 1, 0);

  const totalDays = Math.max(
    (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24),
    1
  );

  // Generate month labels
  const months: string[] = [];
  const d = new Date(minDate);
  while (d <= maxDate) {
    months.push(
      d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    );
    d.setMonth(d.getMonth() + 1);
  }

  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      <Header title="Timeline" subtitle="Cross-project timeline view" />

      <div className="flex bg-bg-card border border-border rounded-xl overflow-hidden flex-1">
        {/* Project list */}
        <div className="flex flex-col w-[280px] border-r border-border shrink-0">
          <div className="px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
            Projects
          </div>
          {projectsWithDates.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-3 px-5 py-3 border-b border-border"
            >
              <div
                className={`w-2 h-2 rounded-full ${statusColorMap[project.status] || "bg-text-muted"}`}
              />
              <span className="text-sm text-text-primary truncate">
                {project.name}
              </span>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex flex-col flex-1 overflow-x-auto">
          {/* Month headers */}
          <div className="flex border-b border-border">
            {months.map((month) => (
              <div
                key={month}
                className="flex-1 min-w-[120px] px-4 py-3 text-xs text-text-muted border-r border-border last:border-r-0"
              >
                {month}
              </div>
            ))}
          </div>

          {/* Bars */}
          {projectsWithDates.map((project) => {
            const start = new Date(project.startDate!);
            const end = new Date(project.targetDate!);
            const startOffset =
              (start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
            const duration = Math.max(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
              1
            );

            return (
              <div
                key={project.id}
                className="flex items-center h-[43px] border-b border-border relative"
              >
                {months.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-[120px] border-r border-border last:border-r-0 h-full"
                  />
                ))}
                <div
                  className={`absolute top-2.5 h-5 ${statusColorMap[project.status] || "bg-text-muted"} rounded text-[10px] text-white flex items-center px-2 whitespace-nowrap opacity-80`}
                  style={{
                    left: `${(startOffset / totalDays) * 100}%`,
                    width: `${(duration / totalDays) * 100}%`,
                  }}
                >
                  {statusLabel(project.status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
