import { z } from "zod";

export const validateTicketSchema = z.object({
  code: z.string().min(1, "O código do ingresso é obrigatório"),
  eventId: z.uuid("ID do evento inválido"),
  signature: z.string().optional(),
});

export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;
