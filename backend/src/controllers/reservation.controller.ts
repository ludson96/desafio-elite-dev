import type { Request, Response, NextFunction } from "express";
import {
  reservationService,
  type ReservationService,
} from "../services/reservation.service.js";
import { AppError } from "../utils/AppError.js";

export class ReservationController {
  constructor(
    private reservationServiceInstance: ReservationService = reservationService
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const result = await this.reservationServiceInstance.createReservation(
        req.body,
        req.user.id
      );

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const reservations = await this.reservationServiceInstance.getMyReservations(req.user.id);

      res.status(200).json({
        status: "success",
        results: reservations.length,
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const { id } = req.params;

      if (!id || typeof id !== "string") {
        throw new AppError("ID da reserva é obrigatório", 400);
      }

      const reservation = await this.reservationServiceInstance.getReservationById(id, req.user.id);

      res.status(200).json({
        status: "success",
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const { id } = req.params;

      if (!id || typeof id !== "string") {
        throw new AppError("ID da reserva é obrigatório", 400);
      }

      const result = await this.reservationServiceInstance.cancelReservation(id, req.user.id);

      res.status(200).json({
        status: "success",
        message: result.message,
        data: result.reservation,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const reservationController = new ReservationController();
