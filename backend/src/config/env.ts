import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("password123"),
  POSTGRES_DB: z.string().default("desafio_elite_dev"),
  POSTGRES_PORT: z.coerce.number().default(5432),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default("super-secret-desafio-elite-dev-jwt-key"),
  QR_SECRET: z.string().default("super-secret-hmac-qr-signing-key"),
  TMDB_API_KEY: z.string().optional().default(""),
  TICKETMASTER_API_KEY: z.string().optional().default(""),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Variáveis de ambiente inválidas:", _env.error.issues);
  throw new Error("Variáveis de ambiente inválidas");
}

export const env = _env.data;
