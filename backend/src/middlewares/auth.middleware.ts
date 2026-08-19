import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken, type TokenPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new AppError("Token de autenticação não fornecido", 401));
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (!scheme || scheme !== "Bearer" || !token) {
    next(new AppError("Formato de token inválido. Use: Bearer <token>", 401));
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError("Token inválido ou expirado", 401));
  }
}
