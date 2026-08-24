import type { UserRole, EventType, EventStatus, TicketStatus } from "@/types";

export function formatCurrency(value: number | string): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRole(role: UserRole): string {
  switch (role) {
    case "ORGANIZER":
      return "Organizador";
    case "GATEKEEPER":
      return "Portaria";
    case "CLIENT":
    default:
      return "Cliente";
  }
}

export function formatEventType(type: EventType): string {
  return type === "SHOW" ? "Show / Concerto" : "Filme / Cinema";
}

export function getStatusBadge(status: EventStatus | TicketStatus | string): {
  label: string;
  variant: "success" | "warning" | "danger" | "purple" | "default";
} {
  switch (status) {
    case "PUBLISHED":
    case "ACTIVE":
    case "CONFIRMED":
    case "APPROVED":
      return {
        label:
          status === "ACTIVE"
            ? "Válido / Ativo"
            : status === "PUBLISHED"
              ? "Publicado"
              : "Confirmado",
        variant: "success",
      };
    case "USED":
      return {
        label: "Utilizado",
        variant: "purple",
      };
    case "DRAFT":
    case "PENDING":
      return {
        label: status === "DRAFT" ? "Rascunho" : "Pendente",
        variant: "warning",
      };
    case "CANCELED":
    case "REFUSED":
      return {
        label: status === "REFUSED" ? "Recusado" : "Cancelado",
        variant: "danger",
      };
    default:
      return {
        label: status,
        variant: "default",
      };
  }
}
