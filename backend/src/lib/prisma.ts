import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const user = process.env["POSTGRES_USER"] || "postgres";
const pass = process.env["POSTGRES_PASSWORD"] || "password123";
const host = "localhost";
const port = process.env["POSTGRES_PORT"] || "5432";
const db = process.env["POSTGRES_DB"] || "desafio_elite_dev";

const connectionString =
  process.env["DATABASE_URL"] && !process.env["DATABASE_URL"].includes("${")
    ? process.env["DATABASE_URL"]
    : `postgresql://${user}:${pass}@${host}:${port}/${db}?schema=public`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
