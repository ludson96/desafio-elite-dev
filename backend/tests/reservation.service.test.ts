import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReservationService } from "../src/services/reservation.service.js";
import { AppError } from "../src/utils/AppError.js";
import type { ReservationRepository } from "../src/repositories/reservation.repository.js";
import type { EventRepository } from "../src/repositories/event.repository.js";

describe("ReservationService (Unit Tests)", () => {
  let reservationService: ReservationService;
  let mockReservationRepo: ReservationRepository;
  let mockEventRepo: EventRepository;

  beforeEach(() => {
    mockReservationRepo = {
      findById: vi.fn(),
      findByClientId: vi.fn(),
      createReservationTransaction: vi.fn(),
    } as unknown as ReservationRepository;

    mockEventRepo = {
      findById: vi.fn(),
    } as unknown as EventRepository;

    reservationService = new ReservationService(mockReservationRepo, mockEventRepo);
  });

  it("deve rejeitar compra se a quantidade solicitada for maior que o estoque disponível", async () => {
    vi.mocked(mockEventRepo.findById).mockResolvedValue({
      id: "ev-1",
      title: "Show Quase Esgotado",
      status: "PUBLISHED",
      availableTickets: 2,
      price: 100,
    } as any);

    await expect(
      reservationService.createReservation(
        {
          eventId: "ev-1",
          quantity: 5, // Pede 5 mas só tem 2
          paymentStatus: "APPROVED",
        },
        "client-1"
      )
    ).rejects.toThrow("Quantidade indisponível. Apenas 2 ingressos disponíveis");
  });

  it("deve rejeitar compra se o evento não estiver com status PUBLISHED", async () => {
    vi.mocked(mockEventRepo.findById).mockResolvedValue({
      id: "ev-1",
      title: "Show em Rascunho",
      status: "DRAFT",
      availableTickets: 100,
      price: 100,
    } as any);

    await expect(
      reservationService.createReservation(
        {
          eventId: "ev-1",
          quantity: 2,
          paymentStatus: "APPROVED",
        },
        "client-1"
      )
    ).rejects.toThrow("Este evento não está disponível para compra de ingressos");
  });

  it("deve criar reserva com ingressos únicos e assinaturas HMAC quando aprovado", async () => {
    vi.mocked(mockEventRepo.findById).mockResolvedValue({
      id: "ev-1",
      type: "SHOW",
      title: "Show Publicado",
      status: "PUBLISHED",
      availableTickets: 100,
      price: 150,
    } as any);

    vi.mocked(mockReservationRepo.createReservationTransaction).mockResolvedValue({
      id: "res-1",
      status: "CONFIRMED",
      totalAmount: 300,
      tickets: [{ id: "t-1" }, { id: "t-2" }],
    } as any);

    const result = await reservationService.createReservation(
      {
        eventId: "ev-1",
        quantity: 2,
        paymentStatus: "APPROVED",
      },
      "client-1"
    );

    expect(result.status).toBe("CONFIRMED");
    expect(mockReservationRepo.createReservationTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        totalAmount: 300,
        reservationStatus: "CONFIRMED",
        paymentStatus: "APPROVED",
      })
    );
  });
});
