import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const listProductsSchema = z.object({
  search: z.string().optional(),
});
export type ListProductsFilter = z.infer<typeof listProductsSchema>;
