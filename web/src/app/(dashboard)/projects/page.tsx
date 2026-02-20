import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar } from "lucide-react";

interface KanbanCard {
  title: string;
  company: string;
  status: "active" | "pending" | "completed" | "blocked";
  assignees: number;
  dueDate: string;
}

const columns: { title: string; count: number; cards: KanbanCard[] }[] = [
  {
    title: "Planning",
    count: 3,
    cards: [
      { title: "RetailBot Pro", company: "FreshMart", status: "pending", assignees: 2, dueDate: "Mar 15" },
      { title: "HealthBot Pro", company: "MediHealth", status: "pending", assignees: 1, dueDate: "Apr 1" },
      { title: "BizChat Assistant", company: "NextGen", status: "blocked", assignees: 3, dueDate: "Mar 22" },
    ],
  },
  {
    title: "In Progress",
    count: 3,
    cards: [
      { title: "Acme Support Bot", company: "Acme Corp", status: "active", assignees: 3, dueDate: "Feb 28" },
      { title: "NovaCare CRM Bot", company: "NovaCare", status: "active", assignees: 2, dueDate: "Mar 10" },
      { title: "TechFlow Sales Bot", company: "TechFlow", status: "active", assignees: 2, dueDate: "Mar 5" },
    ],
  },
  {
    title: "Review",
    count: 2,
    cards: [
      { title: "GlobalBank Advisor", company: "GlobalBank", status: "pending", assignees: 4, dueDate: "Feb 20" },
      { title: "AutoParts Helpdesk", company: "AutoParts", status: "pending", assignees: 2, dueDate: "Feb 25" },
    ],
  },
  {
    title: "Completed",
    count: 3,
    cards: [
      { title: "FinanceApp Bot", company: "FinanceApp", status: "completed", assignees: 3, dueDate: "Feb 10" },
      { title: "TravelEase Concierge", company: "TravelEase", status: "completed", assignees: 2, dueDate: "Feb 5" },
      { title: "PropertyBot", company: "RealEstate", status: "completed", assignees: 1, dueDate: "Jan 30" },
    ],
  },
];

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 h-full">
      <Header
        title="Project Board"
        subtitle="Drag and drop projects between stages"
        actions={
          <Button variant="primary" icon={<Plus size={14} />}>New Project</Button>
        }
      />

      {/* Kanban */}
      <div className="flex gap-4 flex-1 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3 flex-1 min-w-[280px]">
            {/* Column header */}
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-sm font-medium text-text-primary">{col.title}</h3>
              <span className="text-xs text-text-muted bg-bg-card px-2 py-0.5 rounded">{col.count}</span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
              {col.cards.map((card) => (
                <div
                  key={card.title}
                  className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-4 hover:border-text-muted transition-colors cursor-pointer"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-text-primary">{card.title}</span>
                    <span className="text-xs text-text-muted">{card.company}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge status={card.status} />
                    <div className="flex items-center gap-3 text-text-muted">
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span className="text-xs">{card.assignees}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span className="text-xs">{card.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
