import { Command } from "commander";
import * as service from "../services/niche.service.js";
import * as industryService from "../services/industry.service.js";
import { textInput, selectInput, isCancelError } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import { heading, label, createTable, noResults, error } from "../utils/format.js";
import { formatDate } from "../utils/date.js";

export function registerNicheCommands(program: Command) {
  const cmd = program.command("niche").description("Manage niches");

  // ── add ────────────────────────────────────────────────
  cmd
    .command("add")
    .description("Add a new niche")
    .option("--industry <industry>", "Industry ID or name")
    .option("--name <name>", "Niche name")
    .option("--description <desc>", "Description")
    .action(async (opts) => {
      try {
        const interactive = !opts.name;

        // Resolve industry
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

        const name =
          opts.name || (await textInput({ message: "Niche name", required: true }));
        const description = interactive
          ? (opts.description ?? (await textInput({ message: "Description (optional)" })))
          : opts.description;

        const niche = await withSpinner("Creating niche", () =>
          service.createNiche({
            industryId,
            name,
            description: description || undefined,
          })
        );

        heading("Niche Created");
        label("ID", niche.id);
        label("Name", niche.name);
        label("Industry", industryId);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List niches")
    .option("--industry <industry>", "Filter by industry ID or name")
    .option("--search <term>", "Search by name or description")
    .action(async (opts) => {
      let industryId: string | undefined;
      if (opts.industry) {
        const ind = await industryService.getIndustry(opts.industry);
        if (!ind) return error(`Industry not found: ${opts.industry}`);
        industryId = ind.id;
      }

      const items = await withSpinner("Loading niches", () =>
        service.listNiches({ industryId, search: opts.search })
      );

      if (items.length === 0) return noResults("niches");

      heading("Niches");
      const table = createTable(["ID", "Name", "Industry", "Description", "Created"]);
      for (const n of items) {
        table.push([n.id, n.name, n.industryName, n.description ?? "—", formatDate(n.createdAt)]);
      }
      console.log(table.toString());
    });

  // ── show ───────────────────────────────────────────────
  cmd
    .command("show <id>")
    .description("Show niche details")
    .action(async (id: string) => {
      const niche = await withSpinner("Loading niche", () => service.getNiche(id));

      if (!niche) return error(`Niche not found: ${id}`);

      heading(niche.name);
      label("ID", niche.id);
      label("Industry", niche.industryName);
      label("Description", niche.description);
      label("Created", formatDate(niche.createdAt));
    });
}
