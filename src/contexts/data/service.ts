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
  Appointment,
  StylistSchedule,
  UpsertScheduleDTO,
  GenerateSlotsDTO,
  ServiceSlot,
  ReportRangeParams,
  DashboardSummary,
  StylistReportResponse,
  Category,
  CategoryListResponse,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  TransferRequestResponse,
} from "./types";

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const dataService = {

  // ============================================================
  // 🧩 DATOS ESTÁTICOS
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

  fetchNotifications: async (token: string): Promise<Notification[]> => {
    return Promise.resolve([]); // Mock para evitar 404
  },

  // ============================================================
  // 📅 GESTIÓN DE CITAS
  // ============================================================

  fetchAllBookings: async (token: string, filters: { date?: string; stylistId?: string; status?: string }): Promise<Booking[]> => {
    const params = new URLSearchParams();

    // El backend usa dateFrom y dateTo en listAllBookings
    if (filters.date) {
      params.append("dateFrom", `${filters.date}T00:00:00.000Z`);
      params.append("dateTo", `${filters.date}T23:59:59.999Z`);
    }
    if (filters.stylistId) params.append("stylistId", filters.stylistId);
    if (filters.status) params.append("status", filters.status);
    params.append("limit", "100");

    const res = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`, {
      headers: getHeaders(token)
    });

    // Si es 403 (es estilista), intentamos su ruta propia
    if (res.status === 403) {
      const resSty = await fetch(`${API_BASE_URL}/bookings/mystyle?${params.toString()}`, {
        headers: getHeaders(token)
      });
      const json = await resSty.json();
      return json.data || [];
    }

    const json = await res.json();
    // Importante: El backend devuelve { data: [...], meta: {...} }
    return json.data || [];
  },

  // CORRECCIÓN: Tu backend recibe 'motivo' en el body para cancelar
  cancelBooking: async (token: string, bookingId: string, motivo: string) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ motivo }),
    });
    if (!res.ok) throw new Error("Error al cancelar");
    return await res.json();
  },

  // ============================================================
  // 🕒 SLOTS (HORARIOS DISPONIBLES)
  // ============================================================

  // Tu backend tiene un controlador específico para generar slots de un día
  generateDaySlots: async (token: string, data: GenerateSlotsDTO): Promise<ServiceSlot[]> => {
    const res = await fetch(`${API_BASE_URL}/slots/day`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data), // { stylistId, serviceId, dayOfWeek, dayStart, dayEnd }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error generando slots");
    }
    return await res.json(); // Devuelve el array de slots generados
  },

  // Listar slots disponibles (Público o Privado)
  listSlots: async (token: string, filters: { stylistId?: string; serviceId?: string; dayOfWeek?: string }): Promise<ServiceSlot[]> => {
    const params = new URLSearchParams();
    if (filters.stylistId) params.append("stylistId", filters.stylistId);
    if (filters.serviceId) params.append("serviceId", filters.serviceId);
    if (filters.dayOfWeek) params.append("dayOfWeek", filters.dayOfWeek);

    const res = await fetch(`${API_BASE_URL}/slots?${params.toString()}`, {
      headers: getHeaders(token),
    });
    const json = await res.json();
    return json.data || [];
  },


  // Agrego también la función de reprogramar que faltaba y es necesaria para el modal
  rescheduleBooking: async (token: string, bookingId: string, payload: { slotId: string; date: string }) => {
    // Nota: El backend espera PUT en esta ruta
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reschedule`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al reprogramar la cita");
    return data;
  },

  updateBookingStatus: async (token: string, bookingId: string, action: 'confirm' | 'complete' | 'cancel' | 'reschedule', payload?: any) => {
    let url = `${API_BASE_URL}/bookings/${bookingId}/${action}`;
    
    // Definir método HTTP según la acción
    const methodMap: Record<string, string> = {
      'confirm': 'POST',
      'reschedule': 'POST',
      'complete': 'PATCH',
      'cancel': 'POST'
    };
    
    const method = methodMap[action] || 'POST';

    console.log('🔧 [SERVICE] updateBookingStatus llamado:', {
      bookingId,
      action,
      url,
      method,
      payload,
      hasToken: !!token
    });

    const res = await fetch(url, {
      method,
      headers: getHeaders(token),
      body: JSON.stringify(payload || {}),
    });

    console.log('📡 [SERVICE] Response status:', res.status, res.statusText);

    if (!res.ok) {
      let errorMessage = `Error al ejecutar ${action}`;
      try {
        const err = await res.json();
        console.error('❌ [SERVICE] Error del backend:', err);
        errorMessage = err.message || errorMessage;
      } catch {
        console.error('❌ [SERVICE] No se pudo parsear error JSON');
        errorMessage = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  },

  fetchManualAppointments: async (token: string): Promise<Appointment[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments?limit=100`, { headers: getHeaders(token) });
      if (res.status === 403) return [];
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch (error) { return []; }
  },

  // ============================================================
  // 🕒 GESTIÓN DE HORARIOS
  // ============================================================

  fetchStylistSchedules: async (token: string, stylistId: string): Promise<StylistSchedule[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/schedules/stylist/${stylistId}`, {
        headers: getHeaders(token)
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (error) { return []; }
  },

  upsertStylistSchedule: async (token: string, data: UpsertScheduleDTO): Promise<StylistSchedule> => {
    const res = await fetch(`${API_BASE_URL}/schedules/stylist`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar el horario");
    return await res.json();
  },

  deleteStylistScheduleDay: async (token: string, stylistId: string, dayOfWeek: number) => {
    const res = await fetch(`${API_BASE_URL}/schedules/stylist`, {
      method: "DELETE",
      headers: getHeaders(token),
      body: JSON.stringify({ stylistId, dayOfWeek }),
    });
    if (!res.ok) throw new Error("Error al borrar horario");
    return true;
  },



  // ============================================================
  // 📅 CLIENTE & RATINGS
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
      if (!token) {
        console.warn("⚠️ No hay token disponible para fetchClientBookings");
        return [];
      }
      
      const res = await fetch(`${API_BASE_URL}/bookings/me?page=1&limit=50&sort=-createdAt`, { 
        headers: getHeaders(token) 
      });
      
      if (res.status === 403) {
        console.warn("⚠️ Acceso denegado (403) a /bookings/me - Verifica que el token sea válido");
        return [];
      }
      
      if (res.status === 401) {
        console.warn("⚠️ No autorizado (401) - El token puede haber expirado");
        return [];
      }
      
      if (!res.ok) {
        console.warn(`⚠️ Error ${res.status} al obtener reservas:`, res.statusText);
        return [];
      }
      
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error("❌ Error al obtener reservas:", e);
      return [];
    }
  },

  fetchMyRatings: async (token: string): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/ratings/my?page=1&limit=50`, { headers: getHeaders(token) });
      if (res.status === 403 || res.status === 404) return [];
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) { return []; }
  },

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

  // ============================================================
  // 📊 REPORTES (CON FALLBACK LOCAL)
  // ============================================================



  // 🔄 CARGA INICIAL
  fetchInitialData: async (token: string) => {
    return {
      services: [], stylists: [], businessHours: null, appointments: [], ratings: [], notifications: []
    };
  },


  // 1. Dashboard General (Admin/Gerente)
  fetchDashboardSummary: async (token: string, params: ReportRangeParams): Promise<DashboardSummary | null> => {
    try {
      const q = new URLSearchParams({ from: params.from, to: params.to });
      const res = await fetch(`${API_BASE_URL}/reports/summary?${q.toString()}`, {
        headers: getHeaders(token)
      });
      if (!res.ok) throw new Error("Error fetching summary");
      return await res.json();
    } catch (error) {
      console.error("Dashboard Error:", error);
      return null;
    }
  },

  // 2. Reporte Detallado de Estilistas (Admin ve todos, Estilista ve el suyo si usa /my)
  fetchStylistReports: async (token: string, params: ReportRangeParams, isPersonal: boolean = false): Promise<StylistReportResponse | null> => {
    try {
      const q = new URLSearchParams({ from: params.from, to: params.to });
      // Si un admin busca un estilista específico, añade el ID
      if (params.stylistId && !isPersonal) q.append("stylistId", params.stylistId);

      const endpoint = isPersonal ? "/reports/my" : "/reports/stylists";
      const res = await fetch(`${API_BASE_URL}${endpoint}?${q.toString()}`, {
        headers: getHeaders(token)
      });

      if (!res.ok) throw new Error("Error fetching stylist reports");
      return await res.json();
    } catch (error) {
      console.error("Stylist Report Error:", error);
      return null;
    }
  },

  // 3. Descarga de PDF General
  downloadGeneralReportPDF: async (token: string, params: ReportRangeParams): Promise<Blob | null> => {
    const q = new URLSearchParams({ from: params.from, to: params.to });
    const res = await fetch(`${API_BASE_URL}/reports/pdf?${q.toString()}`, { headers: getHeaders(token) });
    return res.ok ? await res.blob() : null;
  },

  // 4. Descarga de PDF Estilistas
  downloadStylistReportPDF: async (token: string, params: ReportRangeParams, isPersonal: boolean = false): Promise<Blob | null> => {
    const q = new URLSearchParams({ from: params.from, to: params.to });
    const endpoint = isPersonal ? "/reports/my/pdf" : "/reports/stylists/pdf";
    const res = await fetch(`${API_BASE_URL}${endpoint}?${q.toString()}`, { headers: getHeaders(token) });
    return res.ok ? await res.blob() : null;
  },

  // Mantenemos fetchReports original como alias o fallback si lo usabas en componentes viejos, 
  // pero ahora debería redirigir a fetchDashboardSummary con fechas por defecto.
  fetchReports: async (token: string): Promise<any> => {
    // Fallback a "este mes" si se llama sin params
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return await dataService.fetchDashboardSummary(token, { from: start, to: end });
  },

  fetchAllRatings: async (token: string): Promise<any[]> => {
    try {
      // Asume que GET /ratings trae lista completa si eres admin
      const res = await fetch(`${API_BASE_URL}/ratings?limit=100`, { headers: getHeaders(token) });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    } catch (error) { return []; }
  },

  // Para el ESTILISTA (o filtro admin): Traer por ID de estilista
  fetchRatingsByStylist: async (token: string, stylistId: string): Promise<any[]> => {
    try {
      // Asume que el backend soporta filtro ?stylistId=...
      const res = await fetch(`${API_BASE_URL}/ratings?stylistId=${stylistId}&limit=100`, { headers: getHeaders(token) });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data || []);
    } catch (error) { return []; }
  },

  fetchCategories: async (token: string, page = 1, q = ""): Promise<CategoryListResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      includeServices: "true"
    });
    if (q) params.append("q", q);

    const res = await fetch(`${API_BASE_URL}/catalog?${params.toString()}`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Error obteniendo categorías");
    return await res.json();
  },

  saveCategory: async (token: string, data: any, id?: string): Promise<Category> => {
    const url = id ? `${API_BASE_URL}/catalog/${id}` : `${API_BASE_URL}/catalog`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar categoría");
    return await res.json();
  },

  // Tu backend usa PATCH para activar/desactivar
  toggleCategoryStatus: async (token: string, id: string, active: boolean): Promise<Category> => {
    const action = active ? 'activate' : 'deactivate';
    const res = await fetch(`${API_BASE_URL}/catalog/${id}/${action}`, {
      method: "PATCH",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("Error al cambiar estado de categoría");
    const json = await res.json();
    return json.category; // Tu controlador devuelve { message, category }
  },

  deleteCategory: async (token: string, id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/catalog/${id}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error("No se pudo eliminar la categoría");
  },

  // ============================================================
  // 💰 PAGOS Y TRANSFERENCIAS (Nuevo)
  // ============================================================

  // 1. Solicitar datos de transferencia
  requestTransfer: async (token: string, bookingId: string): Promise<TransferRequestResponse> => {
    const res = await fetch(`${API_BASE_URL}/payments/booking/${bookingId}/transfer-request`, {
      method: "POST",
      headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al solicitar pago");
    return data;
  },

  // 2. Subir comprobante (Multipart File)
  uploadTransferProof: async (token: string, bookingId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // Nota: NO usamos 'Content-Type': 'application/json' aquí, el navegador lo pone automático con el boundary
    const res = await fetch(`${API_BASE_URL}/payments/booking/${bookingId}/transfer-proof`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Header manual sin Content-Type json
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al subir comprobante");
    return data;
  },

  // 3. Confirmar pago (Admin)
  confirmTransferPayment: async (token: string, bookingId: string) => {
    const res = await fetch(`${API_BASE_URL}/payments/booking/${bookingId}/confirm-transfer`, {
      method: "POST",
      headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al confirmar pago");
    return data;
  },

  // 4. Ver comprobante (Opcional, si quieres ver el estado actual)
  getTransferProof: async (token: string, bookingId: string) => {
    const res = await fetch(`${API_BASE_URL}/payments/booking/${bookingId}/transfer-proof`, {
      headers: getHeaders(token),
    });
    if (!res.ok) return null; // Puede no existir aún
    return await res.json();
  },

 listTransferProofs: async (token: string, clientId?: string) => {
    let url = `${API_BASE_URL}/payments/transfer-proofs`;
    if (clientId) url += `?clientId=${clientId}`;
    
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error cargando comprobantes");
    // El backend devuelve { count: number, data: [] }
    return data; 
  },
  // ✅ NUEVO: Obtener un booking por ID (para enriquecer datos)
  getBookingById: async (token: string, bookingId: string): Promise<Booking | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data || data;
    } catch (error) {
      return null;
    }
  },
  
};