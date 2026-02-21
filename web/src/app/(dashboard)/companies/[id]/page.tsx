import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getCompany, getIndustries, getProducts, getServices } from "@/lib/queries";
import { formatDate, timeAgo, statusToBadge, statusLabel } from "@/lib/utils";
import { EditCompanyButton } from "@/components/forms/edit-company-button";
import { NewProjectButton } from "@/components/forms/new-project-button";
import { ManageCompanyCatalogButton } from "@/components/forms/manage-company-catalog-button";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [company, allIndustries, allProducts, allServices] = await Promise.all([
    getCompany(id),
    getIndustries(),
    getProducts(),
    getServices(),
  ]);
  if (!company) notFound();

  const companyForEdit = {
    id: company.id,
    name: company.name,
    contactName: company.contactName,
    contactEmail: company.contactEmail,
    contactPhone: company.contactPhone,
    website: company.website,
  };

  const assignedIndustryIds = company.industries.map((i) => i.id);
  const assignedProductIds = company.products.map((p) => p.id);
  const assignedServiceIds = company.services.map((sv) => sv.id);

  return (
    <div className="flex flex-col gap-6 p-8 px-10 h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/companies" className="text-text-secondary hover:text-text-primary transition-colors">
          Companies
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary">{company.name}</span>
      </div>

      {/* Company header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-bg-card border border-border flex items-center justify-center text-lg font-medium text-text-secondary">
            {company.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold font-[family-name:var(--font-heading)] text-text-primary">
                {company.name}
              </h1>
              <Badge status={company.status === "active" ? "active" : "pending"} />
            </div>
            <p className="text-sm text-text-secondary">
              {company.industries.length > 0 ? company.industries.map((i) => i.name).join(", ") : "No industry"} &middot; Created {formatDate(company.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <EditCompanyButton company={companyForEdit} />
          <NewProjectButton
            companies={[{ value: company.id, label: company.name }]}
            preselectedCompanyId={company.id}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-5 flex-1">
        {/* Project table */}
        {company.projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 border border-border rounded-lg text-text-muted gap-2 p-8">
            <p className="text-sm">No projects yet</p>
          </div>
        ) : (
          <div className="flex flex-col border border-border rounded-lg overflow-hidden flex-1">
            <div className="flex items-center bg-bg-card px-5 py-3 border-b border-border text-xs font-medium text-text-secondary">
              <div className="flex-1">Project Name</div>
              <div className="w-28 text-center">Status</div>
              <div className="w-28">Updated</div>
            </div>
            {company.projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center px-5 py-3.5 border-b border-border hover:bg-bg-card/50 transition-colors cursor-pointer"
              >
                <div className="flex-1 text-sm font-medium text-text-primary">{p.name}</div>
                <div className="w-28 flex justify-center">
                  <Badge status={statusToBadge(p.status)}>{statusLabel(p.status)}</Badge>
                </div>
                <div className="w-28 text-sm text-text-muted">{timeAgo(p.updatedAt)}</div>
              </Link>
            ))}
          </div>
        )}

        {/* Side info */}
        <div className="flex flex-col gap-5 w-[280px] shrink-0">
          {/* Company Info card */}
          <div className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-text-primary">Company Info</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Industry</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary">
                    {company.industries.length > 0 ? company.industries.map((i) => i.name).join(", ") : "\u2014"}
                  </span>
                  <ManageCompanyCatalogButton
                    companyId={company.id}
                    type="industry"
                    allItems={allIndustries}
                    assignedIds={assignedIndustryIds}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Contact</span>
                <span className="text-text-primary">{company.contactEmail ?? "\u2014"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Projects</span>
                <span className="text-text-primary">{company.projects.length}</span>
              </div>
            </div>
          </div>

          {/* Products card */}
          <div className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-primary">Products</h3>
              <ManageCompanyCatalogButton
                companyId={company.id}
                type="product"
                allItems={allProducts}
                assignedIds={assignedProductIds}
              />
            </div>
            {company.products.length === 0 ? (
              <p className="text-xs text-text-muted">None added yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {company.products.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Services card */}
          <div className="flex flex-col gap-3 bg-bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-primary">Services</h3>
              <ManageCompanyCatalogButton
                companyId={company.id}
                type="service"
                allItems={allServices}
                assignedIds={assignedServiceIds}
              />
            </div>
            {company.services.length === 0 ? (
              <p className="text-xs text-text-muted">None added yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {company.services.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
