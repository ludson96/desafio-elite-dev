import { useAuthStore } from "@/stores/authStore";
import type {
  User,
  Event,
  Ticket,
  Reservation,
  CatalogItem,
  TicketValidationResult,
  EventType,
  EventStatus,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = false, headers, ...customConfig } = options;
  const configHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...((headers as Record<string, string>) || {}),
  };

  if (requiresAuth) {
    const token = useAuthStore.getState().token;
    if (token) {
      configHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...customConfig,
    headers: configHeaders,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || "Ocorreu um erro na requisição";
    throw new Error(errorMessage);
  }

  return data;
}

export const authApi = {
  register: async (payload: { name: string; email: string; password: string; role: string }) => {
    return apiFetch<{ status: string; data: { user: User; token: string } }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login: async (payload: { email: string; password: string }) => {
    return apiFetch<{ status: string; data: { user: User; token: string } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getProfile: async () => {
    return apiFetch<{ status: string; data: User }>("/api/auth/me", {
      requiresAuth: true,
    });
  },
};

export const catalogApi = {
  search: async (query: string, type: string = "ALL") => {
    return apiFetch<{ status: string; count: number; data: CatalogItem[] }>(
      `/api/catalog/search?query=${encodeURIComponent(query)}&type=${type}`
    );
  },
};

export const eventsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: EventType;
    status?: EventStatus;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.status) searchParams.set("status", params.status);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return apiFetch<{
      status: string;
      data: { events: Event[]; total: number; page: number; totalPages: number };
    }>(`/api/events${queryString}`);
  },
  getById: async (id: string) => {
    return apiFetch<{ status: string; data: Event }>(`/api/events/${id}`);
  },
  getMyEvents: async () => {
    return apiFetch<{ status: string; results: number; data: Event[] }>(
      "/api/events/organizer/my-events",
      {
        requiresAuth: true,
      }
    );
  },
  create: async (payload: Partial<Event>) => {
    return apiFetch<{ status: string; data: Event }>("/api/events", {
      method: "POST",
      requiresAuth: true,
      body: JSON.stringify(payload),
    });
  },
  update: async (id: string, payload: Partial<Event>) => {
    return apiFetch<{ status: string; data: Event }>(`/api/events/${id}`, {
      method: "PUT",
      requiresAuth: true,
      body: JSON.stringify(payload),
    });
  },
};

export const reservationsApi = {
  create: async (payload: {
    eventId: string;
    quantity: number;
    paymentStatus: "APPROVED" | "REFUSED";
  }) => {
    return apiFetch<{
      status: string;
      data: {
        reservation: Reservation;
        paymentOutcome: { status: string; message: string };
      };
    }>("/api/reservations", {
      method: "POST",
      requiresAuth: true,
      body: JSON.stringify(payload),
    });
  },
  getMyReservations: async () => {
    return apiFetch<{ status: string; results: number; data: Reservation[] }>(
      "/api/reservations/my-reservations",
      {
        requiresAuth: true,
      }
    );
  },
  getById: async (id: string) => {
    return apiFetch<{ status: string; data: Reservation }>(`/api/reservations/${id}`, {
      requiresAuth: true,
    });
  },
  cancel: async (id: string) => {
    return apiFetch<{ status: string; message: string; data: Reservation }>(
      `/api/reservations/${id}/cancel`,
      {
        method: "PATCH",
        requiresAuth: true,
      }
    );
  },
};

export const ticketsApi = {
  getMyTickets: async () => {
    return apiFetch<{ status: string; results: number; data: Ticket[] }>("/api/tickets/my-tickets", {
      requiresAuth: true,
    });
  },
  getSharedTicket: async (shareToken: string) => {
    return apiFetch<{ status: string; data: Ticket }>(`/api/tickets/share/${shareToken}`);
  },
  validate: async (payload: { code: string; eventId: string; signature?: string }) => {
    return apiFetch<{ status: string; data: TicketValidationResult }>("/api/tickets/validate", {
      method: "POST",
      requiresAuth: true,
      body: JSON.stringify(payload),
    });
  },
};
