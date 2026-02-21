import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, FolderKanban } from "lucide-react";
import { getProjectsGrouped } from "@/lib/queries";
import { statusToBadge, statusLabel, formatShortDate } from "@/lib/utils";

const columnConfig = [
  { key: "planning" as const, title: "Planning" },
  { key: "in_progress" as const, title: "In Progress" },
  { key: "review" as const, title: "Review" },
  { key: "completed" as const, title: "Completed" },
];

export default async function ProjectsPage() {
  const grouped = await getProjectsGrouped();
  const totalProjects = Object.values(grouped).flat().length;

  return (
    <div className="flex flex-col gap-6 p-8 h-full">
      <Header
        title="Project Board"
        subtitle="View projects grouped by status"
        actions={
          <Button variant="primary" icon={<Plus size={14} />}>New Project</Button>
        }
      />

      {totalProjects === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-text-muted">
          <FolderKanban size={40} className="opacity-30" />
          <p className="text-sm">No projects yet</p>
        </div>
      ) : (
        <div className="flex gap-4 flex-1 overflow-x-auto pb-2">
          {columnConfig.map((col) => {
            const cards = grouped[col.key];
            return (
              <div key={col.key} className="flex flex-col gap-3 flex-1 min-w-[280px]">
                <div className="flex items-center gap-2 px-1">
                  <h3 className="text-sm font-medium text-text-primary">{col.title}</h3>
                  <span className="text-xs text-text-muted bg-bg-card px-2 py-0.5 rounded">
                    {cards.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {cards.length === 0 ? (
                    <div className="flex items-center justify-center border border-dashed border-border rounded-lg p-6 text-xs text-text-muted">
                      No projects
                    </div>
                  ) : (
                    cards.map((card) => (
                      <Link
                        key={card.id}
                        href={`/projects/${card.id}`}
                        className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-4 hover:border-text-muted transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium text-text-primary">{card.name}</span>
                          <span className="text-xs text-text-muted">{card.companyName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge status={statusToBadge(card.status)}>
                            {statusLabel(card.status)}
                          </Badge>
                          {card.targetDate && (
                            <div className="flex items-center gap-1 text-text-muted">
                              <Calendar size={12} />
                              <span className="text-xs">
                                {formatShortDate(new Date(card.targetDate))}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
