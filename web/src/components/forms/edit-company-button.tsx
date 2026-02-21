"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pencil } from "lucide-react";
import { updateCompany } from "@/lib/actions";

interface Company {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
}

export function EditCompanyButton({ company }: { company: Company }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await updateCompany(new FormData(e.currentTarget));
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
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Company">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={company.id} />
          <InputField label="Company Name *" name="name" defaultValue={company.name} required />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Contact Name" name="contactName" defaultValue={company.contactName ?? ""} />
            <InputField label="Contact Email" name="contactEmail" type="email" defaultValue={company.contactEmail ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Contact Phone" name="contactPhone" defaultValue={company.contactPhone ?? ""} />
            <InputField label="Website" name="website" defaultValue={company.website ?? ""} />
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
