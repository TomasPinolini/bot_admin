import { Header } from "@/components/header";
import { getAnalyticsData } from "@/lib/queries";
import { statusLabel } from "@/lib/utils";

const barColors = ["bg-accent", "bg-info", "bg-success", "bg-warning", "bg-error"];
const dotColors = ["bg-info", "bg-accent", "bg-success", "bg-warning", "bg-error"];

export default async function AnalyticsPage() {
  const { projectsByIndustry, completionRates, toolUsage, projectsByStatus } =
    await getAnalyticsData();

  const maxIndustryCount = Math.max(
    ...projectsByIndustry.map((i) => i.count),
    1
  );

  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      <Header
        title="Analytics"
        subtitle="Insights across all projects and companies"
      />

      {/* Top row */}
      <div className="flex gap-5">
        {/* Projects by Industry */}
        <div className="flex flex-col gap-5 bg-bg-card border border-border rounded-lg p-6 flex-1">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Projects by Industry
          </h2>
          {projectsByIndustry.length === 0 ? (
            <p className="text-sm text-text-muted">No data yet</p>
          ) : (
            <div className="flex flex-col gap-4">
              {projectsByIndustry.map((ind, i) => (
                <div key={ind.industry} className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-24 shrink-0">
                    {ind.industry}
                  </span>
                  <div className="flex-1 h-6 bg-bg-main rounded overflow-hidden">
                    <div
                      className={`h-full ${barColors[i % barColors.length]} rounded`}
                      style={{
                        width: `${(ind.count / maxIndustryCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-text-primary w-8 text-right">
                    {ind.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Rates */}
        <div className="flex flex-col gap-5 bg-bg-card border border-border rounded-lg p-6 w-[360px] shrink-0">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Completion Rates
          </h2>
          {completionRates.length === 0 ? (
            <p className="text-sm text-text-muted">No data yet</p>
          ) : (
            <div className="flex flex-col gap-4">
              {completionRates.map((rate, i) => {
                const pct =
                  rate.total > 0
                    ? Math.round((rate.completed / rate.total) * 100)
                    : 0;
                return (
                  <div key={rate.industry} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      {rate.industry}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-bg-main rounded overflow-hidden">
                        <div
                          className={`h-full ${barColors[i % barColors.length]} rounded`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-primary w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex gap-5 flex-1">
        {/* Most Used Tools */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 flex-1">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Most Used Tools
          </h2>
          {toolUsage.length === 0 ? (
            <p className="text-sm text-text-muted">No data yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {toolUsage.map((tool, i) => (
                <div key={tool.name} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`}
                  />
                  <span className="text-sm text-text-primary flex-1">
                    {tool.name}
                  </span>
                  <span className="text-sm text-text-muted">
                    {tool.count} projects
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects by Status */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 flex-1">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Projects by Status
          </h2>
          {projectsByStatus.length === 0 ? (
            <p className="text-sm text-text-muted">No data yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {projectsByStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-text-secondary">
                    {statusLabel(item.status)}
                  </span>
                  <span className="text-sm text-text-primary">{item.count}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 mt-1 flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  Total
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {projectsByStatus.reduce((sum, i) => sum + i.count, 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
