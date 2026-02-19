import { Command } from "commander";
import * as service from "../services/industry.service.js";
import * as nicheService from "../services/niche.service.js";
import { textInput, isCancelError } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import { heading, success, label, createTable, noResults, error } from "../utils/format.js";
import { formatDate } from "../utils/date.js";

export function registerIndustryCommands(program: Command) {
  const cmd = program.command("industry").description("Manage industries");

  // ── add ────────────────────────────────────────────────
  cmd
    .command("add")
    .description("Add a new industry")
    .option("--name <name>", "Industry name")
    .option("--description <desc>", "Description")
    .action(async (opts) => {
      try {
        const interactive = !opts.name;

        const name =
          opts.name || (await textInput({ message: "Industry name", required: true }));
        const description = interactive
          ? (opts.description ?? (await textInput({ message: "Description (optional)" })))
          : opts.description;

        const industry = await withSpinner("Creating industry", () =>
          service.createIndustry({
            name,
            description: description || undefined,
          })
        );

        heading("Industry Created");
        label("ID", industry.id);
        label("Name", industry.name);
        if (industry.description) label("Description", industry.description);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List industries")
    .option("--search <term>", "Search by name or description")
    .action(async (opts) => {
      const items = await withSpinner("Loading industries", () =>
        service.listIndustries({ search: opts.search })
      );

      if (items.length === 0) return noResults("industries");

      heading("Industries");
      const table = createTable(["ID", "Name", "Description", "Created"]);
      for (const i of items) {
        table.push([i.id, i.name, i.description ?? "—", formatDate(i.createdAt)]);
      }
      console.log(table.toString());
    });

  // ── show ───────────────────────────────────────────────
  cmd
    .command("show <id>")
    .description("Show industry details and its niches")
    .action(async (id: string) => {
      const industry = await withSpinner("Loading industry", () =>
        service.getIndustry(id)
      );

      if (!industry) return error(`Industry not found: ${id}`);

      heading(industry.name);
      label("ID", industry.id);
      label("Description", industry.description);
      label("Created", formatDate(industry.createdAt));

      const niches = await withSpinner("Loading niches", () =>
        nicheService.listNiches({ industryId: industry.id })
      );

      if (niches.length > 0) {
        heading("Niches");
        const table = createTable(["ID", "Name", "Description"]);
        for (const n of niches) {
          table.push([n.id, n.name, n.description ?? "—"]);
        }
        console.log(table.toString());
      }
    });
}
