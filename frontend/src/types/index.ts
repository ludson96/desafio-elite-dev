export type UserRole = "CLIENT" | "ORGANIZER" | "GATEKEEPER";
export type EventType = "SHOW" | "MOVIE";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELED";
export type ReservationStatus = "PENDING" | "CONFIRMED" | "REFUSED" | "CANCELED";
export type TicketStatus = "ACTIVE" | "USED" | "CANCELED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  type: EventType;
  category?: string | null;
  date: string;
  location: string;
  capacity: number;
  availableTickets: number;
  price: number | string;
  imageUrl?: string | null;
  status: EventStatus;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  code: string;
  status: TicketStatus;
  qrCode?: string | null;
  qrCodeUrl?: string | null;
  shareToken: string;
  usedAt?: string | null;
  eventId: string;
  userId: string;
  reservationId?: string | null;
  event?: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    date: string;
    location: string;
    price: number | string;
    type: EventType;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  quantity: number;
  totalAmount: number | string;
  status: ReservationStatus;
  userId: string;
  eventId: string;
  event?: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    date: string;
    location: string;
    price: number | string;
  };
  tickets?: Ticket[];
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItem {
  externalId: string;
  title: string;
  description: string;
  type: EventType;
  category: string;
  imageUrl?: string;
  date?: string;
  location?: string;
  source: "TMDB" | "TICKETMASTER" | "INTERNAL";
}

export interface TicketValidationResult {
  valid: boolean;
  status: "VALID" | "ALREADY_USED" | "WRONG_EVENT" | "INVALID";
  message: string;
  ticket?: Ticket;
}
