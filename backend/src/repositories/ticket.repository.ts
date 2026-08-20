import { prisma } from "../config/prisma.js";
import type { Ticket, TicketStatus } from "../generated/prisma/client.js";

export class TicketRepository {
  async findByCode(code: string): Promise<Ticket | null> {
    return prisma.ticket.findUnique({
      where: { code },
      include: {
        event: true,
        reservation: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findByShareToken(shareToken: string): Promise<Ticket | null> {
    return prisma.ticket.findUnique({
      where: { shareToken },
      include: {
        event: true,
        reservation: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findByClientId(clientId: string): Promise<Ticket[]> {
    return prisma.ticket.findMany({
      where: {
        reservation: {
          clientId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        event: true,
      },
    });
  }

  // Atualização atômica do status do ingresso para USED na portaria, garantindo que o ingresso só seja validado com sucesso se o status atual ainda for ACTIVE.
  async markAsUsed(id: string): Promise<{ count: number }> {
    return prisma.ticket.updateMany({
      where: {
        id,
        status: "ACTIVE",
      },
      data: {
        status: "USED",
        usedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data: { status },
    });
  }
}

export const ticketRepository = new TicketRepository();
