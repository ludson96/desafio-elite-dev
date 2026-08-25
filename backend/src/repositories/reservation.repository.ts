import { prisma } from "../config/prisma.js";
import type { Reservation, ReservationStatus, PaymentStatus } from "../generated/prisma/client.js";

export interface CreateReservationTransactionInput {
  clientId: string;
  eventId: string;
  quantity: number;
  totalAmount: number;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  ticketsData: {
    code: string;
    shareToken: string;
    qrSignature: string;
  }[];
}

export class ReservationRepository {
  async findById(id: string): Promise<Reservation | null> {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        event: true,
        payment: true,
        tickets: true,
      },
    });
  }

  async findByClientId(clientId: string) {
    return prisma.reservation.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: {
        event: true,
        payment: true,
        tickets: true,
      },
    });
  }

  // Executa a reserva e emissão de ingressos dentro de uma transação atômica garantindo que os ingressos disponíveis do evento sejam decrementados sem concorrência.
  async createReservationTransaction(data: CreateReservationTransactionInput) {
    return prisma.$transaction(async (tx) => {
      // Se o pagamento foi aprovado, decrementa o estoque atômico do evento
      if (data.paymentStatus === "APPROVED") {
        const updateResult = await tx.event.updateMany({
          where: {
            id: data.eventId,
            availableTickets: {
              gte: data.quantity, // Garante atomicamente que ainda há estoque suficiente
            },
          },
          data: {
            availableTickets: {
              decrement: data.quantity,
            },
          },
        });

        // Se nenhuma linha foi afetada, significa que os ingressos esgotaram no momento da compra
        if (updateResult.count === 0) {
          throw new Error("INGRESSOS_ESGOTADOS");
        }
      }

      // Cria o registro de Reserva com o Pagamento e Ingressos associados
      const reservation = await tx.reservation.create({
        data: {
          clientId: data.clientId,
          eventId: data.eventId,
          quantity: data.quantity,
          totalAmount: data.totalAmount,
          status: data.reservationStatus,
          payment: {
            create: {
              amount: data.totalAmount,
              status: data.paymentStatus,
            },
          },
          ...(data.paymentStatus === "APPROVED" && data.ticketsData.length > 0
            ? {
                tickets: {
                  create: data.ticketsData.map((t) => ({
                    code: t.code,
                    shareToken: t.shareToken,
                    qrSignature: t.qrSignature,
                    status: "ACTIVE",
                    eventId: data.eventId,
                  })),
                },
              }
            : {}),
        },
        include: {
          event: true,
          payment: true,
          tickets: true,
        },
      });

      return reservation;
    });
  }

  // Cancela a reserva e seus ingressos e devolve a quantidade ao estoque disponível do evento atomicamente.
  async cancelReservationWithStockRefund(reservationId: string, eventId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      // Atualiza o status da reserva para CANCELED
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: "CANCELED" },
        include: {
          event: true,
          payment: true,
          tickets: true,
        },
      });

      // Cancela todos os ingressos associados à reserva
      await tx.ticket.updateMany({
        where: { reservationId },
        data: { status: "CANCELED" },
      });

      // Devolve a quantidade de ingressos ao estoque do evento atomicamente
      await tx.event.update({
        where: { id: eventId },
        data: {
          availableTickets: {
            increment: quantity,
          },
        },
      });

      return updatedReservation;
    });
  }
}

export const reservationRepository = new ReservationRepository();
