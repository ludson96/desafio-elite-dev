import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { Prisma } from "../generated/prisma/client.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("💥 Erro do Prisma:", err.code, err.message);
    res.status(400).json({
      status: "error",
      message: `Erro na operação do banco de dados: ${err.message}`,
    });
    return;
  }

  console.error("💥 Erro não tratado:", err);

  res.status(500).json({
    status: "error",
    message: err.message || "Erro interno do servidor.",
  });
}
