import { Command } from "commander";
import * as svcService from "../services/service.service.js";
import { textInput, isCancelError } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import { heading, label, createTable, noResults, error } from "../utils/format.js";
import { formatDate } from "../utils/date.js";

export function registerServiceCommands(program: Command) {
  const cmd = program.command("service").description("Manage services");

  // ── add ────────────────────────────────────────────────
  cmd
    .command("add")
    .description("Add a new service")
    .option("--name <name>", "Service name")
    .option("--description <desc>", "Description")
    .action(async (opts) => {
      try {
        const interactive = !opts.name;

        const name =
          opts.name || (await textInput({ message: "Service name", required: true }));
        const description = interactive
          ? (opts.description ?? (await textInput({ message: "Description (optional)" })))
          : opts.description;

        const service = await withSpinner("Creating service", () =>
          svcService.createService({
            name,
            description: description || undefined,
          })
        );

        heading("Service Created");
        label("ID", service.id);
        label("Name", service.name);
        if (service.description) label("Description", service.description);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List services")
    .option("--search <term>", "Search by name or description")
    .action(async (opts) => {
      const items = await withSpinner("Loading services", () =>
        svcService.listServices({ search: opts.search })
      );

      if (items.length === 0) return noResults("services");

      heading("Services");
      const table = createTable(["ID", "Name", "Description", "Created"]);
      for (const s of items) {
        table.push([s.id, s.name, s.description ?? "—", formatDate(s.createdAt)]);
      }
      console.log(table.toString());
    });

  // ── show ───────────────────────────────────────────────
  cmd
    .command("show <id>")
    .description("Show service details")
    .action(async (id: string) => {
      const service = await withSpinner("Loading service", () =>
        svcService.getService(id)
      );

      if (!service) return error(`Service not found: ${id}`);

      heading(service.name);
      label("ID", service.id);
      label("Description", service.description);
      label("Created", formatDate(service.createdAt));
    });
}
