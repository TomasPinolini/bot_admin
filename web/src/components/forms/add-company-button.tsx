"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Plus } from "lucide-react";
import { createCompany } from "@/lib/actions";

export function AddCompanyButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await createCompany(new FormData(e.currentTarget));
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
        Add Company
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Company">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField label="Company Name *" name="name" placeholder="Acme Corp" required />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Contact Name" name="contactName" placeholder="Jane Doe" />
            <InputField label="Contact Email" name="contactEmail" type="email" placeholder="jane@acme.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Contact Phone" name="contactPhone" placeholder="+1 555 0123" />
            <InputField label="Website" name="website" placeholder="https://acme.com" />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Company"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
