export type UserRole = 'ORGANIZER' | 'CLIENT' | 'GATEKEEPER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type EventType = 'SHOW' | 'MOVIE';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELED' | 'FINISHED';

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  type: EventType;
  category?: string | null;
  imageUrl?: string | null;
  date: string;
  location: string;
  capacity: number;
  availableTickets: number;
  price: number | string;
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

export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELED';

export interface Ticket {
  id: string;
  code: string;
  status: TicketStatus;
  shareToken: string;
  qrSignature: string;
  qrCodeUrl?: string;
  usedAt?: string | null;
  eventId: string;
  reservationId: string;
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'REFUSED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REFUSED';

export interface Reservation {
  id: string;
  totalAmount: number | string;
  status: ReservationStatus;
  clientId: string;
  eventId: string;
  event?: Event;
  tickets?: Ticket[];
  payment?: {
    id: string;
    amount: number | string;
    status: PaymentStatus;
    provider: string;
  };
  createdAt: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  type: EventType;
  description: string;
  imageUrl: string;
  date?: string;
  location?: string;
  category?: string;
  externalSource: 'TMDB' | 'TICKETMASTER' | 'DEMO';
}

export interface TicketValidationResult {
  status: 'VALID' | 'ALREADY_USED' | 'INVALID' | 'WRONG_EVENT';
  message: string;
  ticket?: {
    code: string;
    status: string;
    usedAt?: string | null;
    event: {
      id: string;
      title: string;
      date: string;
      location: string;
    };
    client?: {
      name: string;
      email: string;
    };
  };
}
