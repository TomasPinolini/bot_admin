import { Header } from "@/components/header";
import { Building2 } from "lucide-react";
import { getCompanies } from "@/lib/queries";
import { AddCompanyButton } from "@/components/forms/add-company-button";
import { ExportButton } from "@/components/export-button";
import { CompanyTable } from "@/components/company-table";
import { formatDate } from "@/lib/utils";

export default async function CompaniesPage() {
  const companies = await getCompanies();

  const exportData = companies.map((c) => ({
    name: c.name,
    industry: c.industry ?? "",
    projects: c.projectCount,
    status: c.status,
    created: formatDate(c.createdAt),
  }));

  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      <Header
        title="Companies"
        subtitle="Manage your client companies and their projects"
        actions={
          <>
            <ExportButton data={exportData} filename="companies" />
            <AddCompanyButton />
          </>
        }
      />

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-text-muted">
          <Building2 size={40} className="opacity-30" />
          <p className="text-sm">No companies added yet</p>
        </div>
      ) : (
        <CompanyTable companies={companies} />
      )}
    </div>
  );
}
