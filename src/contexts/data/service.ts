import { API_BASE_URL } from "../../config/api";
import { 
  CreateRatingPayload, 
  ReportSummary, 
  AvailabilitySlot, 
  CreateBookingPayload,
  Booking,
  Notification,
  Service,
  Stylist,
  BusinessHours,
  Appointment
} from "./types";

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const dataService = {
  
  // ============================================================
  // 🧩 MÉTODOS GRANULARES (Solución al Bucle Infinito)
  // ============================================================

  fetchServices: async (token: string): Promise<Service[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/services`, { headers: getHeaders(token) });
      if (!res.ok) return [];
      return await res.json();
    } catch (error) { return []; }
  },

  fetchStylists: async (token: string): Promise<Stylist[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/stylists`, { headers: getHeaders(token) });
      if (!res.ok) return [];
      return await res.json();
    } catch (error) { return []; }
  },

  fetchBusinessHours: async (token: string): Promise<BusinessHours | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/schedules/business`, { headers: getHeaders(token) });
      if (!res.ok) return null;
      return await res.json();
    } catch (error) { return null; }
  },

  // 🛑 CORRECCIÓN 404: Mockeamos esto porque el backend no tiene GET
  fetchNotifications: async (token: string): Promise<Notification[]> => {
    // Como el backend no tiene endpoint GET /notifications, retornamos vacío
    // para evitar el error 404 y el loop.
    return Promise.resolve([]); 
  },
  
  // 🛑 CORRECCIÓN 403: Manejo seguro de Ratings
  fetchMyRatings: async (token: string): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/ratings/my?page=1&limit=50`, { headers: getHeaders(token) });
      if (res.status === 403 || res.status === 404) return []; // Si no es cliente o no existe ruta
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) { return []; }
  },

  // Citas Manuales (Admin)
  fetchManualAppointments: async (token: string): Promise<Appointment[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments?limit=100`, { headers: getHeaders(token) });
      if (res.status === 403) return []; // Si es cliente, esto fallará, retornamos vacío
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch (error) { return []; }
  },

  // ============================================================
  // 📅 CLIENTE: FLUJO DE RESERVAS
  // ============================================================

  fetchAvailability: async (token: string, date: string, serviceId: string, stylistId?: string): Promise<AvailabilitySlot[]> => {
    const params = new URLSearchParams({ date, serviceId });
    if (stylistId) params.append("stylistId", stylistId);
    const res = await fetch(`${API_BASE_URL}/bookings/availability?${params.toString()}`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error("Error obteniendo disponibilidad");
    return await res.json();
  },

  createBooking: async (token: string, payload: CreateBookingPayload) => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al crear reserva");
    return data;
  },

  fetchClientBookings: async (token: string): Promise<Booking[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/bookings/me?page=1&limit=50&sort=-createdAt`, { headers: getHeaders(token) });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || []; 
    } catch (e) { return []; }
  },

  // ============================================================
  // 🔄 CARGA INICIAL (DUMMY para evitar loops viejos)
  // ============================================================
  fetchInitialData: async (token: string) => {
    // Devolvemos todo vacío para obligar a usar los métodos específicos
    return {
        services: [], stylists: [], businessHours: null, appointments: [], ratings: [], notifications: []
    };
  },

  // 📊 Reportes
  fetchReports: async (token: string): Promise<ReportSummary | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/summary`, { headers: getHeaders(token) });
      if (!res.ok) return null;
      return await res.json();
    } catch (error) { return null; }
  },

  // ⭐ Crear Rating
  createRating: async (token: string, payload: CreateRatingPayload) => {
    const res = await fetch(`${API_BASE_URL}/ratings`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al enviar calificación");
    return data;
  },
};