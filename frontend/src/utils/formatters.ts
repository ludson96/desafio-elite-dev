import type { EventStatus, EventType, TicketStatus, UserRole } from "@/types";

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericAmount);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatRole(role: UserRole): string {
  const roles: Record<UserRole, string> = {
    ORGANIZER: "Organizador",
    CLIENT: "Cliente",
    GATEKEEPER: "Portaria",
  };
  return roles[role] || role;
}

export function formatEventType(type: EventType): string {
  return type === "SHOW" ? "Show / Concerto" : "Filme / Cinema";
}

export function getStatusBadge(status: EventStatus | TicketStatus | string) {
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
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    case "USED":
      return {
        label: "Utilizado",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      };
    case "DRAFT":
    case "PENDING":
      return {
        label: status === "DRAFT" ? "Rascunho" : "Pendente",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    case "CANCELED":
    case "REFUSED":
      return {
        label: status === "REFUSED" ? "Recusado" : "Cancelado",
        color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      };
    default:
      return {
        label: status,
        color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
      };
  }
}
