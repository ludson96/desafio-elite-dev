import { z } from "zod";

export const createReservationSchema = z.object({
  eventId: z.uuid("ID do evento inválido"),
  quantity: z.coerce.number().int().min(1, "A quantidade deve ser de no mínimo 1 ingresso").max(10, "Máximo de 10 ingressos por compra"),
  paymentStatus: z.enum(["APPROVED", "REFUSED"]).default("APPROVED"),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
