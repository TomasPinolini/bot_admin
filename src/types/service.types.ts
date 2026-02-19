import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
});
export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const listServicesSchema = z.object({
  search: z.string().optional(),
});
export type ListServicesFilter = z.infer<typeof listServicesSchema>;
