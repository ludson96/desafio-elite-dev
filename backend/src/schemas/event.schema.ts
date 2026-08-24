import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  type: z.enum(["SHOW", "MOVIE"]),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  date: z.coerce.date({
    message: "Data inválida",
  }),
  location: z.string().min(2, "O local deve ter pelo menos 2 caracteres"),
  capacity: z.coerce.number().int().min(1, "A capacidade deve ser de pelo menos 1 ingresso"),
  price: z.coerce.number().min(0, "O preço não pode ser negativo"),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELED"]).optional().default("PUBLISHED"),
  externalEventId: z.string().optional(),
  externalSource: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELED"]).optional(),
});

export const listEventsQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(["SHOW", "MOVIE"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELED"]).optional().default("PUBLISHED"),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
