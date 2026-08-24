import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRole,
  formatEventType,
  getStatusBadge,
} from "@/utils/formatters";

describe("Utils / Formatters", () => {
  describe("formatCurrency", () => {
    it("deve formatar número para moeda brasileira (BRL)", () => {
      const result = formatCurrency(150.5);
      expect(result).toContain("150,50");
      expect(result).toMatch(/R\$\s?150,50/);
    });

    it("deve formatar string numérica corretamente", () => {
      const result = formatCurrency("99.90");
      expect(result).toContain("99,90");
    });

    it("deve retornar R$ 0,00 para valores inválidos", () => {
      expect(formatCurrency("invalido")).toBe("R$ 0,00");
    });
  });

  describe("formatDate", () => {
    it("deve formatar data ISO para dd/mm/aaaa", () => {
      const isoDate = "2026-08-15T14:30:00.000Z";
      const result = formatDate(isoDate);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("deve retornar string vazia para entrada vazia", () => {
      expect(formatDate("")).toBe("");
    });
  });

  describe("formatDateTime", () => {
    it("deve formatar data e hora corretamente", () => {
      const isoDate = "2026-08-15T14:30:00.000Z";
      const result = formatDateTime(isoDate);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe("formatRole", () => {
    it("deve traduzir papéis de usuário", () => {
      expect(formatRole("ORGANIZER")).toBe("Organizador");
      expect(formatRole("GATEKEEPER")).toBe("Portaria");
      expect(formatRole("CLIENT")).toBe("Cliente");
    });
  });

  describe("formatEventType", () => {
    it("deve traduzir os tipos de evento", () => {
      expect(formatEventType("SHOW")).toBe("Show / Concerto");
      expect(formatEventType("MOVIE")).toBe("Filme / Cinema");
    });
  });

  describe("getStatusBadge", () => {
    it("deve retornar variant success para status ativos/confirmados", () => {
      const badge = getStatusBadge("CONFIRMED");
      expect(badge.label).toBe("Confirmado");
      expect(badge.variant).toBe("success");
    });

    it("deve retornar variant danger para status recusados ou cancelados", () => {
      const badge = getStatusBadge("REFUSED");
      expect(badge.label).toBe("Recusado");
      expect(badge.variant).toBe("danger");
    });
  });
});
