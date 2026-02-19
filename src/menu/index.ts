import chalk from "chalk";
import * as companyService from "../services/company.service.js";
import * as projectService from "../services/project.service.js";
import * as toolService from "../services/tool.service.js";
import * as implService from "../services/impl.service.js";
import * as progressService from "../services/progress.service.js";
import * as blueprintService from "../services/blueprint.service.js";
import * as industryService from "../services/industry.service.js";
import * as nicheService from "../services/niche.service.js";
import * as productService from "../services/product.service.js";
import * as svcService from "../services/service.service.js";
import type { Status, ProjectStatus, ProjectPhase, ImplType } from "../types/common.js";
import { projectStatusEnum, projectPhaseEnum, implTypeEnum, toolCategoryEnum } from "../types/common.js";
import { createCompanySchema } from "../types/company.types.js";
import { createToolSchema } from "../types/tool.types.js";
import { selectInput, textInput, confirmInput, CancelError } from "../ui/prompts.js";
import { withSpinner } from "../ui/display.js";
import { heading, success, label, createTable, noResults, error, warn } from "../utils/format.js";
import { formatDate, formatDateTime } from "../utils/date.js";
import { closeDb } from "../db/index.js";

// ── Helpers ────────────────────────────────────────────

const BACK = "__back__";

async function pickCompany(message = "Select a company"): Promise<string> {
  const companies = await companyService.listCompanies({});
  if (companies.length === 0) {
    error("No companies found. Create one first.");
    throw new CancelError();
  }
  return selectInput({
    message,
    options: companies.map((c) => ({ value: c.id, label: c.name })),
  });
}

async function pickProject(message = "Select a project"): Promise<string> {
  const projects = await projectService.listProjects({});
  if (projects.length === 0) {
    error("No projects found. Create one first.");
    throw new CancelError();
  }
  return selectInput({
    message,
    options: projects.map((p) => ({
      value: p.id,
      label: `${p.name} — ${p.companyName ?? "?"} [${p.status}]`,
    })),
  });
}

async function pickTool(message = "Select a tool"): Promise<string> {
  const tools = await toolService.listTools({});
  if (tools.length === 0) {
    error("No tools found. Create one first.");
    throw new CancelError();
  }
  return selectInput({
    message,
    options: tools.map((t) => ({
      value: t.id,
      label: `${t.name}${t.category ? ` [${t.category}]` : ""}`,
    })),
  });
}

async function pickBlueprint(message = "Select a blueprint"): Promise<string> {
  const bps = await blueprintService.listBlueprints({});
  if (bps.length === 0) {
    error("No blueprints found. Create one first.");
    throw new CancelError();
  }
  return selectInput({
    message,
    options: bps.map((b) => ({ value: b.id, label: b.name })),
  });
}

async function pickIndustry(message = "Select an industry"): Promise<string> {
  const items = await industryService.listIndustries({});
  if (items.length === 0) {
    error("No industries found. Create one first.");
    throw new CancelError();
  }
  return selectInput({
    message,
    options: items.map((i) => ({ value: i.id, label: i.name })),
  });
}

async function pickNiche(message = "Select a niche", industryId?: string): Promise<string> {
  const items = await nicheService.listNiches({ industryId });
  if (items.length === 0) {
    error("No niches found. Create one first.");
    throw new CancelError();
  }
  return selectInput({
    message,
    options: items.map((n) => ({ value: n.id, label: `${n.name} (${n.industryName})` })),
  });
}

async function pickProduct(message = "Select a product"): Promise<string> {
  const items = await productService.listProducts({});
  if (items.length === 0) {
    error("No products found. Create one first.");
    throw new CancelError();
  }
  return selectInput({
    message,
    options: items.map((p) => ({ value: p.id, label: p.name })),
  });
}

async function pickService(message = "Select a service"): Promise<string> {
  const items = await svcService.listServices({});
  if (items.length === 0) {
    error("No services found. Create one first.");
    throw new CancelError();
  }
  return selectInput({
    message,
    options: items.map((s) => ({ value: s.id, label: s.name })),
  });
}

// ── Company Menu ───────────────────────────────────────

async function companyMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Companies",
      options: [
        { value: "add", label: "Add new company" },
        { value: "list", label: "List companies" },
        { value: "edit", label: "Edit a company" },
        { value: "assign-industry", label: "Assign industry" },
        { value: "assign-niche", label: "Assign niche" },
        { value: "assign-product", label: "Assign product" },
        { value: "assign-service", label: "Assign service" },
        { value: BACK, label: "\u2190 Back to main menu" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "add") {
        const name = await textInput({ message: "Company name", required: true });
        const contactName = await textInput({ message: "Contact name (optional)" });
        const contactEmail = await textInput({ message: "Contact email (optional)" });

        const input = createCompanySchema.parse({
          name,
          contactName: contactName || undefined,
          contactEmail: contactEmail || undefined,
        });

        const company = await withSpinner("Creating company", () =>
          companyService.createCompany(input)
        );

        heading("Company Created");
        label("ID", company.id);
        label("Name", company.name);
      }

      if (action === "list") {
        const companies = await withSpinner("Loading companies", () =>
          companyService.listCompanies({})
        );

        if (companies.length === 0) {
          noResults("companies");
          continue;
        }

        heading("Companies");
        const table = createTable(["ID", "Name", "Status", "Created"]);
        for (const c of companies) {
          table.push([c.id, c.name, c.status, formatDate(c.createdAt)]);
        }
        console.log(table.toString());

        // Offer to view details
        const viewChoice = await selectInput({
          message: "View details?",
          options: [
            { value: BACK, label: "No, go back" },
            ...companies.map((c) => ({ value: c.id, label: c.name })),
          ],
        });

        if (viewChoice !== BACK) {
          const company = await companyService.getCompany(viewChoice);
          if (company) {
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
              const iTable = createTable(["Name"]);
              for (const i of company.industries) iTable.push([i.industryName]);
              console.log(iTable.toString());
            }
            if (company.niches.length > 0) {
              heading("Niches");
              const nTable = createTable(["Name", "Industry"]);
              for (const n of company.niches) nTable.push([n.nicheName, n.industryName]);
              console.log(nTable.toString());
            }
            if (company.products.length > 0) {
              heading("Products");
              const pTable = createTable(["Name", "Notes"]);
              for (const p of company.products) pTable.push([p.productName, p.notes ?? "\u2014"]);
              console.log(pTable.toString());
            }
            if (company.services.length > 0) {
              heading("Services");
              const sTable = createTable(["Name", "Notes"]);
              for (const s of company.services) sTable.push([s.serviceName, s.notes ?? "\u2014"]);
              console.log(sTable.toString());
            }
          }
        }
      }

      if (action === "edit") {
        const companyId = await pickCompany("Which company to edit?");
        const existing = await companyService.getCompany(companyId);
        if (!existing) { error("Company not found"); continue; }

        const name = await textInput({ message: "Company name", initialValue: existing.name, required: true });
        const status = await selectInput({
          message: "Status",
          options: [
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "archived", label: "Archived" },
          ],
        }) as Status;

        const company = await withSpinner("Updating company", () =>
          companyService.updateCompany(existing.id, { name, status })
        );

        success(`Company "${company.name}" updated.`);
      }

      if (action === "assign-industry") {
        const companyId = await pickCompany("Which company?");
        const industryId = await pickIndustry();
        await withSpinner("Assigning industry", () =>
          companyService.assignIndustry({ companyId, industryId })
        );
        success("Industry assigned to company.");
      }

      if (action === "assign-niche") {
        const companyId = await pickCompany("Which company?");
        const nicheId = await pickNiche();
        await withSpinner("Assigning niche", () =>
          companyService.assignNiche({ companyId, nicheId })
        );
        success("Niche assigned to company.");
      }

      if (action === "assign-product") {
        const companyId = await pickCompany("Which company?");
        const productId = await pickProduct();
        const notes = await textInput({ message: "Notes (optional)" });
        await withSpinner("Assigning product", () =>
          companyService.assignProduct({ companyId, productId, notes: notes || undefined })
        );
        success("Product assigned to company.");
      }

      if (action === "assign-service") {
        const companyId = await pickCompany("Which company?");
        const serviceId = await pickService();
        const notes = await textInput({ message: "Notes (optional)" });
        await withSpinner("Assigning service", () =>
          companyService.assignService({ companyId, serviceId, notes: notes || undefined })
        );
        success("Service assigned to company.");
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

// ── Project Menu ───────────────────────────────────────

async function projectMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Projects",
      options: [
        { value: "add", label: "Create new project" },
        { value: "list", label: "List projects" },
        { value: "advance", label: "Advance project" },
        { value: "status", label: "Set project status" },
        { value: "assign-tool", label: "Assign tool to project" },
        { value: BACK, label: "\u2190 Back to main menu" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "add") {
        const companyId = await pickCompany("Which company?");
        const company = await companyService.getCompany(companyId);
        const name = await textInput({ message: "Project name", required: true });
        const description = await textInput({ message: "Description (optional)" });

        const project = await withSpinner("Creating project", () =>
          projectService.createProject({
            companyId,
            name,
            description: description || undefined,
          })
        );

        heading("Project Created");
        label("ID", project.id);
        label("Company", company?.name ?? companyId);
        label("Name", project.name);
        label("Status", project.status);
      }

      if (action === "list") {
        const projects = await withSpinner("Loading projects", () =>
          projectService.listProjects({})
        );

        if (projects.length === 0) {
          noResults("projects");
          continue;
        }

        heading("Projects");
        const table = createTable(["ID", "Company", "Name", "Status", "Start", "Target"]);
        for (const p of projects) {
          table.push([p.id, p.companyName ?? "\u2014", p.name, p.status, p.startDate ?? "\u2014", p.targetDate ?? "\u2014"]);
        }
        console.log(table.toString());

        const viewChoice = await selectInput({
          message: "View details?",
          options: [
            { value: BACK, label: "No, go back" },
            ...projects.map((p) => ({ value: p.id, label: `${p.name} [${p.status}]` })),
          ],
        });

        if (viewChoice !== BACK) {
          const project = await projectService.getProject(viewChoice);
          if (project) {
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

            const tools = await projectService.getProjectTools(viewChoice);
            if (tools.length > 0) {
              heading("Assigned Tools");
              const tTable = createTable(["Tool", "Category", "Notes"]);
              for (const t of tools) {
                tTable.push([t.toolName, t.toolCategory ?? "\u2014", t.notes ?? "\u2014"]);
              }
              console.log(tTable.toString());
            }
          }
        }
      }

      if (action === "advance") {
        const projectId = await pickProject("Which project to advance?");
        const result = await withSpinner("Advancing project", () =>
          projectService.advanceProject(projectId)
        );
        if (!result) { error("Project not found"); continue; }
        if (!result.advanced) { warn(result.reason!); continue; }
        success(`Project "${result.project.name}" advanced to: ${result.newStatus}`);
      }

      if (action === "status") {
        const projectId = await pickProject("Which project?");
        const status = await selectInput({
          message: "New status",
          options: projectStatusEnum.options.map((v) => ({ value: v, label: v })),
        }) as ProjectStatus;
        const project = await withSpinner("Updating status", () =>
          projectService.updateProject(projectId, { status })
        );
        if (!project) { error("Project not found"); continue; }
        success(`Project status set to: ${project.status}`);
      }

      if (action === "assign-tool") {
        const projectId = await pickProject("Which project?");
        const toolId = await pickTool("Which tool to assign?");
        const notes = await textInput({ message: "Notes (optional)" });

        await withSpinner("Assigning tool", () =>
          projectService.assignTool({
            projectId,
            toolId,
            notes: notes || undefined,
          })
        );
        success("Tool assigned to project.");
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

// ── Tool Menu ──────────────────────────────────────────

async function toolMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Tools",
      options: [
        { value: "add", label: "Add new tool" },
        { value: "list", label: "List tools" },
        { value: BACK, label: "\u2190 Back to main menu" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "add") {
        const name = await textInput({ message: "Tool name", required: true });
        const category = await selectInput({
          message: "Category",
          options: toolCategoryEnum.options.map((v) => ({ value: v, label: v })),
        });
        const url = await textInput({ message: "URL (optional)" });
        const description = await textInput({ message: "Description (optional)" });

        const input = createToolSchema.parse({
          name,
          category: category || undefined,
          url: url || undefined,
          description: description || undefined,
        });

        const tool = await withSpinner("Creating tool", () =>
          toolService.createTool(input)
        );

        heading("Tool Registered");
        label("ID", tool.id);
        label("Name", tool.name);
        label("Category", tool.category);
      }

      if (action === "list") {
        const tools = await withSpinner("Loading tools", () =>
          toolService.listTools({})
        );

        if (tools.length === 0) {
          noResults("tools");
          continue;
        }

        heading("Tools");
        const table = createTable(["ID", "Name", "Category", "URL"]);
        for (const t of tools) {
          table.push([t.id, t.name, t.category ?? "\u2014", t.url ?? "\u2014"]);
        }
        console.log(table.toString());

        const viewChoice = await selectInput({
          message: "View details?",
          options: [
            { value: BACK, label: "No, go back" },
            ...tools.map((t) => ({ value: t.id, label: t.name })),
          ],
        });

        if (viewChoice !== BACK) {
          const tool = await toolService.getTool(viewChoice);
          if (tool) {
            heading(tool.name);
            label("ID", tool.id);
            label("Category", tool.category);
            label("URL", tool.url);
            label("Description", tool.description);
          }
        }
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

// ── Impl Menu ──────────────────────────────────────────

async function implMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Implementation Details",
      options: [
        { value: "add", label: "Add implementation detail" },
        { value: "list", label: "List by project" },
        { value: BACK, label: "\u2190 Back to main menu" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "add") {
        const projectId = await pickProject("Which project?");
        const type = await selectInput({
          message: "Type",
          options: implTypeEnum.options.map((v) => ({ value: v, label: v })),
        }) as ImplType;
        const title = await textInput({ message: "Title", required: true });
        const content = await textInput({ message: "Content", required: true });

        const impl = await withSpinner("Creating implementation detail", () =>
          implService.createImpl({ projectId, type, title, content })
        );

        heading("Implementation Detail Created");
        label("ID", impl.id);
        label("Type", impl.type);
        label("Title", impl.title);
      }

      if (action === "list") {
        const projectId = await pickProject("Which project?");
        const impls = await withSpinner("Loading implementation details", () =>
          implService.listImpls({ projectId })
        );

        if (impls.length === 0) {
          noResults("implementation details");
          continue;
        }

        heading("Implementation Details");
        const table = createTable(["ID", "Type", "Title", "Created"]);
        for (const i of impls) {
          table.push([i.id, i.type, i.title, formatDate(i.createdAt)]);
        }
        console.log(table.toString());

        const viewChoice = await selectInput({
          message: "View details?",
          options: [
            { value: BACK, label: "No, go back" },
            ...impls.map((i) => ({ value: i.id, label: `${i.title} [${i.type}]` })),
          ],
        });

        if (viewChoice !== BACK) {
          const impl = await implService.getImpl(viewChoice);
          if (impl) {
            heading(impl.title);
            label("ID", impl.id);
            label("Type", impl.type);
            label("Project", impl.projectId);
            label("Created", formatDate(impl.createdAt));
            label("Updated", formatDate(impl.updatedAt));
            console.log(chalk.gray("\n  \u2500\u2500\u2500 Content \u2500\u2500\u2500\n"));
            console.log(`  ${impl.content}`);
          }
        }
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

// ── Progress Menu ──────────────────────────────────────

async function progressMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Progress",
      options: [
        { value: "log", label: "Log progress" },
        { value: "timeline", label: "View timeline" },
        { value: BACK, label: "\u2190 Back to main menu" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "log") {
        const projectId = await pickProject("Which project?");
        const phase = await selectInput({
          message: "Phase",
          options: projectPhaseEnum.options.map((v) => ({ value: v, label: v })),
        }) as ProjectPhase;
        const note = await textInput({ message: "Note (optional)" });
        const loggedBy = await textInput({ message: "Logged by (optional)" });

        const log = await withSpinner("Logging progress", () =>
          progressService.createProgressLog({
            projectId,
            phase,
            note: note || undefined,
            loggedBy: loggedBy || undefined,
          })
        );

        success(`Progress logged: ${log.phase} \u2014 ${log.note || "(no note)"}`);
      }

      if (action === "timeline") {
        const projectId = await pickProject("Which project?");
        const logs = await withSpinner("Loading timeline", () =>
          progressService.getTimeline(projectId)
        );

        if (logs.length === 0) {
          noResults("progress logs");
          continue;
        }

        heading("Progress Timeline");
        const table = createTable(["Date", "Phase", "Status", "Note", "By"]);
        for (const l of logs) {
          table.push([
            formatDateTime(l.loggedAt),
            l.phase,
            l.status,
            l.note ?? "\u2014",
            l.loggedBy ?? "\u2014",
          ]);
        }
        console.log(table.toString());
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

// ── Blueprint Menu ─────────────────────────────────────

async function blueprintMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Blueprints",
      options: [
        { value: "add", label: "Create blueprint" },
        { value: "list", label: "List blueprints" },
        { value: "add-step", label: "Add step to blueprint" },
        { value: "add-tool", label: "Add tool to blueprint" },
        { value: "assign-industry", label: "Assign industry" },
        { value: "assign-niche", label: "Assign niche" },
        { value: "apply", label: "Apply blueprint to company" },
        { value: BACK, label: "\u2190 Back to main menu" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "add") {
        const name = await textInput({ message: "Blueprint name", required: true });
        const description = await textInput({ message: "Description (optional)" });

        const bp = await withSpinner("Creating blueprint", () =>
          blueprintService.createBlueprint({
            name,
            description: description || undefined,
          })
        );

        heading("Blueprint Created");
        label("ID", bp.id);
        label("Name", bp.name);
      }

      if (action === "list") {
        const bps = await withSpinner("Loading blueprints", () =>
          blueprintService.listBlueprints({})
        );

        if (bps.length === 0) {
          noResults("blueprints");
          continue;
        }

        heading("Blueprints");
        const table = createTable(["ID", "Name", "Description"]);
        for (const bp of bps) {
          table.push([bp.id, bp.name, bp.description ?? "\u2014"]);
        }
        console.log(table.toString());

        const viewChoice = await selectInput({
          message: "View details?",
          options: [
            { value: BACK, label: "No, go back" },
            ...bps.map((b) => ({ value: b.id, label: b.name })),
          ],
        });

        if (viewChoice !== BACK) {
          const bp = await blueprintService.getBlueprint(viewChoice);
          if (bp) {
            heading(bp.name);
            label("ID", bp.id);
            label("Description", bp.description);

            if (bp.industries.length > 0) {
              heading("Industries");
              const iTable = createTable(["Name"]);
              for (const i of bp.industries) iTable.push([i.industryName]);
              console.log(iTable.toString());
            }

            if (bp.niches.length > 0) {
              heading("Niches");
              const nTable = createTable(["Name", "Industry"]);
              for (const n of bp.niches) nTable.push([n.nicheName, n.industryName]);
              console.log(nTable.toString());
            }

            if (bp.steps.length > 0) {
              heading("Steps");
              const sTable = createTable(["#", "Title", "Description"]);
              for (const s of bp.steps) {
                sTable.push([String(s.stepOrder), s.title, s.description ?? "\u2014"]);
              }
              console.log(sTable.toString());
            }

            if (bp.tools.length > 0) {
              heading("Tools");
              const tTable = createTable(["Tool", "Role", "Notes"]);
              for (const t of bp.tools) {
                tTable.push([t.toolName, t.roleInBlueprint ?? "\u2014", t.notes ?? "\u2014"]);
              }
              console.log(tTable.toString());
            }
          }
        }
      }

      if (action === "add-step") {
        const blueprintId = await pickBlueprint("Which blueprint?");
        const stepOrder = parseInt(
          await textInput({ message: "Step order (number)", required: true }),
          10
        );
        const title = await textInput({ message: "Step title", required: true });
        const description = await textInput({ message: "Description (optional)" });

        const step = await withSpinner("Adding step", () =>
          blueprintService.addStep({
            blueprintId,
            stepOrder,
            title,
            description: description || undefined,
          })
        );

        success(`Step ${step.stepOrder}: "${step.title}" added.`);
      }

      if (action === "add-tool") {
        const blueprintId = await pickBlueprint("Which blueprint?");
        const toolId = await pickTool("Which tool?");
        const role = await textInput({ message: "Role in blueprint (optional)" });
        const notes = await textInput({ message: "Notes (optional)" });

        await withSpinner("Adding tool to blueprint", () =>
          blueprintService.addTool({
            blueprintId,
            toolId,
            roleInBlueprint: role || undefined,
            notes: notes || undefined,
          })
        );

        success("Tool added to blueprint.");
      }

      if (action === "assign-industry") {
        const blueprintId = await pickBlueprint("Which blueprint?");
        const industryId = await pickIndustry();
        await withSpinner("Assigning industry", () =>
          blueprintService.assignIndustry({ blueprintId, industryId })
        );
        success("Industry assigned to blueprint.");
      }

      if (action === "assign-niche") {
        const blueprintId = await pickBlueprint("Which blueprint?");
        const nicheId = await pickNiche();
        await withSpinner("Assigning niche", () =>
          blueprintService.assignNiche({ blueprintId, nicheId })
        );
        success("Niche assigned to blueprint.");
      }

      if (action === "apply") {
        const blueprintId = await pickBlueprint("Which blueprint?");
        const companyId = await pickCompany("Which company?");
        const projectName = await textInput({ message: "Project name (optional, defaults to blueprint name)" });

        const result = await withSpinner("Applying blueprint", () =>
          blueprintService.applyBlueprint({
            blueprintId,
            companyId,
            projectName: projectName || undefined,
          })
        );

        if (!result) { error("Blueprint not found"); continue; }

        const company = await companyService.getCompany(companyId);
        heading("Blueprint Applied");
        label("Project ID", result.project.id);
        label("Project Name", result.project.name);
        label("Company", company?.name ?? companyId);
        label("Tools Assigned", String(result.blueprint.tools.length));
        success("Project created from blueprint.");
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

// ── Catalog Menus ──────────────────────────────────────

async function industryMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Industries",
      options: [
        { value: "add", label: "Add industry" },
        { value: "list", label: "List industries" },
        { value: BACK, label: "\u2190 Back" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "add") {
        const name = await textInput({ message: "Industry name", required: true });
        const description = await textInput({ message: "Description (optional)" });
        const industry = await withSpinner("Creating industry", () =>
          industryService.createIndustry({ name, description: description || undefined })
        );
        heading("Industry Created");
        label("ID", industry.id);
        label("Name", industry.name);
      }

      if (action === "list") {
        const items = await withSpinner("Loading industries", () =>
          industryService.listIndustries({})
        );
        if (items.length === 0) { noResults("industries"); continue; }

        heading("Industries");
        const table = createTable(["ID", "Name", "Description"]);
        for (const i of items) table.push([i.id, i.name, i.description ?? "\u2014"]);
        console.log(table.toString());
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

async function nicheMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Niches",
      options: [
        { value: "add", label: "Add niche" },
        { value: "list", label: "List niches" },
        { value: BACK, label: "\u2190 Back" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "add") {
        const industryId = await pickIndustry("Which industry does this niche belong to?");
        const name = await textInput({ message: "Niche name", required: true });
        const description = await textInput({ message: "Description (optional)" });
        const niche = await withSpinner("Creating niche", () =>
          nicheService.createNiche({ industryId, name, description: description || undefined })
        );
        heading("Niche Created");
        label("ID", niche.id);
        label("Name", niche.name);
      }

      if (action === "list") {
        const items = await withSpinner("Loading niches", () =>
          nicheService.listNiches({})
        );
        if (items.length === 0) { noResults("niches"); continue; }

        heading("Niches");
        const table = createTable(["ID", "Name", "Industry", "Description"]);
        for (const n of items) table.push([n.id, n.name, n.industryName, n.description ?? "\u2014"]);
        console.log(table.toString());
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

async function productMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Products",
      options: [
        { value: "add", label: "Add product" },
        { value: "list", label: "List products" },
        { value: BACK, label: "\u2190 Back" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "add") {
        const name = await textInput({ message: "Product name", required: true });
        const description = await textInput({ message: "Description (optional)" });
        const product = await withSpinner("Creating product", () =>
          productService.createProduct({ name, description: description || undefined })
        );
        heading("Product Created");
        label("ID", product.id);
        label("Name", product.name);
      }

      if (action === "list") {
        const items = await withSpinner("Loading products", () =>
          productService.listProducts({})
        );
        if (items.length === 0) { noResults("products"); continue; }

        heading("Products");
        const table = createTable(["ID", "Name", "Description"]);
        for (const p of items) table.push([p.id, p.name, p.description ?? "\u2014"]);
        console.log(table.toString());
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

async function serviceMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Services",
      options: [
        { value: "add", label: "Add service" },
        { value: "list", label: "List services" },
        { value: BACK, label: "\u2190 Back" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "add") {
        const name = await textInput({ message: "Service name", required: true });
        const description = await textInput({ message: "Description (optional)" });
        const svc = await withSpinner("Creating service", () =>
          svcService.createService({ name, description: description || undefined })
        );
        heading("Service Created");
        label("ID", svc.id);
        label("Name", svc.name);
      }

      if (action === "list") {
        const items = await withSpinner("Loading services", () =>
          svcService.listServices({})
        );
        if (items.length === 0) { noResults("services"); continue; }

        heading("Services");
        const table = createTable(["ID", "Name", "Description"]);
        for (const s of items) table.push([s.id, s.name, s.description ?? "\u2014"]);
        console.log(table.toString());
      }
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

async function catalogMenu(): Promise<void> {
  while (true) {
    const action = await selectInput({
      message: "Business Catalog",
      options: [
        { value: "industries", label: "Industries" },
        { value: "niches", label: "Niches" },
        { value: "products", label: "Products" },
        { value: "services", label: "Services" },
        { value: BACK, label: "\u2190 Back to main menu" },
      ],
    });

    if (action === BACK) return;

    try {
      if (action === "industries") await industryMenu();
      if (action === "niches") await nicheMenu();
      if (action === "products") await productMenu();
      if (action === "services") await serviceMenu();
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}

// ── Main Menu ──────────────────────────────────────────

export async function startMenu(): Promise<void> {
  console.log(chalk.cyan.bold("\n  Bot Admin \u2014 Interactive Mode\n"));

  while (true) {
    let action: string;
    try {
      action = await selectInput({
        message: "Main Menu",
        options: [
          { value: "companies", label: "Companies" },
          { value: "projects", label: "Projects" },
          { value: "tools", label: "Tools" },
          { value: "catalog", label: "Business Catalog" },
          { value: "impl", label: "Implementation Details" },
          { value: "progress", label: "Progress" },
          { value: "blueprints", label: "Blueprints" },
          { value: "exit", label: "Exit" },
        ],
      });
    } catch (err) {
      if (err instanceof CancelError) {
        action = "exit";
      } else {
        throw err;
      }
    }

    if (action === "exit") {
      await closeDb();
      console.log(chalk.gray("\n  Goodbye!\n"));
      return;
    }

    try {
      if (action === "companies") await companyMenu();
      if (action === "projects") await projectMenu();
      if (action === "tools") await toolMenu();
      if (action === "catalog") await catalogMenu();
      if (action === "impl") await implMenu();
      if (action === "progress") await progressMenu();
      if (action === "blueprints") await blueprintMenu();
    } catch (err) {
      if (err instanceof CancelError) continue;
      throw err;
    }
  }
}
