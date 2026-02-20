import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ArrowRight, CheckCircle2, Circle, Clock } from "lucide-react";

const steps = [
  { label: "Discovery", done: true },
  { label: "Design", done: true },
  { label: "Build", done: true },
  { label: "Test", done: false },
  { label: "Deploy", done: false },
  { label: "Handoff", done: false },
];

const timeline = [
  { title: "Discovery completed", desc: "Requirements gathered, stakeholder interviews done", date: "Jan 20, 2026", status: "done" },
  { title: "Design approved", desc: "Conversation flows and UI mockups signed off", date: "Feb 1, 2026", status: "done" },
  { title: "Build phase started", desc: "Development in progress. Frontend + Dialogflow integration", date: "Feb 10, 2026", status: "active" },
  { title: "Testing phase", desc: "Scheduled for UAT and integration testing", date: "Upcoming", status: "pending" },
];

const tools = ["DialogFlow CX", "Twilio", "Pinecone", "Rasa"];

export default function ProjectDetailPage() {
  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-secondary">Projects</span>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary">Acme Corp Chatbot</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold font-[family-name:var(--font-heading)] text-text-primary">
              Acme Corp Chatbot
            </h1>
            <Badge status="active">In Progress</Badge>
          </div>
          <p className="text-sm text-text-secondary">Acme Corp &middot; E-commerce &middot; Started Jan 15, 2026</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" icon={<Pencil size={14} />}>Edit</Button>
          <Button variant="primary" icon={<ArrowRight size={14} />}>Next Phase</Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center bg-bg-card border border-border rounded-lg px-6 py-5 gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step.done
                  ? "bg-success text-white"
                  : i === steps.findIndex((s) => !s.done)
                    ? "bg-accent text-white"
                    : "bg-border text-text-muted"
              }`}>
                {step.done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-sm ${step.done ? "text-text-primary" : "text-text-muted"}`}>
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
                <span className="text-xs text-text-muted">Bot Type</span>
                <span className="text-sm text-text-primary">E-commerce Support Bot</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-muted">Niche</span>
                <span className="text-sm text-text-primary">E-commerce / Retail</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-muted">Overall Status</span>
                <div className="flex items-center gap-2">
                  <Badge status="active" />
                  <span className="text-sm text-text-primary">65%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-muted">Assigned Client</span>
                <span className="text-sm text-text-primary">Sarah Chen</span>
              </div>
            </div>
          </div>

          {/* Tools */}
          <div className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
              Assigned Tools
            </h2>
            <div className="flex gap-2 flex-wrap">
              {tools.map((tool) => (
                <span key={tool} className="px-3 py-1.5 text-xs bg-bg-main border border-border rounded text-text-secondary">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right timeline */}
        <div className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 w-[360px] shrink-0">
          <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
            Progress Timeline
          </h2>
          <div className="flex flex-col gap-5">
            {timeline.map((entry) => (
              <div key={entry.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {entry.status === "done" ? (
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                  ) : entry.status === "active" ? (
                    <Clock size={16} className="text-accent shrink-0" />
                  ) : (
                    <Circle size={16} className="text-text-muted shrink-0" />
                  )}
                  <div className="w-px flex-1 bg-border mt-1" />
                </div>
                <div className="flex flex-col gap-1 pb-4">
                  <span className="text-sm font-medium text-text-primary">{entry.title}</span>
                  <span className="text-xs text-text-muted leading-relaxed">{entry.desc}</span>
                  <span className="text-xs text-text-muted mt-1">{entry.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
