import { z } from "zod";
import { statusEnum } from "./common.js";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  niche: z.string().optional(),
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
  industry: z.string().optional(),
  status: statusEnum.optional(),
  search: z.string().optional(),
});
export type ListCompaniesFilter = z.infer<typeof listCompaniesSchema>;
