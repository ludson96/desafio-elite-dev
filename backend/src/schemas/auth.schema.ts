import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.email("Formato de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ORGANIZER", "CLIENT", "GATEKEEPER"]).default("CLIENT"),
});

export const loginSchema = z.object({
  email: z.email("Formato de e-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
