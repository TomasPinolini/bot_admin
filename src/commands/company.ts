import { Command } from "commander";
import * as service from "../services/company.service.js";
import { createCompanySchema } from "../types/company.types.js";
import { statusEnum } from "../types/common.js";
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
    .option("--industry <industry>", "Industry")
    .option("--niche <niche>", "Niche")
    .option("--contact-name <name>", "Contact name")
    .option("--contact-email <email>", "Contact email")
    .option("--contact-phone <phone>", "Contact phone")
    .option("--website <url>", "Website URL")
    .option("--notes <notes>", "Notes")
    .action(async (opts) => {
      try {
        const interactive = !opts.name && !opts.industry;

        const name = opts.name || (await textInput({ message: "Company name", required: true }));
        const industry =
          opts.industry || (await textInput({ message: "Industry", required: true }));
        const niche = interactive
          ? (await textInput({ message: "Niche (optional)" }))
          : opts.niche;
        const contactName = interactive
          ? (await textInput({ message: "Contact name (optional)" }))
          : opts.contactName;
        const contactEmail = interactive
          ? (await textInput({ message: "Contact email (optional)" }))
          : opts.contactEmail;

        const input = createCompanySchema.parse({
          name,
          industry,
          niche: niche || undefined,
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
        label("Industry", company.industry);
        if (company.niche) label("Niche", company.niche);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List companies")
    .option("--industry <industry>", "Filter by industry")
    .option("--status <status>", "Filter by status (active, inactive, archived)")
    .option("--search <term>", "Search by name, industry, or niche")
    .action(async (opts) => {
      const companies = await withSpinner("Loading companies", () =>
        service.listCompanies({
          industry: opts.industry,
          status: opts.status,
          search: opts.search,
        })
      );

      if (companies.length === 0) return noResults("companies");

      heading("Companies");
      const table = createTable(["ID", "Name", "Industry", "Niche", "Status", "Created"]);
      for (const c of companies) {
        table.push([
          c.id,
          c.name,
          c.industry,
          c.niche ?? "—",
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
      label("Industry", company.industry);
      label("Niche", company.niche);
      label("Status", company.status);
      label("Contact", company.contactName);
      label("Email", company.contactEmail);
      label("Phone", company.contactPhone);
      label("Website", company.website);
      label("Notes", company.notes);
      label("Created", formatDate(company.createdAt));
      label("Updated", formatDate(company.updatedAt));
    });

  // ── edit ───────────────────────────────────────────────
  cmd
    .command("edit <id>")
    .description("Edit a company")
    .option("--name <name>", "Company name")
    .option("--industry <industry>", "Industry")
    .option("--niche <niche>", "Niche")
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
          if (opts.industry) updates.industry = opts.industry;
          if (opts.niche) updates.niche = opts.niche;
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
          const industry = await textInput({
            message: "Industry",
            initialValue: existing.industry,
            required: true,
          });
          const niche = await textInput({
            message: "Niche",
            initialValue: existing.niche ?? "",
          });
          const status = await selectInput({
            message: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "archived", label: "Archived" },
            ],
          });

          updates = {
            name,
            industry,
            niche: niche || undefined,
            status,
          };
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
}
