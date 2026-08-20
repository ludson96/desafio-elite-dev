import { describe, it, expect } from "vitest";
import { generateTicketSignature, verifyTicketSignature } from "../src/utils/qrSecurity.js";
import { generateToken, verifyToken } from "../src/utils/jwt.js";

describe("Segurança & Criptografia (Unit Tests)", () => {
  it("deve gerar e validar a assinatura HMAC de um ingresso com sucesso", () => {
    const ticketCode = "TKT-SHOW-ABC123";
    const eventId = "e1234567-89ab-cdef-0123-456789abcdef";

    const signature = generateTicketSignature(ticketCode, eventId);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe("string");
    expect(signature.length).toBeGreaterThan(0);

    const isValid = verifyTicketSignature(ticketCode, eventId, signature);
    expect(isValid).toBe(true);
  });

  it("deve rejeitar uma assinatura HMAC forjada ou adulterada", () => {
    const ticketCode = "TKT-SHOW-ABC123";
    const eventId = "e1234567-89ab-cdef-0123-456789abcdef";
    const fakeSignature = "invalid-fake-signature-hmac-1234567890123456789012345678901234567890123456789012345678901234";

    const isValid = verifyTicketSignature(ticketCode, eventId, fakeSignature);
    expect(isValid).toBe(false);
  });

  it("deve gerar e decodificar um JWT com os papéis de usuário (Role)", () => {
    const payload = {
      id: "user-123",
      email: "cliente1@verzel.com",
      role: "CLIENT" as const,
    };

    const token = generateToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });
});
