import crypto from "node:crypto";
import {
  reservationRepository,
  type ReservationRepository,
} from "../repositories/reservation.repository.js";
import { eventRepository, type EventRepository } from "../repositories/event.repository.js";
import { generateTicketSignature } from "../utils/qrSecurity.js";
import { AppError } from "../utils/AppError.js";
import type { CreateReservationInput } from "../schemas/reservation.schema.js";

export class ReservationService {
  constructor(
    private reservationRepositoryInstance: ReservationRepository = reservationRepository,
    private eventRepositoryInstance: EventRepository = eventRepository
  ) {}

  async createReservation(data: CreateReservationInput, clientId: string) {
    const { eventId, quantity, paymentStatus } = data;

    const event = await this.eventRepositoryInstance.findById(eventId);

    if (!event) {
      throw new AppError("Evento não encontrado", 404);
    }

    if (event.status !== "PUBLISHED") {
      throw new AppError("Este evento não está disponível para compra de ingressos", 400);
    }

    if (event.availableTickets < quantity) {
      throw new AppError(
        `Quantidade indisponível. Apenas ${event.availableTickets} ingressos disponíveis`,
        400
      );
    }

    const priceNumber = Number(event.price);
    const totalAmount = priceNumber * quantity;

    // Define o status da reserva baseado no pagamento simulado
    const isApproved = paymentStatus === "APPROVED";
    const reservationStatus = isApproved ? "CONFIRMED" : "REFUSED";

    // Se aprovado, prepara os dados de cada ingresso único com código, shareToken e assinatura HMAC
    const ticketsData = isApproved
      ? Array.from({ length: quantity }, (_, index) => {
          const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
          const ticketCode = `TKT-${event.type}-${randomHex}-${Date.now().toString().slice(-4)}-${index + 1}`;
          const shareToken = crypto.randomUUID();
          const qrSignature = generateTicketSignature(ticketCode, event.id);

          return {
            code: ticketCode,
            shareToken,
            qrSignature,
          };
        })
      : [];

    try {
      const reservation = await this.reservationRepositoryInstance.createReservationTransaction({
        clientId,
        eventId,
        quantity,
        totalAmount,
        reservationStatus,
        paymentStatus,
        ticketsData,
      });

      return {
        reservation,
        paymentOutcome: isApproved
          ? { status: "APPROVED", message: "Pagamento aprovado com sucesso! Ingressos emitidos." }
          : { status: "REFUSED", message: "Pagamento recusado pela operadora. Ingressos não foram emitidos." },
      };
    } catch (error: any) {
      if (error.message === "INGRESSOS_ESGOTADOS") {
        throw new AppError("Desculpe, os ingressos esgotaram durante o processo de compra", 409);
      }
      throw error;
    }
  }

  async getMyReservations(clientId: string) {
    return this.reservationRepositoryInstance.findByClientId(clientId);
  }

  async getReservationById(id: string, clientId: string) {
    const reservation = await this.reservationRepositoryInstance.findById(id);

    if (!reservation) {
      throw new AppError("Reserva não encontrada", 404);
    }

    if (reservation.clientId !== clientId) {
      throw new AppError("Você não tem permissão para visualizar esta reserva", 403);
    }

    return reservation;
  }
}

export const reservationService = new ReservationService();
