import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  formatRole,
  formatEventType,
  getStatusBadge,
} from "../formatters";

describe("formatters utils", () => {
  describe("formatCurrency", () => {
    it("should format number to BRL currency string", () => {
      const result = formatCurrency(150);
      expect(result).toContain("150,00");
    });

    it("should format string number to BRL currency string", () => {
      const result = formatCurrency("99.90");
      expect(result).toContain("99,90");
    });

    it("should handle invalid inputs gracefully", () => {
      expect(formatCurrency("invalid")).toContain("0,00");
    });
  });

  describe("formatRole", () => {
    it("should translate ORGANIZER to Organizador", () => {
      expect(formatRole("ORGANIZER")).toBe("Organizador");
    });

    it("should translate CLIENT to Cliente", () => {
      expect(formatRole("CLIENT")).toBe("Cliente");
    });

    it("should translate GATEKEEPER to Portaria", () => {
      expect(formatRole("GATEKEEPER")).toBe("Portaria");
    });
  });

  describe("formatEventType", () => {
    it("should format SHOW as Show / Concerto", () => {
      expect(formatEventType("SHOW")).toBe("Show / Concerto");
    });

    it("should format MOVIE as Filme / Cinema", () => {
      expect(formatEventType("MOVIE")).toBe("Filme / Cinema");
    });
  });

  describe("getStatusBadge", () => {
    it("should return valid label and green color for ACTIVE status", () => {
      const badge = getStatusBadge("ACTIVE");
      expect(badge.label).toBe("Válido / Ativo");
      expect(badge.color).toContain("emerald");
    });

    it("should return Utilizado label and purple color for USED status", () => {
      const badge = getStatusBadge("USED");
      expect(badge.label).toBe("Utilizado");
      expect(badge.color).toContain("purple");
    });

    it("should return Recusado label and rose color for REFUSED status", () => {
      const badge = getStatusBadge("REFUSED");
      expect(badge.label).toBe("Recusado");
      expect(badge.color).toContain("rose");
    });
  });

  describe("formatDate and formatDateTime", () => {
    it("should format valid ISO date string", () => {
      const dateStr = "2026-10-25T20:00:00.000Z";
      const formatted = formatDate(dateStr);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should return empty string for empty input", () => {
      expect(formatDate("")).toBe("");
      expect(formatDateTime("")).toBe("");
    });
  });
});
