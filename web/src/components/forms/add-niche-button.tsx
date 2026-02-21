"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { TextareaField } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Plus } from "lucide-react";
import { createNiche } from "@/lib/actions";

interface AddNicheButtonProps {
  industries: { value: string; label: string }[];
  preselectedIndustryId?: string;
}

export function AddNicheButton({ industries, preselectedIndustryId }: AddNicheButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createNiche(new FormData(e.currentTarget));
    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="secondary" icon={<Plus size={14} />} onClick={() => setOpen(true)}>
        Add Niche
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Niche">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {preselectedIndustryId ? (
            <input type="hidden" name="industryId" value={preselectedIndustryId} />
          ) : (
            <SelectField label="Industry *" name="industryId" options={industries} required />
          )}
          <InputField label="Name *" name="name" placeholder="e.g. Dental Clinics" required />
          <TextareaField label="Description" name="description" placeholder="Optional description" />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Niche"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
