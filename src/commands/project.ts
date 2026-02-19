import { Command } from "commander";
import * as service from "../services/project.service.js";
import * as companyService from "../services/company.service.js";
import * as toolService from "../services/tool.service.js";
import { projectStatusEnum } from "../types/common.js";
import { textInput, selectInput, isCancelError } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import {
  heading,
  success,
  label,
  createTable,
  noResults,
  error,
  warn,
} from "../utils/format.js";
import { formatDate } from "../utils/date.js";

export function registerProjectCommands(program: Command) {
  const cmd = program.command("project").description("Manage projects");

  // ── add ────────────────────────────────────────────────
  cmd
    .command("add")
    .description("Create a new project for a company")
    .option("--company <id>", "Company ID or name")
    .option("--name <name>", "Project name")
    .option("--description <desc>", "Description")
    .option("--start-date <date>", "Start date (YYYY-MM-DD)")
    .option("--target-date <date>", "Target date (YYYY-MM-DD)")
    .action(async (opts) => {
      try {
        const interactive = !opts.company && !opts.name;

        const companyRef =
          opts.company ||
          (await textInput({ message: "Company ID or name", required: true }));
        const company = await companyService.getCompany(companyRef);
        if (!company) return error(`Company not found: ${companyRef}`);

        const name =
          opts.name || (await textInput({ message: "Project name", required: true }));
        const description = interactive
          ? (opts.description ?? (await textInput({ message: "Description (optional)" })))
          : opts.description;

        const project = await withSpinner("Creating project", () =>
          service.createProject({
            companyId: company.id,
            name,
            description: description || undefined,
            startDate: opts.startDate,
            targetDate: opts.targetDate,
          })
        );

        heading("Project Created");
        label("ID", project.id);
        label("Company", company.name);
        label("Name", project.name);
        label("Status", project.status);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── list ───────────────────────────────────────────────
  cmd
    .command("list")
    .description("List projects")
    .option("--company <id>", "Filter by company ID or name")
    .option("--status <status>", "Filter by status")
    .option("--search <term>", "Search by name")
    .action(async (opts) => {
      let companyId: string | undefined;
      if (opts.company) {
        const company = await companyService.getCompany(opts.company);
        if (company) companyId = company.id;
      }

      const projects = await withSpinner("Loading projects", () =>
        service.listProjects({
          companyId,
          status: opts.status,
          search: opts.search,
        })
      );

      if (projects.length === 0) return noResults("projects");

      heading("Projects");
      const table = createTable([
        "ID",
        "Company",
        "Name",
        "Status",
        "Start",
        "Target",
      ]);
      for (const p of projects) {
        table.push([
          p.id,
          p.companyName ?? "—",
          p.name,
          p.status,
          p.startDate ?? "—",
          p.targetDate ?? "—",
        ]);
      }
      console.log(table.toString());
    });

  // ── show ───────────────────────────────────────────────
  cmd
    .command("show <id>")
    .description("Show project details")
    .action(async (id: string) => {
      const project = await withSpinner("Loading project", () =>
        service.getProject(id)
      );
      if (!project) return error(`Project not found: ${id}`);

      heading(project.name);
      label("ID", project.id);
      label("Company", project.companyName);
      label("Status", project.status);
      label("Description", project.description);
      label("Start Date", project.startDate);
      label("Target Date", project.targetDate);
      label("Completed", project.completedDate);
      label("Created", formatDate(project.createdAt));
      label("Updated", formatDate(project.updatedAt));

      // Show assigned tools
      const tools = await service.getProjectTools(id);
      if (tools.length > 0) {
        heading("Assigned Tools");
        const table = createTable(["Tool", "Category", "Notes"]);
        for (const t of tools) {
          table.push([t.toolName, t.toolCategory ?? "—", t.notes ?? "—"]);
        }
        console.log(table.toString());
      }
    });

  // ── advance ────────────────────────────────────────────
  cmd
    .command("advance <id>")
    .description("Advance project to next status")
    .action(async (id: string) => {
      const result = await withSpinner("Advancing project", () =>
        service.advanceProject(id)
      );

      if (!result) return error(`Project not found: ${id}`);
      if (!result.advanced) return warn(result.reason!);

      success(
        `Project "${result.project.name}" advanced to: ${result.newStatus}`
      );
    });

  // ── status ─────────────────────────────────────────────
  cmd
    .command("status <id>")
    .description("Set project status directly")
    .option("--set <status>", "New status")
    .action(async (id: string, opts) => {
      try {
        const status =
          opts.set ||
          (await selectInput({
            message: "New status",
            options: projectStatusEnum.options.map((v) => ({
              value: v,
              label: v,
            })),
          }));

        const project = await withSpinner("Updating status", () =>
          service.updateProject(id, { status })
        );

        if (!project) return error(`Project not found: ${id}`);
        success(`Project status set to: ${project.status}`);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });

  // ── assign-tool ────────────────────────────────────────
  cmd
    .command("assign-tool <projectId>")
    .description("Assign a tool to a project")
    .option("--tool <id>", "Tool ID or name")
    .option("--notes <notes>", "Notes about tool usage")
    .action(async (projectId: string, opts) => {
      try {
        const toolRef =
          opts.tool ||
          (await textInput({ message: "Tool ID or name", required: true }));
        const tool = await toolService.getTool(toolRef);
        if (!tool) return error(`Tool not found: ${toolRef}`);

        const notes = opts.tool
          ? opts.notes
          : (opts.notes ?? (await textInput({ message: "Notes (optional)" })));

        await withSpinner("Assigning tool", () =>
          service.assignTool({
            projectId,
            toolId: tool.id,
            notes: notes || undefined,
          })
        );

        success(`Tool "${tool.name}" assigned to project.`);
      } catch (err) {
        if (isCancelError(err)) process.exit(0);
        throw err;
      }
    });
}
