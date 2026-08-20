import { prisma } from "../config/prisma.js";
import type { Event, EventStatus, EventType, Prisma } from "../generated/prisma/client.js";
import type { CreateEventInput, UpdateEventInput, ListEventsQuery } from "../schemas/event.schema.js";

export class EventRepository {
  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findMany(query: ListEventsQuery) {
    const { search, type, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};

    if (status) {
      where.status = status as EventStatus;
    }

    if (type) {
      where.type = type as EventType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "asc" },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByOrganizerId(organizerId: string) {
    return prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateEventInput & { organizerId: string }): Promise<Event> {
    return prisma.event.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        category: data.category ?? null,
        imageUrl: data.imageUrl ?? null,
        date: data.date,
        location: data.location,
        capacity: data.capacity,
        availableTickets: data.capacity, // Na criação, ingressos disponíveis = capacidade total
        price: data.price,
        status: "PUBLISHED", // Ao publicar o evento criado
        organizerId: data.organizerId,
        externalEventId: data.externalEventId ?? null,
        externalSource: data.externalSource ?? null,
      },
    });
  }

  async update(id: string, data: UpdateEventInput): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description ?? null } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.category !== undefined ? { category: data.category ?? null } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl ?? null } : {}),
        ...(data.date ? { date: data.date } : {}),
        ...(data.location ? { location: data.location } : {}),
        ...(data.capacity ? { capacity: data.capacity } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.externalEventId !== undefined ? { externalEventId: data.externalEventId ?? null } : {}),
        ...(data.externalSource !== undefined ? { externalSource: data.externalSource ?? null } : {}),
      },
    });
  }
}

export const eventRepository = new EventRepository();
