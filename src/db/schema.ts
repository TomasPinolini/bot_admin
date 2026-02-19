import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

// ── Companies ──────────────────────────────────────────────

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── Tools ──────────────────────────────────────────────────

export const tools = pgTable("tools", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category"),
  url: text("url"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── Projects ───────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"),
  startDate: text("start_date"),
  targetDate: text("target_date"),
  completedDate: text("completed_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── Project–Tool junction ──────────────────────────────────

export const projectTools = pgTable("project_tools", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  toolId: text("tool_id").notNull().references(() => tools.id),
  configJson: jsonb("config_json"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Implementation Details ─────────────────────────────────

export const implementationDetails = pgTable("implementation_details", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  type: text("type").notNull(), // prompt | config | api_ref | note
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadataJson: jsonb("metadata_json"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── Progress Logs ──────────────────────────────────────────

export const progressLogs = pgTable("progress_logs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  phase: text("phase").notNull(),
  status: text("status").notNull().default("in_progress"),
  note: text("note"),
  loggedBy: text("logged_by"),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Blueprints ─────────────────────────────────────────────

export const blueprints = pgTable("blueprints", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const blueprintSteps = pgTable("blueprint_steps", {
  id: text("id").primaryKey(),
  blueprintId: text("blueprint_id").notNull().references(() => blueprints.id),
  stepOrder: integer("step_order").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blueprintTools = pgTable("blueprint_tools", {
  id: text("id").primaryKey(),
  blueprintId: text("blueprint_id").notNull().references(() => blueprints.id),
  toolId: text("tool_id").notNull().references(() => tools.id),
  roleInBlueprint: text("role_in_blueprint"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Industries ─────────────────────────────────────────────

export const industries = pgTable("industries", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── Niches ─────────────────────────────────────────────────

export const niches = pgTable("niches", {
  id: text("id").primaryKey(),
  industryId: text("industry_id").notNull().references(() => industries.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => [
  unique().on(t.industryId, t.name),
]);

// ── Products ───────────────────────────────────────────────

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── Services ───────────────────────────────────────────────

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── Company Junctions ──────────────────────────────────────

export const companyIndustries = pgTable("company_industries", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  industryId: text("industry_id").notNull().references(() => industries.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const companyNiches = pgTable("company_niches", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  nicheId: text("niche_id").notNull().references(() => niches.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const companyProducts = pgTable("company_products", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  productId: text("product_id").notNull().references(() => products.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const companyServices = pgTable("company_services", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id),
  serviceId: text("service_id").notNull().references(() => services.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Blueprint Junctions ────────────────────────────────────

export const blueprintIndustries = pgTable("blueprint_industries", {
  id: text("id").primaryKey(),
  blueprintId: text("blueprint_id").notNull().references(() => blueprints.id),
  industryId: text("industry_id").notNull().references(() => industries.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blueprintNiches = pgTable("blueprint_niches", {
  id: text("id").primaryKey(),
  blueprintId: text("blueprint_id").notNull().references(() => blueprints.id),
  nicheId: text("niche_id").notNull().references(() => niches.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
