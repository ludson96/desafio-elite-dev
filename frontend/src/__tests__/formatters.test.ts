import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  formatRole,
  formatEventType,
  getStatusBadge,
} from "@/utils/formatters";

describe("formatters utils", () => {
  describe("formatCurrency", () => {
    it("deve formatar número para moeda BRL", () => {
      const result = formatCurrency(150);
      expect(result).toContain("150,00");
    });

    it("deve formatar string numérica para moeda BRL", () => {
      const result = formatCurrency("99.90");
      expect(result).toContain("99,90");
    });

    it("deve retornar R$ 0,00 para entradas inválidas", () => {
      expect(formatCurrency("invalid")).toContain("0,00");
    });
  });

  describe("formatRole", () => {
    it("deve traduzir ORGANIZER para Organizador", () => {
      expect(formatRole("ORGANIZER")).toBe("Organizador");
    });

    it("deve traduzir CLIENT para Cliente", () => {
      expect(formatRole("CLIENT")).toBe("Cliente");
    });

    it("deve traduzir GATEKEEPER para Portaria", () => {
      expect(formatRole("GATEKEEPER")).toBe("Portaria");
    });
  });

  describe("formatEventType", () => {
    it("deve formatar SHOW como Show / Concerto", () => {
      expect(formatEventType("SHOW")).toBe("Show / Concerto");
    });

    it("deve formatar MOVIE como Filme / Cinema", () => {
      expect(formatEventType("MOVIE")).toBe("Filme / Cinema");
    });
  });

  describe("getStatusBadge", () => {
    it("deve retornar label Válido / Ativo e cor verde para ACTIVE", () => {
      const badge = getStatusBadge("ACTIVE");
      expect(badge.label).toBe("Válido / Ativo");
      expect(badge.color).toContain("emerald");
    });

    it("deve retornar label Utilizado e cor roxa para USED", () => {
      const badge = getStatusBadge("USED");
      expect(badge.label).toBe("Utilizado");
      expect(badge.color).toContain("purple");
    });

    it("deve retornar label Recusado e cor vermelha para REFUSED", () => {
      const badge = getStatusBadge("REFUSED");
      expect(badge.label).toBe("Recusado");
      expect(badge.color).toContain("rose");
    });
  });

  describe("formatDate and formatDateTime", () => {
    it("deve formatar data ISO válida", () => {
      const dateStr = "2026-10-25T20:00:00.000Z";
      const formatted = formatDate(dateStr);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("deve retornar string vazia para entrada nula ou vazia", () => {
      expect(formatDate("")).toBe("");
      expect(formatDateTime("")).toBe("");
    });
  });
});
