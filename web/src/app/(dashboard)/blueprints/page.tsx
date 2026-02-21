import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import { getBlueprints } from "@/lib/queries";

export default async function BlueprintsPage() {
  const blueprints = await getBlueprints();

  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      <Header
        title="Blueprints"
        subtitle="Reusable chatbot templates and configurations"
        actions={
          <Button variant="primary" icon={<Plus size={14} />}>New Blueprint</Button>
        }
      />

      {blueprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-text-muted">
          <Layers size={40} className="opacity-30" />
          <p className="text-sm">No blueprints created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {blueprints.map((bp) => (
            <div
              key={bp.id}
              className="flex flex-col gap-4 bg-bg-card border border-border rounded-lg p-6 hover:border-text-muted transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-bg-main border border-border flex items-center justify-center">
                <Layers size={18} className="text-text-secondary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-medium text-text-primary">{bp.name}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{bp.description ?? "No description"}</p>
              </div>
              <div className="flex items-center gap-4 pt-1 text-xs text-text-muted">
                <span>{bp.toolCount} tools</span>
                <span>{bp.stepCount} steps</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
