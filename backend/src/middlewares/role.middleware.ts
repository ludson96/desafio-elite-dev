import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export function ensureRole(allowedRoles: ("ORGANIZER" | "CLIENT" | "GATEKEEPER")[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Usuário não autenticado", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("Acesso negado para este perfil de usuário", 403));
      return;
    }

    next();
  };
}
