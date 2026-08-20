import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        Object.assign(req.query, parsedQuery);
      }
      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params);
        Object.assign(req.params, parsedParams);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        next(new AppError("Erro de validação nos dados fornecidos", 400, issues));
        return;
      }
      next(error);
    }
  };
}
