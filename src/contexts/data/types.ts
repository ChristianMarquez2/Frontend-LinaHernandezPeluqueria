// src/contexts/data/types.ts

// ============================================================
// 1. ENTIDADES BASE (CATÁLOGO Y USUARIOS)
// ============================================================

export interface User {
  _id: string;
  id?: string; // Alias opcional
  email: string;
  nombre: string;     // Backend field
  apellido: string;   // Backend field
  firstName?: string; // Frontend alias (opcional)
  lastName?: string;  // Frontend alias (opcional)
  telefono?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'stylist' | 'client' | 'ADMIN' | 'GERENTE' | 'ESTILISTA' | 'CLIENTE';
  isActive?: boolean;
}

export interface Service {
  _id: string;
  id?: string;
  
  // Datos principales (Backend Truth)
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
  codigo?: string;
  
  // Relaciones
  categoria?: string | Category; // Puede ser ID o poblado

  // Alias para compatibilidad frontend (Opcionales)
  name?: string; 
  description?: string;
  price?: number;
  duration?: number;
  active?: boolean;

  createdAt?: string;
  updatedAt?: string;
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

export interface Stylist {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  cedula?: string;
  telefono?: string;
  genero?: "M" | "F" | "O" | string;
  role: "ESTILISTA" | string;
  isActive: boolean;
  emailVerified?: boolean;
  servicesOffered: (string | Service)[]; // Array de IDs o de Objetos Service
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

// ============================================================
// 2. RESERVAS (CORE)
// ============================================================

export interface Booking {
  _id: string;
  id?: string; // Alias

  // Relaciones (IDs)
  clienteId: string | User;
  estilistaId: string | Stylist;
  servicioId: string | Service;
  
  // Objetos Poblados (Populated del backend)
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
    email: string;
  };
  cliente?: {
    _id: string;
    nombre: string;
    apellido: string;
    email: string;
  };

  // Tiempos
  inicio: string; // ISO String
  fin: string;    // ISO String
  date?: string;  // Alias frontend
  
  // Estados
  estado: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'SCHEDULED' | 'PENDING_STYLIST_CONFIRMATION' | string;
  status?: string; // Alias frontend

  // 💰 PAGOS (Nuevos campos vitales)
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'UNPAID';
  paymentMethod?: 'CARD' | 'TRANSFER_PICHINCHA';
  paidAt?: string | null;
  invoiceNumber?: string | null;
  transferProofUrl?: string | null; // URL de la imagen en Supabase
  precio?: number;

  notas?: string;
  createdAt: string;
}

// Interfaz para el Calendario Visual (puede ser una transformación de Booking)
export interface Appointment {
  _id: string;
  stylist: PopulatedStylist | string; 
  services: Service[]; 
  clientId?: PopulatedClient | string | null;
  clientName?: string;
  clientPhone?: string;
  start: string;
  end: string;
  status: string;
  notes?: string;
  createdAt?: string;
}

// ============================================================
// 3. PAGOS Y TRANSFERENCIAS (DTOs)
// ============================================================

export interface BankInfo {
  bank: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  reference: string;
}

export interface TransferRequestResponse {
  message: string;
  bookingId: string;
  paymentId: string;
  amount: number;
  bankInfo: BankInfo;
  uploadProofEndpoint: string;
}

// ============================================================
// 4. HORARIOS Y SLOTS
// ============================================================

export interface AvailabilitySlot {
  slotId: string;
  stylistId: string;
  stylistName: string;
  start: string;
  end: string;
}

export type DayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; 
export type WeekdayName = 'DOMINGO' | 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';

export interface StylistSchedule {
  _id?: string;
  stylistId: string;
  dayOfWeek: DayOfWeekIndex;
  slots: { start: string; end: string }[]; 
  exceptions?: { 
    date: string; 
    closed?: boolean; 
    blocks?: { start: string; end: string }[] 
  }[];
}

export interface ServiceSlot {
  id: string;
  stylist: string | { _id: string; nombre: string; apellido: string };
  service: string | { _id: string; nombre: string; duracionMin: number; precio: number };
  dayOfWeek: WeekdayName;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// ============================================================
// 5. REPORTES Y ESTADÍSTICAS
// ============================================================

export interface ReportRangeParams {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  stylistId?: string;
}

// Dashboard General
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

// Reporte Detallado Estilista
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
    peakHour: string | null;    
    peakWeekday: string | null; 
  };
}

export interface StylistReportResponse {
  range: { from: string; to: string; label: string };
  count: number;
  reports: StylistDetailedReport[];
}

// Fallback legacy (opcional)
export interface ReportSummary {
  topServices: { _id: string; count: number }[];
  ratingsByStylist: { _id: string; avg: number; count: number }[];
  bookingsByStatus: { _id: string; count: number }[];
  revenueByMonth: { _id: string; total: number }[];
}

// ============================================================
// 6. FEEDBACK Y NOTIFICACIONES
// ============================================================

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

// ============================================================
// 7. PAYLOADS (DTOs para POST/PUT)
// ============================================================

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

export interface ServiceFormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  precio: string;       // String en forms
  duracionMin: string;  // String en forms
  activo: boolean;
  categoria: string;
}

export interface CreateCategoryDTO {
  nombre: string;
  descripcion?: string;
  imageUrl?: string;
  activo?: boolean;
  services?: string[]; 
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

export interface UpsertScheduleDTO {
  stylistId: string;
  dayOfWeek: DayOfWeekIndex;
  slots: { start: string; end: string }[];
  exceptions?: any[];
}

export interface GenerateSlotsDTO {
  stylistId: string;
  serviceId: string;
  dayOfWeek: WeekdayName;
  dayStart: string; 
  dayEnd: string;   
  date: string;     
}

// ============================================================
// 8. RESPUESTAS GENÉRICAS
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CategoryListResponse {
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

// Interfaces Auxiliares para Populate
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

// ============================================================
// 9. CONTEXT TYPE (LO QUE EXPORTA EL PROVIDER)
// ============================================================

export interface DataContextType {
  services: Service[];
  stylists: Stylist[];
  businessHours: BusinessHours | null;
  
  appointments: Appointment[]; // Vista calendario
  myBookings: Booking[];       // Vista cliente

  ratings: Rating[];
  notifications: Notification[];
  reports: DashboardSummary | null; // Usamos el nuevo reporte

  // Métodos de carga
  fetchData: () => Promise<void>;
  fetchReports: () => Promise<void>; // Puede redirigir a fetchDashboardSummary
  
  // Notificaciones
  getUserNotifications: (userId: string) => Notification[];
  
  // Acciones
  createRating: (data: CreateRatingPayload) => Promise<boolean>;
}