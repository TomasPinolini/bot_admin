import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { List, BarChart3 } from "lucide-react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const tasks = [
  { name: "Discovery & Research", start: 0, duration: 15, color: "bg-success", status: "Completed" },
  { name: "Requirements Gathering", start: 10, duration: 18, color: "bg-success", status: "Completed" },
  { name: "Bot Design & Architecture", start: 25, duration: 22, color: "bg-info", status: "In Progress" },
  { name: "NLP Training & Intents", start: 35, duration: 20, color: "bg-info", status: "In Progress" },
  { name: "Integration Development", start: 50, duration: 25, color: "bg-warning", status: "Pending" },
  { name: "Testing & QA", start: 70, duration: 18, color: "bg-warning", status: "Pending" },
  { name: "UAT & Feedback", start: 85, duration: 12, color: "bg-text-muted", status: "Not Started" },
  { name: "Deployment & Launch", start: 95, duration: 10, color: "bg-text-muted", status: "Not Started" },
  { name: "Post-Launch Monitoring", start: 105, duration: 15, color: "bg-text-muted", status: "Not Started" },
];

export default function TimelinePage() {
  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-secondary">Projects</span>
        <span className="text-text-muted">/</span>
        <span className="text-text-secondary">Acme Corp</span>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary">Timeline</span>
      </div>

      <Header
        title="Project Timeline"
        subtitle=""
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<List size={14} />}>List</Button>
            <Button variant="secondary" icon={<BarChart3 size={14} />}>Timeline</Button>
          </div>
        }
      />

      {/* Gantt Container */}
      <div className="flex bg-bg-card border border-border rounded-xl overflow-hidden flex-1">
        {/* Task list */}
        <div className="flex flex-col w-[280px] border-r border-border shrink-0">
          <div className="px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
            Tasks
          </div>
          {tasks.map((task) => (
            <div key={task.name} className="flex items-center gap-3 px-5 py-3 border-b border-border">
              <div className={`w-2 h-2 rounded-full ${task.color}`} />
              <span className="text-sm text-text-primary truncate">{task.name}</span>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex flex-col flex-1 overflow-x-auto">
          {/* Month headers */}
          <div className="flex border-b border-border">
            {months.map((month) => (
              <div key={month} className="flex-1 min-w-[120px] px-4 py-3 text-xs text-text-muted border-r border-border last:border-r-0">
                {month}
              </div>
            ))}
          </div>

          {/* Bars */}
          {tasks.map((task) => (
            <div key={task.name} className="flex items-center h-[43px] border-b border-border relative">
              {/* Grid lines */}
              {months.map((_, i) => (
                <div key={i} className="flex-1 min-w-[120px] border-r border-border last:border-r-0 h-full" />
              ))}
              {/* Bar */}
              <div
                className={`absolute top-2.5 h-5 ${task.color} rounded text-[10px] text-white flex items-center px-2 whitespace-nowrap opacity-80`}
                style={{
                  left: `${(task.start / 130) * 100}%`,
                  width: `${(task.duration / 130) * 100}%`,
                }}
              >
                {task.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
