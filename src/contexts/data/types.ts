// ==================== ENTIDADES BASE ====================

export interface Service {
  _id: string;
  nombre: string;
  codigo?: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stylist {
  _id: string;
  nombre: string;
  apellido: string;
  genero: "M" | "F" | "O" | string;
  cedula: string;
  telefono: string;
  role: "ESTILISTA";
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  servicesOffered: Service[];
}

export interface BusinessHours {
  _id: string;
  days: {
    dayOfWeek: number;
    open: string;
    close: string;
  }[];
  exceptions: {
    date: string;
    closed: boolean;
    open?: string;
    close?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ==================== RESERVAS Y CITAS (CORE) ====================

// 1. AvailabilitySlot: Lo que devuelve availability.service.ts
export interface AvailabilitySlot {
  slotId: string;      // ID del ServiceSlot
  stylistId: string;   // ID del Estilista
  stylistName: string; // Nombre pre-formateado
  start: string;       // ISO String
  end: string;         // ISO String
}

// 2. Booking: Reserva hecha por cliente (Sistema de Slots)
export interface Booking {
  _id: string;
  clienteId: string;
  estilistaId: string; 
  servicioId: string;
  
  // Objetos populados (si el backend los devuelve, usualmente sí en los GET)
  servicio?: {
    _id: string;
    nombre: string;
    precio: number;
    duracionMin: number;
  };
  estilista?: {
    _id: string;
    nombre: string;
    apellido: string;
  };

  inicio: string; // ISO Date (Ojo: Backend usa 'inicio', no 'start')
  fin: string;    // ISO Date (Ojo: Backend usa 'fin', no 'end')
  
  estado: 
    | 'SCHEDULED' 
    | 'CONFIRMED' 
    | 'IN_PROGRESS' 
    | 'COMPLETED' 
    | 'CANCELLED' 
    | 'NO_SHOW' 
    | 'PENDING_STYLIST_CONFIRMATION';
    
  notas?: string;
  precio?: number;
  createdAt: string;
}

// 3. Appointment: Cita Manual (Admin/Estilista)
export interface Appointment {
  _id: string;
  stylist: PopulatedStylist | string; 
  services: Service[]; 
  clientId?: PopulatedClient | string | null;
  clientName?: string;
  clientPhone?: string;

  start: string; // Backend usa 'start'
  end: string;   // Backend usa 'end'
  
  status: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA" | string;
  
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// === INTERFACES AUXILIARES ===
export interface PopulatedStylist {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
}

export interface PopulatedClient {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
}

export interface Rating {
  _id: string;
  bookingId: string;
  clienteId: string;
  estilistaId: string;
  estrellas: number;
  comentario: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: "EMAIL" | "SYSTEM" | "BOOKING" | "RATING" | string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

// ==================== DTOs & PAYLOADS ====================

// Payload para crear reserva
export interface CreateBookingPayload {
  slotId: string;
  date: string; // YYYY-MM-DD
  notas?: string;
}

export interface CreateRatingPayload {
  bookingId: string;
  estrellas: number;
  comentario?: string;
}

export interface ReportSummary {
  topServices: { _id: string; count: number }[];
  ratingsByStylist: { _id: string; avg: number; count: number }[];
  bookingsByStatus: { _id: string; count: number }[];
  revenueByMonth: { _id: string; total: number }[];
}

// ==================== CONTEXTO ====================

export interface DataContextType {
  services: Service[];
  stylists: Stylist[];
  businessHours: BusinessHours | null;
  
  appointments: Appointment[]; // Citas manuales (Admin view)
  myBookings: Booking[];       // Mis reservas (Client view)

  ratings: Rating[];
  notifications: Notification[];
  reports: ReportSummary | null;

  fetchData: () => Promise<void>;
  fetchReports: () => Promise<void>;
  getUserNotifications: (userId: string) => Notification[];
  createRating: (data: CreateRatingPayload) => Promise<boolean>;
}

export interface Category {
  _id: string;
  nombre: string;
  descripcion?: string;
  imageUrl?: string; 
  activo: boolean;
  services: string[] | Service[]; 
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}