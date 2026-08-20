import {
  ticketRepository,
  type TicketRepository,
} from "../repositories/ticket.repository.js";
import { generateQRCodeDataURL, verifyTicketSignature } from "../utils/qrSecurity.js";
import { AppError } from "../utils/AppError.js";
import type { ValidateTicketInput } from "../schemas/ticket.schema.js";

export interface TicketValidationResult {
  status: "VALID" | "ALREADY_USED" | "INVALID" | "WRONG_EVENT";
  message: string;
  ticket?: {
    code: string;
    status: string;
    usedAt?: Date | null;
    event: {
      id: string;
      title: string;
      date: Date;
      location: string;
    };
    client?: {
      name: string;
      email: string;
    };
  };
}

export class TicketService {
  constructor(private ticketRepositoryInstance: TicketRepository = ticketRepository) {}

  async getMyTickets(clientId: string) {
    const tickets = await this.ticketRepositoryInstance.findByClientId(clientId);

    // Adiciona o QR Code em Base64 Data URL para cada ingresso
    const ticketsWithQR = await Promise.all(
      tickets.map(async (ticket) => {
        // O payload do QR Code carrega o JSON com código, eventId e a assinatura HMAC
        const qrPayload = JSON.stringify({
          code: ticket.code,
          eventId: ticket.eventId,
          sig: ticket.qrSignature,
        });

        const qrCodeUrl = await generateQRCodeDataURL(qrPayload);

        return {
          ...ticket,
          qrCodeUrl,
        };
      })
    );

    return ticketsWithQR;
  }

  async getSharedTicket(shareToken: string) {
    const ticket = await this.ticketRepositoryInstance.findByShareToken(shareToken);

    if (!ticket) {
      throw new AppError("Ingresso compartilhado não encontrado", 404);
    }

    const qrPayload = JSON.stringify({
      code: ticket.code,
      eventId: ticket.eventId,
      sig: ticket.qrSignature,
    });

    const qrCodeUrl = await generateQRCodeDataURL(qrPayload);

    return {
      ...ticket,
      qrCodeUrl,
    };
  }

  async validateTicket(input: ValidateTicketInput): Promise<TicketValidationResult> {
    const { code, eventId, signature } = input;

    const ticket = (await this.ticketRepositoryInstance.findByCode(code)) as any;

    if (!ticket) {
      return {
        status: "INVALID",
        message: "Ingresso não encontrado ou código inválido.",
      };
    }

    if (ticket.eventId !== eventId) {
      return {
        status: "WRONG_EVENT",
        message: `Ingresso pertence a outro evento: "${ticket.event?.title}".`,
        ticket: {
          code: ticket.code,
          status: ticket.status,
          event: ticket.event,
          client: ticket.reservation?.client,
        },
      };
    }

    // Validação anti-fraude da assinatura se fornecida via QR
    if (signature && ticket.qrSignature) {
      const isValidSig = verifyTicketSignature(code, eventId, signature);
      if (!isValidSig) {
        return {
          status: "INVALID",
          message: "Assinatura do QR Code inválida ou adulterada.",
        };
      }
    }

    if (ticket.status === "USED") {
      return {
        status: "ALREADY_USED",
        message: `Ingresso já foi utilizado anteriormente em ${ticket.usedAt ? new Date(ticket.usedAt).toLocaleString("pt-BR") : "data anterior"}.`,
        ticket: {
          code: ticket.code,
          status: ticket.status,
          usedAt: ticket.usedAt,
          event: ticket.event,
          client: ticket.reservation?.client,
        },
      };
    }

    if (ticket.status === "CANCELED") {
      return {
        status: "INVALID",
        message: "Este ingresso foi cancelado.",
      };
    }

    // Atualização atômica para USED
    const updateResult = await this.ticketRepositoryInstance.markAsUsed(ticket.id);

    if (updateResult.count === 0) {
      // Concorrência: se duas catracas tentarem validar o mesmo ingresso ao mesmo tempo
      return {
        status: "ALREADY_USED",
        message: "Ingresso já utilizado no momento da validação.",
      };
    }

    return {
      status: "VALID",
      message: "Ingresso validado com sucesso! Entrada autorizada.",
      ticket: {
        code: ticket.code,
        status: "USED",
        usedAt: new Date(),
        event: ticket.event,
        client: ticket.reservation?.client,
      },
    };
  }
}

export const ticketService = new TicketService();
