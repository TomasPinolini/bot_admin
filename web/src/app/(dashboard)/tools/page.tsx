import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench, ExternalLink } from "lucide-react";
import { getTools } from "@/lib/queries";

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      <Header
        title="Tools"
        subtitle="Manage chatbot development tools and integrations"
        actions={
          <Button variant="primary" icon={<Plus size={14} />}>Add Tool</Button>
        }
      />

      {tools.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-text-muted">
          <Wrench size={40} className="opacity-30" />
          <p className="text-sm">No tools added yet</p>
        </div>
      ) : (
        <div className="flex flex-col border border-border rounded-lg overflow-hidden">
          <div className="flex items-center bg-bg-card px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
            <div className="flex-1 min-w-[200px]">Tool</div>
            <div className="w-40">Category</div>
            <div className="w-28 text-center">Projects</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-20" />
          </div>
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-center px-5 py-3.5 border-b border-border hover:bg-bg-card/50 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <div className="w-8 h-8 rounded-lg bg-bg-card border border-border flex items-center justify-center">
                  <Wrench size={14} className="text-text-secondary" />
                </div>
                <span className="text-sm font-medium text-text-primary">{tool.name}</span>
              </div>
              <div className="w-40 text-sm text-text-secondary">{tool.category ?? "—"}</div>
              <div className="w-28 text-sm text-text-primary text-center">{tool.projectCount}</div>
              <div className="w-24 flex justify-center">
                <Badge status="active" />
              </div>
              <div className="w-20 flex justify-end">
                {tool.url && (
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
