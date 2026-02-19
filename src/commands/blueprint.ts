import { Command } from "commander";
import * as service from "../services/blueprint.service.js";
import * as toolService from "../services/tool.service.js";
import { textInput } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import {
  heading,
  success,
  label,
  createTable,
  noResults,
  error,
} from "../utils/format.js";

export function registerBlueprintCommands(program: Command) {
  const cmd = program
    .command("blueprint")
    .description("Manage reusable blueprints");

  // ── add ────────────────────────────────────────────────
  cmd
    .command("add")
    .description("Create a new blueprint")
    .option("--name <name>", "Blueprint name")
    .option("--description <desc>", "Description")
    .option("--industry <industry>", "Target industry")
    .option("--niche <niche>", "Target niche")
    .action(async (opts) => {
      const name =
        opts.name ||
        (await textInput({ message: "Blueprint name", required: true }));
      const description =
        opts.description ??
        (await textInput({ message: "Description (optional)" }));
      const targetIndustry =
        opts.industry ??
        (await textInput({ message: "Target industry (optional)" }));
      const targetNiche =
        opts.niche ??
        (await textInput({ message: "Target niche (optional)" }));

      const bp = await withSpinner("Creating blueprint", () =>
        service.createBlueprint({
          name,
          description: description || undefined,
          targetIndustry: targetIndustry || undefined,
          targetNiche: targetNiche || undefined,
        })
      );

      heading("Blueprint Created");
      label("ID", bp.id);
      label("Name", bp.name);
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List blueprints")
    .option("--industry <industry>", "Filter by industry")
    .option("--niche <niche>", "Filter by niche")
    .option("--search <term>", "Search")
    .action(async (opts) => {
      const bps = await withSpinner("Loading blueprints", () =>
        service.listBlueprints({
          industry: opts.industry,
          niche: opts.niche,
          search: opts.search,
        })
      );

      if (bps.length === 0) return noResults("blueprints");

      heading("Blueprints");
      const table = createTable([
        "ID",
        "Name",
        "Industry",
        "Niche",
      ]);
      for (const bp of bps) {
        table.push([
          bp.id,
          bp.name,
          bp.targetIndustry ?? "—",
          bp.targetNiche ?? "—",
        ]);
      }
      console.log(table.toString());
    });

  // ── show ───────────────────────────────────────────────
  cmd
    .command("show <id>")
    .description("Show blueprint details")
    .action(async (id: string) => {
      const bp = await withSpinner("Loading blueprint", () =>
        service.getBlueprint(id)
      );

      if (!bp) return error(`Blueprint not found: ${id}`);

      heading(bp.name);
      label("ID", bp.id);
      label("Description", bp.description);
      label("Industry", bp.targetIndustry);
      label("Niche", bp.targetNiche);

      if (bp.steps.length > 0) {
        heading("Steps");
        const table = createTable(["#", "Title", "Description"]);
        for (const s of bp.steps) {
          table.push([
            String(s.stepOrder),
            s.title,
            s.description ?? "—",
          ]);
        }
        console.log(table.toString());
      }

      if (bp.tools.length > 0) {
        heading("Tools");
        const table = createTable(["Tool", "Role", "Notes"]);
        for (const t of bp.tools) {
          table.push([
            t.toolName,
            t.roleInBlueprint ?? "—",
            t.notes ?? "—",
          ]);
        }
        console.log(table.toString());
      }
    });

  // ── add-step ───────────────────────────────────────────
  cmd
    .command("add-step <blueprintId>")
    .description("Add a step to a blueprint")
    .option("--order <n>", "Step order number")
    .option("--title <title>", "Step title")
    .option("--description <desc>", "Step description")
    .action(async (blueprintId: string, opts) => {
      const stepOrder = opts.order
        ? parseInt(opts.order, 10)
        : parseInt(
            await textInput({ message: "Step order (number)", required: true }),
            10
          );
      const title =
        opts.title ||
        (await textInput({ message: "Step title", required: true }));
      const description =
        opts.description ??
        (await textInput({ message: "Description (optional)" }));

      const step = await withSpinner("Adding step", () =>
        service.addStep({
          blueprintId,
          stepOrder,
          title,
          description: description || undefined,
        })
      );

      success(`Step ${step.stepOrder}: "${step.title}" added.`);
    });

  // ── add-tool ───────────────────────────────────────────
  cmd
    .command("add-tool <blueprintId>")
    .description("Add a tool to a blueprint")
    .option("--tool <id>", "Tool ID or name")
    .option("--role <role>", "Role in blueprint")
    .option("--notes <notes>", "Notes")
    .action(async (blueprintId: string, opts) => {
      const toolRef =
        opts.tool ||
        (await textInput({ message: "Tool ID or name", required: true }));
      const tool = await toolService.getTool(toolRef);
      if (!tool) return error(`Tool not found: ${toolRef}`);

      const role =
        opts.role ?? (await textInput({ message: "Role in blueprint (optional)" }));
      const notes =
        opts.notes ?? (await textInput({ message: "Notes (optional)" }));

      await withSpinner("Adding tool to blueprint", () =>
        service.addTool({
          blueprintId,
          toolId: tool.id,
          roleInBlueprint: role || undefined,
          notes: notes || undefined,
        })
      );

      success(`Tool "${tool.name}" added to blueprint.`);
    });

  // ── apply ──────────────────────────────────────────────
  cmd
    .command("apply <blueprintId>")
    .description("Apply a blueprint to a company (creates a new project)")
    .option("--company <id>", "Company ID or name")
    .option("--project-name <name>", "Override project name")
    .action(async (blueprintId: string, opts) => {
      const companyRef =
        opts.company ||
        (await textInput({ message: "Company ID or name", required: true }));

      // Resolve company
      const { getCompany } = await import(
        "../services/company.service.js"
      );
      const company = await getCompany(companyRef);
      if (!company) return error(`Company not found: ${companyRef}`);

      const projectName =
        opts.projectName ??
        (await textInput({ message: "Project name (optional, defaults to blueprint name)" }));

      const result = await withSpinner("Applying blueprint", () =>
        service.applyBlueprint({
          blueprintId,
          companyId: company.id,
          projectName: projectName || undefined,
        })
      );

      if (!result) return error(`Blueprint not found: ${blueprintId}`);

      heading("Blueprint Applied");
      label("Project ID", result.project.id);
      label("Project Name", result.project.name);
      label("Company", company.name);
      label("Tools Assigned", String(result.blueprint.tools.length));
      success("Project created from blueprint. Use `bot project show` to view it.");
    });
}
