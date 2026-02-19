import { Command } from "commander";
import * as service from "../services/impl.service.js";
import { implTypeEnum } from "../types/common.js";
import { textInput, selectInput } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import {
  heading,
  label,
  createTable,
  noResults,
  error,
} from "../utils/format.js";
import { formatDate } from "../utils/date.js";
import chalk from "chalk";

export function registerImplCommands(program: Command) {
  const cmd = program
    .command("impl")
    .description("Manage implementation details");

  // ── add ────────────────────────────────────────────────
  cmd
    .command("add")
    .description("Add an implementation detail to a project")
    .option("--project <id>", "Project ID")
    .option("--type <type>", "Type (prompt, config, api_ref, note)")
    .option("--title <title>", "Title")
    .option("--content <content>", "Content")
    .action(async (opts) => {
      const projectId =
        opts.project ||
        (await textInput({ message: "Project ID", required: true }));
      const type =
        opts.type ||
        (await selectInput({
          message: "Type",
          options: implTypeEnum.options.map((v) => ({ value: v, label: v })),
        }));
      const title =
        opts.title || (await textInput({ message: "Title", required: true }));
      const content =
        opts.content ||
        (await textInput({ message: "Content", required: true }));

      const impl = await withSpinner("Creating implementation detail", () =>
        service.createImpl({
          projectId,
          type,
          title,
          content,
        })
      );

      heading("Implementation Detail Created");
      label("ID", impl.id);
      label("Type", impl.type);
      label("Title", impl.title);
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List implementation details for a project")
    .requiredOption("--project <id>", "Project ID")
    .option("--type <type>", "Filter by type")
    .action(async (opts) => {
      const impls = await withSpinner("Loading implementation details", () =>
        service.listImpls({
          projectId: opts.project,
          type: opts.type,
        })
      );

      if (impls.length === 0) return noResults("implementation details");

      heading("Implementation Details");
      const table = createTable(["ID", "Type", "Title", "Created"]);
      for (const i of impls) {
        table.push([i.id, i.type, i.title, formatDate(i.createdAt)]);
      }
      console.log(table.toString());
    });

  // ── show ───────────────────────────────────────────────
  cmd
    .command("show <id>")
    .description("Show implementation detail")
    .action(async (id: string) => {
      const impl = await withSpinner("Loading", () => service.getImpl(id));

      if (!impl) return error(`Implementation detail not found: ${id}`);

      heading(impl.title);
      label("ID", impl.id);
      label("Type", impl.type);
      label("Project", impl.projectId);
      label("Created", formatDate(impl.createdAt));
      label("Updated", formatDate(impl.updatedAt));
      console.log(chalk.gray("\n  ─── Content ───\n"));
      console.log(`  ${impl.content}`);
    });
}
