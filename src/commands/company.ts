import { Command } from "commander";
import * as service from "../services/company.service.js";
import * as industryService from "../services/industry.service.js";
import * as nicheService from "../services/niche.service.js";
import * as productService from "../services/product.service.js";
import * as svcService from "../services/service.service.js";
import { createCompanySchema } from "../types/company.types.js";
import { textInput, selectInput, isCancelError } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import { heading, success, label, createTable, noResults, error } from "../utils/format.js";
import { formatDate } from "../utils/date.js";

export function registerCompanyCommands(program: Command) {
  const cmd = program.command("company").description("Manage client companies");

  // ── add ────────────────────────────────────────────────
  cmd
    .command("add")
    .description("Add a new company")
    .option("--name <name>", "Company name")
    .option("--contact-name <name>", "Contact name")
    .option("--contact-email <email>", "Contact email")
    .option("--contact-phone <phone>", "Contact phone")
    .option("--website <url>", "Website URL")
    .option("--notes <notes>", "Notes")
    .action(async (opts) => {
      try {
        const interactive = !opts.name;

        const name = opts.name || (await textInput({ message: "Company name", required: true }));
        const contactName = interactive
          ? (await textInput({ message: "Contact name (optional)" }))
          : opts.contactName;
        const contactEmail = interactive
          ? (await textInput({ message: "Contact email (optional)" }))
          : opts.contactEmail;

        const input = createCompanySchema.parse({
          name,
          contactName: contactName || undefined,
          contactEmail: contactEmail || undefined,
          contactPhone: opts.contactPhone,
          website: opts.website,
          notes: opts.notes,
        });

        const company = await withSpinner("Creating company", () =>
          service.createCompany(input)
        );

        heading("Company Created");
        label("ID", company.id);
        label("Name", company.name);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List companies")
    .option("--status <status>", "Filter by status (active, inactive, archived)")
    .option("--search <term>", "Search by name")
    .action(async (opts) => {
      const companies = await withSpinner("Loading companies", () =>
        service.listCompanies({
          status: opts.status,
          search: opts.search,
        })
      );

      if (companies.length === 0) return noResults("companies");

      heading("Companies");
      const table = createTable(["ID", "Name", "Status", "Created"]);
      for (const c of companies) {
        table.push([
          c.id,
          c.name,
          c.status,
          formatDate(c.createdAt),
        ]);
      }
      console.log(table.toString());
    });

  // ── show ───────────────────────────────────────────────
  cmd
    .command("show <id>")
    .description("Show company details")
    .action(async (id: string) => {
      const company = await withSpinner("Loading company", () =>
        service.getCompany(id)
      );

      if (!company) return error(`Company not found: ${id}`);

      heading(company.name);
      label("ID", company.id);
      label("Status", company.status);
      label("Contact", company.contactName);
      label("Email", company.contactEmail);
      label("Phone", company.contactPhone);
      label("Website", company.website);
      label("Notes", company.notes);
      label("Created", formatDate(company.createdAt));
      label("Updated", formatDate(company.updatedAt));

      if (company.industries.length > 0) {
        heading("Industries");
        const table = createTable(["ID", "Name"]);
        for (const i of company.industries) {
          table.push([i.industryId, i.industryName]);
        }
        console.log(table.toString());
      }

      if (company.niches.length > 0) {
        heading("Niches");
        const table = createTable(["ID", "Name", "Industry"]);
        for (const n of company.niches) {
          table.push([n.nicheId, n.nicheName, n.industryName]);
        }
        console.log(table.toString());
      }

      if (company.products.length > 0) {
        heading("Products");
        const table = createTable(["ID", "Name", "Notes"]);
        for (const p of company.products) {
          table.push([p.productId, p.productName, p.notes ?? "—"]);
        }
        console.log(table.toString());
      }

      if (company.services.length > 0) {
        heading("Services");
        const table = createTable(["ID", "Name", "Notes"]);
        for (const s of company.services) {
          table.push([s.serviceId, s.serviceName, s.notes ?? "—"]);
        }
        console.log(table.toString());
      }
    });

  // ── edit ───────────────────────────────────────────────
  cmd
    .command("edit <id>")
    .description("Edit a company")
    .option("--name <name>", "Company name")
    .option("--contact-name <name>", "Contact name")
    .option("--contact-email <email>", "Contact email")
    .option("--contact-phone <phone>", "Contact phone")
    .option("--website <url>", "Website URL")
    .option("--notes <notes>", "Notes")
    .option("--status <status>", "Status (active, inactive, archived)")
    .action(async (id: string, opts) => {
      try {
        const existing = await service.getCompany(id);
        if (!existing) return error(`Company not found: ${id}`);

        const hasFlags = Object.values(opts).some((v) => v !== undefined);

        let updates: Record<string, unknown>;
        if (hasFlags) {
          updates = {};
          if (opts.name) updates.name = opts.name;
          if (opts.contactName) updates.contactName = opts.contactName;
          if (opts.contactEmail) updates.contactEmail = opts.contactEmail;
          if (opts.contactPhone) updates.contactPhone = opts.contactPhone;
          if (opts.website) updates.website = opts.website;
          if (opts.notes) updates.notes = opts.notes;
          if (opts.status) updates.status = opts.status;
        } else {
          const name = await textInput({
            message: "Company name",
            initialValue: existing.name,
            required: true,
          });
          const status = await selectInput({
            message: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "archived", label: "Archived" },
            ],
          });

          updates = { name, status };
        }

        const company = await withSpinner("Updating company", () =>
          service.updateCompany(existing.id, updates)
        );

        success(`Company "${company.name}" updated.`);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── assign-industry ────────────────────────────────────
  cmd
    .command("assign-industry <companyId>")
    .description("Assign an industry to a company")
    .option("--industry <industry>", "Industry ID or name")
    .action(async (companyId: string, opts) => {
      try {
        const company = await service.getCompany(companyId);
        if (!company) return error(`Company not found: ${companyId}`);

        let industryId: string;
        if (opts.industry) {
          const ind = await industryService.getIndustry(opts.industry);
          if (!ind) return error(`Industry not found: ${opts.industry}`);
          industryId = ind.id;
        } else {
          const industries = await industryService.listIndustries({});
          if (industries.length === 0) return error("No industries found. Create one first.");
          industryId = await selectInput({
            message: "Select industry",
            options: industries.map((i) => ({ value: i.id, label: i.name })),
          });
        }

        await withSpinner("Assigning industry", () =>
          service.assignIndustry({ companyId: company.id, industryId })
        );

        success("Industry assigned to company.");
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── assign-niche ───────────────────────────────────────
  cmd
    .command("assign-niche <companyId>")
    .description("Assign a niche to a company")
    .option("--niche <niche>", "Niche ID or name")
    .action(async (companyId: string, opts) => {
      try {
        const company = await service.getCompany(companyId);
        if (!company) return error(`Company not found: ${companyId}`);

        let nicheId: string;
        if (opts.niche) {
          const n = await nicheService.getNiche(opts.niche);
          if (!n) return error(`Niche not found: ${opts.niche}`);
          nicheId = n.id;
        } else {
          const niches = await nicheService.listNiches({});
          if (niches.length === 0) return error("No niches found. Create one first.");
          nicheId = await selectInput({
            message: "Select niche",
            options: niches.map((n) => ({ value: n.id, label: `${n.name} (${n.industryName})` })),
          });
        }

        await withSpinner("Assigning niche", () =>
          service.assignNiche({ companyId: company.id, nicheId })
        );

        success("Niche assigned to company.");
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── assign-product ─────────────────────────────────────
  cmd
    .command("assign-product <companyId>")
    .description("Assign a product to a company")
    .option("--product <product>", "Product ID or name")
    .option("--notes <notes>", "Notes")
    .action(async (companyId: string, opts) => {
      try {
        const company = await service.getCompany(companyId);
        if (!company) return error(`Company not found: ${companyId}`);

        let productId: string;
        if (opts.product) {
          const p = await productService.getProduct(opts.product);
          if (!p) return error(`Product not found: ${opts.product}`);
          productId = p.id;
        } else {
          const products = await productService.listProducts({});
          if (products.length === 0) return error("No products found. Create one first.");
          productId = await selectInput({
            message: "Select product",
            options: products.map((p) => ({ value: p.id, label: p.name })),
          });
        }

        const notes = opts.product ? opts.notes : (await textInput({ message: "Notes (optional)" }));

        await withSpinner("Assigning product", () =>
          service.assignProduct({ companyId: company.id, productId, notes: notes || undefined })
        );

        success("Product assigned to company.");
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── assign-service ─────────────────────────────────────
  cmd
    .command("assign-service <companyId>")
    .description("Assign a service to a company")
    .option("--service <service>", "Service ID or name")
    .option("--notes <notes>", "Notes")
    .action(async (companyId: string, opts) => {
      try {
        const company = await service.getCompany(companyId);
        if (!company) return error(`Company not found: ${companyId}`);

        let serviceId: string;
        if (opts.service) {
          const s = await svcService.getService(opts.service);
          if (!s) return error(`Service not found: ${opts.service}`);
          serviceId = s.id;
        } else {
          const services = await svcService.listServices({});
          if (services.length === 0) return error("No services found. Create one first.");
          serviceId = await selectInput({
            message: "Select service",
            options: services.map((s) => ({ value: s.id, label: s.name })),
          });
        }

        const notes = opts.service ? opts.notes : (await textInput({ message: "Notes (optional)" }));

        await withSpinner("Assigning service", () =>
          service.assignService({ companyId: company.id, serviceId, notes: notes || undefined })
        );

        success("Service assigned to company.");
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });
}
