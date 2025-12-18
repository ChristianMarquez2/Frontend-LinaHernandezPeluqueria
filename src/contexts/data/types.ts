// ==================== ENTIDADES BASE ====================

export interface Service {
  _id: string;
  nombre: string;
  codigo?: string; // El signo '?' permite que sea undefined
  descripcion: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
  categoria?: string | any; // Añadimos esto para la relación con catálogo
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceFormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  precio: string;       // Se maneja como string en el form para los inputs
  duracionMin: string;  // Se maneja como string en el form para los inputs
  activo: boolean;
  categoria: string;
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
  
  // 🔥 AÑADIMOS ESTOS CAMPOS (Populated del backend)
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
  estado: string; 
  notas?: string;
  precio?: number;
  paymentStatus?: 'UNPAID' | 'PAID';
  paymentMethod?: 'CARD' | 'TRANSFER_PICHINCHA';
  paidAt?: string | null;
  invoiceNumber?: string | null;
  createdAt: string;
}


export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
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
  meta: {
    page: number;
    limit: number;
    total: number;
  };
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

// ==================== REPORTES (NUEVO) ====================

export interface ReportRangeParams {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  stylistId?: string;
}

// 1. Estructura del Dashboard General (endpoint /summary)
export interface DashboardSummary {
  range: { from: string; to: string; label: string };
  totals: {
    totalRevenue: number;
    totalPaidBookings: number;
  };
  revenueByDay: { day: string; total: number; count: number }[];
  revenueByStylist: { 
    _id: string; 
    stylistName: string; 
    totalRevenue: number; 
    bookingsCount: number 
  }[];
  topServices: { 
    _id: string; 
    serviceName: string; 
    totalRevenue: number; 
    bookingsCount: number 
  }[];
  bookingsByStatus: { _id: string; count: number }[];
  ratingsByStylist: { 
    _id: string; 
    stylistName: string; 
    avgRating: number; 
    ratingsCount: number 
  }[];
}

// 2. Estructura del Reporte Detallado de Estilista (endpoint /stylists o /my)
export interface StylistDetailedReport {
  stylist: {
    id: string;
    name: string;
    email: string | null;
    isActive: boolean;
  };
  earnings: {
    totalRevenue: number;
    paidBookings: number;
    avgTicket: number;
  };
  ratings: {
    avgRating: number;
    ratingsCount: number;
    distribution: { stars: number; count: number }[];
    latestComments: {
      estrellas: number;
      commentText: string;
      createdAt: string;
      clientName: string;
    }[];
  };
  
  appointmentsNotes: {
    date: string;
    estado: string;
    servicio: string;
    cliente: string;
    notas: string;
  }[];
  topServices: {
    _id: string;
    serviceName: string;
    totalRevenue: number;
    bookingsCount: number;
  }[];
  bookingsByStatus: { _id: string; count: number }[];
  extra: {
    totalBookings: number;
    uniqueClients: number;
    cancelRatePct: number;
    completionRatePct: number;
    peakHour: string | null;     // Ej: "14:00"
    peakWeekday: string | null;  // Ej: "MIE"
  };
  
}

export interface StylistReportResponse {
  range: { from: string; to: string; label: string };
  count: number;
  reports: StylistDetailedReport[];
}

// Interfaz antigua (fallback)
export interface ReportSummaryOld {
  topServices: { _id: string; count: number }[];
  ratingsByStylist: { _id: string; avg: number; count: number }[];
  bookingsByStatus: { _id: string; count: number }[];
  revenueByMonth: { _id: string; total: number }[];
}