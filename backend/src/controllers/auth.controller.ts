import type { Request, Response, NextFunction } from "express";
import { authService, type AuthService } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

export class AuthController {
  constructor(private authServiceInstance: AuthService = authService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authServiceInstance.register(req.body);
      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authServiceInstance.login(req.body);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const result = await this.authServiceInstance.getProfile(req.user.id);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
