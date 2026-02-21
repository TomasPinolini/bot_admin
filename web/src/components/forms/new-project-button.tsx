"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { TextareaField } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Plus } from "lucide-react";
import { createProject } from "@/lib/actions";

interface NewProjectButtonProps {
  companies: { value: string; label: string }[];
  preselectedCompanyId?: string;
}

export function NewProjectButton({ companies, preselectedCompanyId }: NewProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createProject(new FormData(e.currentTarget));
    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="primary" icon={<Plus size={14} />} onClick={() => setOpen(true)}>
        New Project
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="New Project">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {preselectedCompanyId ? (
            <input type="hidden" name="companyId" value={preselectedCompanyId} />
          ) : (
            <SelectField label="Company *" name="companyId" options={companies} required />
          )}
          <InputField label="Project Name *" name="name" placeholder="Chatbot v2" required />
          <TextareaField label="Description" name="description" placeholder="Brief project description..." />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
