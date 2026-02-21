import { db } from "./db";
import { eq, isNull, sql, desc, count } from "drizzle-orm";
import * as s from "./schema";

// ── Tools ──────────────────────────────────────────────────

export async function getTools() {
  return db
    .select({
      id: s.tools.id,
      name: s.tools.name,
      category: s.tools.category,
      url: s.tools.url,
      description: s.tools.description,
      projectCount: count(s.projectTools.id),
    })
    .from(s.tools)
    .leftJoin(s.projectTools, eq(s.tools.id, s.projectTools.toolId))
    .where(isNull(s.tools.deletedAt))
    .groupBy(s.tools.id)
    .orderBy(s.tools.name);
}

// ── Blueprints ─────────────────────────────────────────────

export async function getBlueprints() {
  return db
    .select({
      id: s.blueprints.id,
      name: s.blueprints.name,
      description: s.blueprints.description,
      toolCount:
        sql<number>`(SELECT count(*)::int FROM blueprint_tools WHERE blueprint_tools.blueprint_id = "blueprints"."id")`,
      stepCount:
        sql<number>`(SELECT count(*)::int FROM blueprint_steps WHERE blueprint_steps.blueprint_id = "blueprints"."id")`,
    })
    .from(s.blueprints)
    .where(isNull(s.blueprints.deletedAt))
    .orderBy(s.blueprints.name);
}

// ── Companies ──────────────────────────────────────────────

export async function getCompanies() {
  return db
    .select({
      id: s.companies.id,
      name: s.companies.name,
      status: s.companies.status,
      createdAt: s.companies.createdAt,
      projectCount:
        sql<number>`(SELECT count(*)::int FROM projects WHERE projects.company_id = "companies"."id" AND projects.deleted_at IS NULL)`,
      industry:
        sql<string | null>`(SELECT i.name FROM company_industries ci JOIN industries i ON i.id = ci.industry_id WHERE ci.company_id = "companies"."id" LIMIT 1)`,
    })
    .from(s.companies)
    .where(isNull(s.companies.deletedAt))
    .orderBy(desc(s.companies.createdAt));
}

// ── Company Detail ─────────────────────────────────────────

export async function getCompany(id: string) {
  const [company] = await db
    .select()
    .from(s.companies)
    .where(eq(s.companies.id, id))
    .limit(1);

  if (!company) return null;

  const [projects, industries, products, services] = await Promise.all([
    db
      .select({
        id: s.projects.id,
        name: s.projects.name,
        status: s.projects.status,
        updatedAt: s.projects.updatedAt,
      })
      .from(s.projects)
      .where(eq(s.projects.companyId, id))
      .orderBy(desc(s.projects.updatedAt)),

    db
      .select({ name: s.industries.name })
      .from(s.companyIndustries)
      .innerJoin(
        s.industries,
        eq(s.companyIndustries.industryId, s.industries.id)
      )
      .where(eq(s.companyIndustries.companyId, id)),

    db
      .select({ name: s.products.name })
      .from(s.companyProducts)
      .innerJoin(s.products, eq(s.companyProducts.productId, s.products.id))
      .where(eq(s.companyProducts.companyId, id)),

    db
      .select({ name: s.services.name })
      .from(s.companyServices)
      .innerJoin(s.services, eq(s.companyServices.serviceId, s.services.id))
      .where(eq(s.companyServices.companyId, id)),
  ]);

  return {
    ...company,
    projects,
    industries: industries.map((i) => i.name),
    products: products.map((p) => p.name),
    services: services.map((sv) => sv.name),
  };
}

// ── Projects Kanban ────────────────────────────────────────

export async function getProjectsGrouped() {
  const rows = await db
    .select({
      id: s.projects.id,
      name: s.projects.name,
      status: s.projects.status,
      targetDate: s.projects.targetDate,
      companyName: s.companies.name,
    })
    .from(s.projects)
    .innerJoin(s.companies, eq(s.projects.companyId, s.companies.id))
    .where(isNull(s.projects.deletedAt))
    .orderBy(desc(s.projects.updatedAt));

  return {
    planning: rows.filter((r) => r.status === "planning"),
    in_progress: rows.filter((r) => r.status === "in_progress"),
    review: rows.filter((r) => r.status === "review"),
    completed: rows.filter((r) => r.status === "completed"),
  };
}

// ── Project Detail ─────────────────────────────────────────

export async function getProject(id: string) {
  const [project] = await db
    .select({
      id: s.projects.id,
      name: s.projects.name,
      description: s.projects.description,
      status: s.projects.status,
      startDate: s.projects.startDate,
      targetDate: s.projects.targetDate,
      completedDate: s.projects.completedDate,
      createdAt: s.projects.createdAt,
      companyId: s.projects.companyId,
      companyName: s.companies.name,
    })
    .from(s.projects)
    .innerJoin(s.companies, eq(s.projects.companyId, s.companies.id))
    .where(eq(s.projects.id, id))
    .limit(1);

  if (!project) return null;

  const [tools, logs] = await Promise.all([
    db
      .select({ name: s.tools.name })
      .from(s.projectTools)
      .innerJoin(s.tools, eq(s.projectTools.toolId, s.tools.id))
      .where(eq(s.projectTools.projectId, id)),

    db
      .select()
      .from(s.progressLogs)
      .where(eq(s.progressLogs.projectId, id))
      .orderBy(desc(s.progressLogs.loggedAt)),
  ]);

  return {
    ...project,
    tools: tools.map((t) => t.name),
    logs,
  };
}

// ── Dashboard ──────────────────────────────────────────────

export async function getDashboardData() {
  const [
    [{ count: companiesCount }],
    [{ count: projectsCount }],
    [{ count: toolsCount }],
    [{ count: blueprintsCount }],
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(s.companies)
      .where(isNull(s.companies.deletedAt)),
    db
      .select({ count: count() })
      .from(s.projects)
      .where(isNull(s.projects.deletedAt)),
    db
      .select({ count: count() })
      .from(s.tools)
      .where(isNull(s.tools.deletedAt)),
    db
      .select({ count: count() })
      .from(s.blueprints)
      .where(isNull(s.blueprints.deletedAt)),
  ]);

  const statusDistribution = await db
    .select({ status: s.projects.status, count: count() })
    .from(s.projects)
    .where(isNull(s.projects.deletedAt))
    .groupBy(s.projects.status);

  const recentLogs = await db
    .select({
      note: s.progressLogs.note,
      phase: s.progressLogs.phase,
      loggedAt: s.progressLogs.loggedAt,
      projectName: s.projects.name,
    })
    .from(s.progressLogs)
    .innerJoin(s.projects, eq(s.progressLogs.projectId, s.projects.id))
    .orderBy(desc(s.progressLogs.loggedAt))
    .limit(5);

  const recentCompanies = await db
    .select({ name: s.companies.name, createdAt: s.companies.createdAt })
    .from(s.companies)
    .where(isNull(s.companies.deletedAt))
    .orderBy(desc(s.companies.createdAt))
    .limit(3);

  const recentProjects = await db
    .select({ name: s.projects.name, createdAt: s.projects.createdAt })
    .from(s.projects)
    .where(isNull(s.projects.deletedAt))
    .orderBy(desc(s.projects.createdAt))
    .limit(3);

  return {
    counts: {
      companies: companiesCount,
      projects: projectsCount,
      tools: toolsCount,
      blueprints: blueprintsCount,
    },
    statusDistribution,
    recentLogs,
    recentCompanies,
    recentProjects,
  };
}

// ── Analytics ──────────────────────────────────────────────

export async function getAnalyticsData() {
  const projectsByIndustry = await db
    .select({
      industry: s.industries.name,
      count: count(s.projects.id),
    })
    .from(s.projects)
    .innerJoin(s.companies, eq(s.projects.companyId, s.companies.id))
    .innerJoin(
      s.companyIndustries,
      eq(s.companies.id, s.companyIndustries.companyId)
    )
    .innerJoin(
      s.industries,
      eq(s.companyIndustries.industryId, s.industries.id)
    )
    .where(isNull(s.projects.deletedAt))
    .groupBy(s.industries.name)
    .orderBy(desc(count(s.projects.id)));

  const completionRates = await db
    .select({
      industry: s.industries.name,
      total: count(s.projects.id),
      completed:
        sql<number>`count(case when ${s.projects.status} = 'completed' then 1 end)::int`,
    })
    .from(s.industries)
    .innerJoin(
      s.companyIndustries,
      eq(s.industries.id, s.companyIndustries.industryId)
    )
    .innerJoin(
      s.companies,
      eq(s.companyIndustries.companyId, s.companies.id)
    )
    .innerJoin(s.projects, eq(s.companies.id, s.projects.companyId))
    .where(isNull(s.projects.deletedAt))
    .groupBy(s.industries.name)
    .orderBy(desc(count(s.projects.id)));

  const toolUsage = await db
    .select({
      name: s.tools.name,
      count: count(s.projectTools.id),
    })
    .from(s.tools)
    .leftJoin(s.projectTools, eq(s.tools.id, s.projectTools.toolId))
    .where(isNull(s.tools.deletedAt))
    .groupBy(s.tools.id, s.tools.name)
    .orderBy(desc(count(s.projectTools.id)))
    .limit(10);

  const projectsByStatus = await db
    .select({
      status: s.projects.status,
      count: count(),
    })
    .from(s.projects)
    .where(isNull(s.projects.deletedAt))
    .groupBy(s.projects.status);

  return { projectsByIndustry, completionRates, toolUsage, projectsByStatus };
}

// ── Company Options (for dropdowns) ─────────────────────────

export async function getCompanyOptions() {
  const rows = await db
    .select({ id: s.companies.id, name: s.companies.name })
    .from(s.companies)
    .where(isNull(s.companies.deletedAt))
    .orderBy(s.companies.name);
  return rows.map((r) => ({ value: r.id, label: r.name }));
}

// ── Timeline ───────────────────────────────────────────────

export async function getTimelineProjects() {
  return db
    .select({
      id: s.projects.id,
      name: s.projects.name,
      status: s.projects.status,
      startDate: s.projects.startDate,
      targetDate: s.projects.targetDate,
      companyName: s.companies.name,
    })
    .from(s.projects)
    .innerJoin(s.companies, eq(s.projects.companyId, s.companies.id))
    .where(isNull(s.projects.deletedAt))
    .orderBy(s.projects.startDate);
}
