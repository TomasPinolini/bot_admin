import { Command } from "commander";
import * as service from "../services/tool.service.js";
import { createToolSchema } from "../types/tool.types.js";
import { toolCategoryEnum } from "../types/common.js";
import { textInput, selectInput, isCancelError } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import { heading, success, label, createTable, noResults, error } from "../utils/format.js";

export function registerToolCommands(program: Command) {
  const cmd = program.command("tool").description("Manage tools registry");

  // ── add ────────────────────────────────────────────────
  cmd
    .command("add")
    .description("Register a new tool")
    .option("--name <name>", "Tool name")
    .option("--category <category>", "Category")
    .option("--url <url>", "Tool URL")
    .option("--description <desc>", "Description")
    .action(async (opts) => {
      try {
        const interactive = !opts.name;

        const name =
          opts.name || (await textInput({ message: "Tool name", required: true }));
        const category = interactive
          ? (opts.category ||
            (await selectInput({
              message: "Category",
              options: toolCategoryEnum.options.map((v) => ({ value: v, label: v })),
            })))
          : opts.category;
        const url = interactive
          ? (opts.url ?? (await textInput({ message: "URL (optional)" })))
          : opts.url;
        const description = interactive
          ? (opts.description ?? (await textInput({ message: "Description (optional)" })))
          : opts.description;

        const input = createToolSchema.parse({
          name,
          category: category || undefined,
          url: url || undefined,
          description: description || undefined,
        });

        const tool = await withSpinner("Creating tool", () =>
          service.createTool(input)
        );

        heading("Tool Registered");
        label("ID", tool.id);
        label("Name", tool.name);
        label("Category", tool.category);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List tools")
    .option("--category <category>", "Filter by category")
    .option("--search <term>", "Search by name or description")
    .action(async (opts) => {
      const tools = await withSpinner("Loading tools", () =>
        service.listTools({
          category: opts.category,
          search: opts.search,
        })
      );

      if (tools.length === 0) return noResults("tools");

      heading("Tools");
      const table = createTable(["ID", "Name", "Category", "URL"]);
      for (const t of tools) {
        table.push([t.id, t.name, t.category ?? "—", t.url ?? "—"]);
      }
      console.log(table.toString());
    });

  // ── show ───────────────────────────────────────────────
  cmd
    .command("show <id>")
    .description("Show tool details")
    .action(async (id: string) => {
      const tool = await withSpinner("Loading tool", () => service.getTool(id));

      if (!tool) return error(`Tool not found: ${id}`);

      heading(tool.name);
      label("ID", tool.id);
      label("Category", tool.category);
      label("URL", tool.url);
      label("Description", tool.description);
    });
}
