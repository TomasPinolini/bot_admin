"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { Save } from "lucide-react";

const notificationItems = ["Email notifications", "Project updates", "New company alerts", "Weekly digest"];

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationItems.map((item) => [item, true]))
  );
  const [saved, setSaved] = useState(false);

  function handleToggle(item: string) {
    setToggles((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 p-8 px-10 max-w-3xl">
      <Header
        title="Settings"
        subtitle="Manage your account and application preferences"
      />

      <div className="flex flex-col gap-6 bg-bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
          Profile
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <InputField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
          <InputField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
          <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
          <InputField label="Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
        </div>
      </div>

      <div className="flex flex-col gap-6 bg-bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
          Notifications
        </h2>
        <div className="flex flex-col gap-4">
          {notificationItems.map((item) => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-sm text-text-primary">{item}</span>
              <button
                type="button"
                onClick={() => handleToggle(item)}
                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                  toggles[item] ? "bg-success" : "bg-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                    toggles[item] ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        {saved && <span className="text-sm text-success">Saved!</span>}
        <Button variant="primary" icon={<Save size={14} />} onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
