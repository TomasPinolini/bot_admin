import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import { Save } from "lucide-react";

export default function SettingsPage() {
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
          <InputField label="First Name" defaultValue="" placeholder="First name" />
          <InputField label="Last Name" defaultValue="" placeholder="Last name" />
          <InputField label="Email" type="email" defaultValue="" placeholder="Email address" />
          <InputField label="Role" defaultValue="" placeholder="Role" />
        </div>
      </div>

      <div className="flex flex-col gap-6 bg-bg-card border border-border rounded-lg p-6">
        <h2 className="text-base font-medium font-[family-name:var(--font-heading)] text-text-primary">
          Notifications
        </h2>
        <div className="flex flex-col gap-4">
          {["Email notifications", "Project updates", "New company alerts", "Weekly digest"].map((item) => (
            <label key={item} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-text-primary">{item}</span>
              <div className="w-10 h-5 rounded-full bg-success relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 right-0.5" />
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" icon={<Save size={14} />}>Save Changes</Button>
      </div>
    </div>
  );
}
