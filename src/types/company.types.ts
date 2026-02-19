import { z } from "zod";
import { statusEnum } from "./common.js";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial().extend({
  status: statusEnum.optional(),
});
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const listCompaniesSchema = z.object({
  status: statusEnum.optional(),
  search: z.string().optional(),
});
export type ListCompaniesFilter = z.infer<typeof listCompaniesSchema>;

export const assignIndustrySchema = z.object({
  companyId: z.string().min(1),
  industryId: z.string().min(1),
});
export type AssignIndustryInput = z.infer<typeof assignIndustrySchema>;

export const assignNicheSchema = z.object({
  companyId: z.string().min(1),
  nicheId: z.string().min(1),
});
export type AssignNicheInput = z.infer<typeof assignNicheSchema>;

export const assignProductSchema = z.object({
  companyId: z.string().min(1),
  productId: z.string().min(1),
  notes: z.string().optional(),
});
export type AssignProductInput = z.infer<typeof assignProductSchema>;

export const assignServiceSchema = z.object({
  companyId: z.string().min(1),
  serviceId: z.string().min(1),
  notes: z.string().optional(),
});
export type AssignServiceInput = z.infer<typeof assignServiceSchema>;
