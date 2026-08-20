import { z } from "zod";

export const searchCatalogSchema = z.object({
  query: z.string().optional().default(""),
  type: z.enum(["ALL", "MOVIE", "SHOW"]).optional().default("ALL"),
  page: z.coerce.number().min(1).optional().default(1),
});

export type SearchCatalogQuery = z.infer<typeof searchCatalogSchema>;
