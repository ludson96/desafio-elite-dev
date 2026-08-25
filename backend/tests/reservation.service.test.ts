import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReservationService } from "../src/services/reservation.service.js";
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
      cancelReservationWithStockRefund: vi.fn(),
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
          quantity: 5, 
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

    expect(result.reservation.status).toBe("CONFIRMED");
    expect(result.paymentOutcome.status).toBe("APPROVED");
    expect(mockReservationRepo.createReservationTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        totalAmount: 300,
        reservationStatus: "CONFIRMED",
        paymentStatus: "APPROVED",
      })
    );
  });

  describe("cancelReservation", () => {
    it("deve cancelar uma reserva confirmada e devolver ingressos ao estoque", async () => {
      vi.mocked(mockReservationRepo.findById).mockResolvedValue({
        id: "res-1",
        clientId: "client-1",
        eventId: "ev-1",
        quantity: 2,
        status: "CONFIRMED",
        tickets: [
          { id: "t-1", status: "ACTIVE" },
          { id: "t-2", status: "ACTIVE" },
        ],
      } as any);

      vi.mocked(mockReservationRepo.cancelReservationWithStockRefund).mockResolvedValue({
        id: "res-1",
        status: "CANCELED",
      } as any);

      const result = await reservationService.cancelReservation("res-1", "client-1");

      expect(result.message).toContain("Reserva cancelada");
      expect(mockReservationRepo.cancelReservationWithStockRefund).toHaveBeenCalledWith(
        "res-1",
        "ev-1",
        2
      );
    });

    it("deve impedir o cancelamento se algum ingresso já foi utilizado na portaria", async () => {
      vi.mocked(mockReservationRepo.findById).mockResolvedValue({
        id: "res-1",
        clientId: "client-1",
        eventId: "ev-1",
        quantity: 2,
        status: "CONFIRMED",
        tickets: [
          { id: "t-1", status: "USED" },
          { id: "t-2", status: "ACTIVE" },
        ],
      } as any);

      await expect(
        reservationService.cancelReservation("res-1", "client-1")
      ).rejects.toThrow("um ou mais ingressos já foram utilizados na portaria");

      expect(mockReservationRepo.cancelReservationWithStockRefund).not.toHaveBeenCalled();
    });

    it("deve impedir o cancelamento de uma reserva que pertence a outro usuário", async () => {
      vi.mocked(mockReservationRepo.findById).mockResolvedValue({
        id: "res-1",
        clientId: "outro-cliente",
        eventId: "ev-1",
        quantity: 2,
        status: "CONFIRMED",
        tickets: [{ id: "t-1", status: "ACTIVE" }],
      } as any);

      await expect(
        reservationService.cancelReservation("res-1", "client-1")
      ).rejects.toThrow("Você não tem permissão para cancelar esta reserva");
    });
  });
});
