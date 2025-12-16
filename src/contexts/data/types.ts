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

// 1. AvailabilitySlot
export interface AvailabilitySlot {
  slotId: string;
  stylistId: string;
  stylistName: string;
  start: string;
  end: string;
}

// 2. Booking
export interface Booking {
  _id: string;
  clienteId: string;
  estilistaId: string; 
  servicioId: string;
  
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

  inicio: string;
  fin: string;
  
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

// 3. Appointment
export interface Appointment {
  _id: string;
  stylist: PopulatedStylist | string; 
  services: Service[]; 
  clientId?: PopulatedClient | string | null;
  clientName?: string;
  clientPhone?: string;

  start: string;
  end: string;
  
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

export interface CreateBookingPayload {
  slotId?: string;
  slotIds?: string[];
  date: string;
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
  
  appointments: Appointment[];
  myBookings: Booking[];

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

// 🔥🔥 NUEVAS INTERFACES FALTANTES 🔥🔥
export interface CategoryListResponse {
  data: Category[];
  meta: PaginationMeta;
}

export interface CreateCategoryDTO {
  nombre: string;
  descripcion?: string;
  imageUrl?: string;
  activo?: boolean;
  services?: string[]; // IDs de servicios
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

// ==================== HORARIOS Y SLOTS ====================

// Días de la semana para UI y Backend
export type DayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Domingo (Backend Schedule)
export type WeekdayName = 'DOMINGO' | 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';

// Plantilla de Horario (StylistSchedule)
export interface StylistSchedule {
  _id?: string;
  stylistId: string;
  dayOfWeek: DayOfWeekIndex;
  slots: { start: string; end: string }[]; // HH:mm
  exceptions?: { 
    date: string; 
    closed?: boolean; 
    blocks?: { start: string; end: string }[] 
  }[];
}

// Payload para guardar plantilla
export interface UpsertScheduleDTO {
  stylistId: string;
  dayOfWeek: DayOfWeekIndex;
  slots: { start: string; end: string }[];
  exceptions?: any[];
}

// Payload para generar Slots (CreateDaySlots)
export interface GenerateSlotsDTO {
  stylistId: string;
  serviceId: string;
  dayOfWeek: WeekdayName;
  dayStart: string; // HH:00 o HH:30
  dayEnd: string;   // HH:00 o HH:30
  date: string;     // YYYY-MM-DD (Para referencia visual, aunque el backend pide dayOfWeek string)
}

// Slot generado (Respuesta de listSlots)
export interface ServiceSlot {
  id: string;
  stylist: string | { _id: string; nombre: string; apellido: string };
  service: string | { _id: string; nombre: string; duracionMin: number; precio: number };
  dayOfWeek: WeekdayName;
  startTime: string;
  endTime: string;
  isActive: boolean;
}