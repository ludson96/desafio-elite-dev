import { eventRepository, type EventRepository } from "../repositories/event.repository.js";
import { AppError } from "../utils/AppError.js";
import type { CreateEventInput, UpdateEventInput, ListEventsQuery } from "../schemas/event.schema.js";

export class EventService {
  constructor(private eventRepositoryInstance: EventRepository = eventRepository) {}

  async listEvents(query: ListEventsQuery) {
    return this.eventRepositoryInstance.findMany(query);
  }

  async getEventById(id: string) {
    const event = await this.eventRepositoryInstance.findById(id);

    if (!event) {
      throw new AppError("Evento não encontrado", 404);
    }

    return event;
  }

  async getOrganizerEvents(organizerId: string) {
    return this.eventRepositoryInstance.findByOrganizerId(organizerId);
  }

  async createEvent(data: CreateEventInput, organizerId: string) {
    // Validação de data: o evento não pode ser criado para uma data no passado
    if (new Date(data.date) <= new Date()) {
      throw new AppError("A data do evento deve ser no futuro", 400);
    }

    return this.eventRepositoryInstance.create({
      ...data,
      organizerId,
    });
  }

  async updateEvent(id: string, data: UpdateEventInput, organizerId: string) {
    const event = await this.eventRepositoryInstance.findById(id);

    if (!event) {
      throw new AppError("Evento não encontrado", 404);
    }

    // Apenas o organizador dono do evento pode editá-lo
    if (event.organizerId !== organizerId) {
      throw new AppError("Você não tem permissão para alterar este evento", 403);
    }

    if (data.date && new Date(data.date) <= new Date()) {
      throw new AppError("A nova data do evento deve ser no futuro", 400);
    }

    return this.eventRepositoryInstance.update(id, data);
  }
}

export const eventService = new EventService();
