"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { TextareaField } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Pencil } from "lucide-react";
import { updateProject } from "@/lib/actions";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  targetDate: string | null;
}

const statusOptions = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
];

export function EditProjectButton({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await updateProject(new FormData(e.currentTarget));
    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="secondary" icon={<Pencil size={14} />} onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Project">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={project.id} />
          <InputField label="Project Name *" name="name" defaultValue={project.name} required />
          <TextareaField label="Description" name="description" defaultValue={project.description ?? ""} />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Status"
              name="status"
              options={statusOptions}
              defaultValue={project.status}
            />
            <InputField
              label="Target Date"
              name="targetDate"
              type="date"
              defaultValue={project.targetDate ?? ""}
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
