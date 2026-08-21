import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventService } from "../src/services/event.service.js";
import { AppError } from "../src/utils/AppError.js";
import type { EventRepository } from "../src/repositories/event.repository.js";

describe("EventService (Unit Tests)", () => {
  let eventService: EventService;
  let mockEventRepo: EventRepository;

  beforeEach(() => {
    mockEventRepo = {
      findById: vi.fn(),
      findMany: vi.fn(),
      findByOrganizerId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    } as unknown as EventRepository;

    eventService = new EventService(mockEventRepo);
  });

  it("deve rejeitar criação de evento com data no passado", async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Ontem

    await expect(
      eventService.createEvent(
        {
          title: "Show Antigo",
          description: "Desc",
          date: pastDate,
          location: "São Paulo",
          category: "Música",
          type: "SHOW",
          price: 150,
          capacity: 100,
        },
        "org-1"
      )
    ).rejects.toThrow("A data do evento deve ser no futuro");
  });

  it("deve rejeitar edição de evento pertencente a outro organizador", async () => {
    vi.mocked(mockEventRepo.findById).mockResolvedValue({
      id: "event-1",
      title: "Show de Outro",
      organizerId: "org-dono-real",
    } as any);

    await expect(
      eventService.updateEvent("event-1", { title: "Novo Título" }, "org-hacker-tentativa")
    ).rejects.toThrow("Você não tem permissão para alterar este evento");
  });

  it("deve repassar os dados de criação com o organizerId para o repositório", async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Daqui a 7 dias

    vi.mocked(mockEventRepo.create).mockResolvedValue({
      id: "ev-1",
      title: "Show Futuro",
      capacity: 500,
      availableTickets: 500,
      organizerId: "org-1",
    } as any);

    const result = await eventService.createEvent(
      {
        title: "Show Futuro",
        description: "Desc",
        date: futureDate,
        location: "Allianz Parque",
        category: "Show",
        type: "SHOW",
        price: 200,
        capacity: 500,
      },
      "org-1"
    );

    expect(result.capacity).toBe(500);
    expect(mockEventRepo.create).toHaveBeenCalledWith({
      title: "Show Futuro",
      description: "Desc",
      date: futureDate,
      location: "Allianz Parque",
      category: "Show",
      type: "SHOW",
      price: 200,
      capacity: 500,
      organizerId: "org-1",
    });
  });
});
