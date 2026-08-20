import type { Request, Response, NextFunction } from "express";
import { ticketService, type TicketService } from "../services/ticket.service.js";
import { AppError } from "../utils/AppError.js";

export class TicketController {
  constructor(private ticketServiceInstance: TicketService = ticketService) {}

  getMyTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const tickets = await this.ticketServiceInstance.getMyTickets(req.user.id);

      res.status(200).json({
        status: "success",
        results: tickets.length,
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  };

  getSharedTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shareToken } = req.params;

      if (!shareToken || typeof shareToken !== "string") {
        throw new AppError("Token de compartilhamento é obrigatório", 400);
      }

      const ticket = await this.ticketServiceInstance.getSharedTicket(shareToken);

      res.status(200).json({
        status: "success",
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  };

  validate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.ticketServiceInstance.validateTicket(req.body);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const ticketController = new TicketController();
