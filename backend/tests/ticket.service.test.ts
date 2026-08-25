import { describe, it, expect, vi, beforeEach } from "vitest";
import { TicketService } from "../src/services/ticket.service.js";
import type { TicketRepository } from "../src/repositories/ticket.repository.js";
import { generateTicketSignature } from "../src/utils/qrSecurity.js";

describe("TicketService - Validação de Portaria (Unit Tests)", () => {
  let ticketService: TicketService;
  let mockTicketRepo: TicketRepository;

  beforeEach(() => {
    mockTicketRepo = {
      findByCode: vi.fn(),
      findByShareToken: vi.fn(),
      findByClientId: vi.fn(),
      markAsUsed: vi.fn(),
      updateStatus: vi.fn(),
    } as unknown as TicketRepository;

    ticketService = new TicketService(mockTicketRepo);
  });

  it("deve retornar VALID quando o ingresso for válido e marcar como USED", async () => {
    const eventId = "ev-123";
    const code = "TKT-SHOW-ABC-1";
    const sig = generateTicketSignature(code, eventId);

    vi.mocked(mockTicketRepo.findByCode).mockResolvedValue({
      id: "t-1",
      code,
      eventId,
      status: "ACTIVE",
      qrSignature: sig,
      event: { id: eventId, title: "Show Rock" },
      reservation: { client: { name: "Ana", email: "ana@verzel.com" } },
    } as any);

    vi.mocked(mockTicketRepo.markAsUsed).mockResolvedValue({ count: 1 });

    const result = await ticketService.validateTicket({
      code,
      eventId,
      signature: sig,
    });

    expect(result.status).toBe("VALID");
    expect(result.message).toContain("Ingresso validado com sucesso");
    expect(mockTicketRepo.markAsUsed).toHaveBeenCalledWith("t-1");
  });

  it("deve retornar ALREADY_USED se o ingresso já tiver sido usado", async () => {
    const eventId = "ev-123";
    const code = "TKT-SHOW-ABC-1";
    const usedDate = new Date("2026-08-20T20:00:00Z");

    vi.mocked(mockTicketRepo.findByCode).mockResolvedValue({
      id: "t-1",
      code,
      eventId,
      status: "USED",
      usedAt: usedDate,
      event: { id: eventId, title: "Show Rock" },
    } as any);

    const result = await ticketService.validateTicket({
      code,
      eventId,
    });

    expect(result.status).toBe("ALREADY_USED");
    expect(result.message).toContain("Ingresso já foi utilizado anteriormente");
  });

  it("deve retornar WRONG_EVENT se o ingresso for de outro evento", async () => {
    vi.mocked(mockTicketRepo.findByCode).mockResolvedValue({
      id: "t-1",
      code: "TKT-SHOW-ABC-1",
      eventId: "ev-outro-evento",
      status: "ACTIVE",
      event: { id: "ev-outro-evento", title: "Outro Evento Diferente" },
    } as any);

    const result = await ticketService.validateTicket({
      code: "TKT-SHOW-ABC-1",
      eventId: "ev-portaria-atual",
    });

    expect(result.status).toBe("WRONG_EVENT");
    expect(result.message).toContain("Ingresso pertence a outro evento");
  });

  it("deve retornar INVALID se o código não for encontrado", async () => {
    vi.mocked(mockTicketRepo.findByCode).mockResolvedValue(null);

    const result = await ticketService.validateTicket({
      code: "CODIGO-INEXISTENTE",
      eventId: "ev-123",
    });

    expect(result.status).toBe("INVALID");
    expect(result.message).toContain("Ingresso não encontrado ou código inválido");
  });

  describe("Segurança & Contrato: getSharedTicket", () => {
    it("deve retornar apenas preview informativo e NUNCA expor code, qrSignature nem qrCodeUrl", async () => {
      vi.mocked(mockTicketRepo.findByShareToken).mockResolvedValue({
        id: "t-1",
        code: "TKT-SECRETO-123",
        qrSignature: "sig_super_secreta_hmac_123",
        shareToken: "token-publico-uuid",
        status: "ACTIVE",
        eventId: "ev-1",
        event: {
          id: "ev-1",
          title: "Coldplay Tour",
          description: "Show ao vivo",
          type: "SHOW",
          category: "Música",
          imageUrl: "https://images.unsplash.com/photo-1",
          date: new Date("2026-11-20T20:00:00Z"),
          location: "Allianz Parque",
        },
        reservation: {
          client: {
            name: "Ana Carolina",
          },
        },
      } as any);

      const result: any = await ticketService.getSharedTicket("token-publico-uuid");

      // 1. Deve conter dados informativos de apresentação
      expect(result.id).toBe("t-1");
      expect(result.shareToken).toBe("token-publico-uuid");
      expect(result.status).toBe("ACTIVE");
      expect(result.holderName).toBe("Ana");
      expect(result.event.title).toBe("Coldplay Tour");

      // 2. CONTRATO DE SEGURANÇA: Material criptográfico e código NÃO podem existir
      expect(result.code).toBeUndefined();
      expect(result.qrSignature).toBeUndefined();
      expect(result.qrCodeUrl).toBeUndefined();
      expect(result).not.toHaveProperty("code");
      expect(result).not.toHaveProperty("qrSignature");
      expect(result).not.toHaveProperty("qrCodeUrl");
    });
  });
});
