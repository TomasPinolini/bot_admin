import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, CheckCircle2, Circle, Clock } from "lucide-react";
import { getProject } from "@/lib/queries";
import { statusToBadge, statusLabel, formatDate, timeAgo } from "@/lib/utils";

const statusOrder = ["planning", "in_progress", "review", "completed"];

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const currentIndex = statusOrder.indexOf(project.status);
  const steps = statusOrder.map((status, i) => ({
    label: statusLabel(status),
    done: i < currentIndex,
    current: i === currentIndex,
  }));

  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/projects" className="text-text-secondary hover:text-text-primary transition-colors">
          Projects
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold font-[family-name:var(--font-heading)] text-text-primary">
              {project.name}
            </h1>
            <Badge status={statusToBadge(project.status)}>
              {statusLabel(project.status)}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary">
            {project.companyName}
            {project.startDate && <> &middot; Started {formatDate(new Date(project.startDate))}</>}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" icon={<Pencil size={14} />}>Edit</Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center bg-bg-card border border-border rounded-lg px-6 py-5 gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step.done
                    ? "bg-success text-white"
                    : step.current
                      ? "bg-accent text-white"
                      : "bg-border text-text-muted"
                }`}
              >
                {step.done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-sm ${step.done || step.current ? "text-text-primary" : "text-text-muted"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${step.done ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Bottom area */}
      <div className="flex gap-5 flex-1">
        {/* Left column */}
        <div className="flex flex-col gap-5 flex-1">
          {/* Project Details */}
          <div className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
              Project Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-muted">Company</span>
                <span className="text-sm text-text-primary">{project.companyName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-muted">Status</span>
                <Badge status={statusToBadge(project.status)}>
                  {statusLabel(project.status)}
                </Badge>
              </div>
              {project.description && (
                <div className="flex flex-col gap-1 col-span-2">
                  <span className="text-xs text-text-muted">Description</span>
                  <span className="text-sm text-text-primary">{project.description}</span>
                </div>
              )}
              {project.targetDate && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-muted">Target Date</span>
                  <span className="text-sm text-text-primary">
                    {formatDate(new Date(project.targetDate))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tools */}
          <div className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
              Assigned Tools
            </h2>
            {project.tools.length === 0 ? (
              <p className="text-xs text-text-muted">No tools assigned</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {project.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1.5 text-xs bg-bg-main border border-border rounded text-text-secondary"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right timeline */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 w-[360px] shrink-0">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Progress Timeline
          </h2>
          {project.logs.length === 0 ? (
            <p className="text-xs text-text-muted">No progress logged yet</p>
          ) : (
            <div className="flex flex-col gap-5">
              {project.logs.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {entry.status === "completed" ? (
                      <CheckCircle2 size={16} className="text-success shrink-0" />
                    ) : entry.status === "in_progress" ? (
                      <Clock size={16} className="text-accent shrink-0" />
                    ) : (
                      <Circle size={16} className="text-text-muted shrink-0" />
                    )}
                    <div className="w-px flex-1 bg-border mt-1" />
                  </div>
                  <div className="flex flex-col gap-1 pb-4">
                    <span className="text-sm font-medium text-text-primary">{entry.phase}</span>
                    {entry.note && (
                      <span className="text-xs text-text-muted leading-relaxed">{entry.note}</span>
                    )}
                    <span className="text-xs text-text-muted mt-1">{formatDate(entry.loggedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
