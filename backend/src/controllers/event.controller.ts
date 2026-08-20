import type { Request, Response, NextFunction } from "express";
import { eventService, type EventService } from "../services/event.service.js";
import { AppError } from "../utils/AppError.js";
import type { ListEventsQuery } from "../schemas/event.schema.js";

export class EventController {
  constructor(private eventServiceInstance: EventService = eventService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListEventsQuery;
      const result = await this.eventServiceInstance.listEvents(query);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        throw new AppError("ID do evento é obrigatório", 400);
      }

      const event = await this.eventServiceInstance.getEventById(id);

      res.status(200).json({
        status: "success",
        data: event,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const events = await this.eventServiceInstance.getOrganizerEvents(req.user.id);

      res.status(200).json({
        status: "success",
        results: events.length,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const event = await this.eventServiceInstance.createEvent(req.body, req.user.id);

      res.status(201).json({
        status: "success",
        data: event,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const { id } = req.params;

      if (!id || typeof id !== "string") {
        throw new AppError("ID do evento é obrigatório", 400);
      }

      const updatedEvent = await this.eventServiceInstance.updateEvent(id, req.body, req.user.id);

      res.status(200).json({
        status: "success",
        data: updatedEvent,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const eventController = new EventController();
