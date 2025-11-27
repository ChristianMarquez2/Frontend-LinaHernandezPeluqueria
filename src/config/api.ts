// config/api.ts

const BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

const PREFIX = import.meta.env.VITE_API_PREFIX || "/api/v1";

export const API_BASE_URL =
  BASE.endsWith(PREFIX)
    ? BASE
    : BASE.endsWith("/api") && PREFIX.startsWith("/api")
      ? BASE.replace(/\/api$/, "") + PREFIX
      : BASE + PREFIX;

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",

    // Email
    sendVerification: "/auth/send-verification-email",
    verifyEmail: "/auth/verify-email",

    // Recuperación
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",

    // Sesión
    refresh: "/auth/refresh",

    // Google
    googleSignIn: "/auth/google",
    me: "/auth/me", // Añadido por compatibilidad si se usa
  },

  users: {
    me: "/users/me",        // GET
    update: "/users/me",    // PUT
  },

  // Datos Estáticos
  services: "/services",
  stylists: "/stylists",
  
  // 🔥 ACTUALIZADO: Objeto para soportar /business
  schedules: {
    base: "/schedules",
    business: "/schedules/business",
  },

  // 🔥 ACTUALIZADO: Separación entre Citas Manuales (Admin) y Reservas (Cliente)
  appointments: "/appointments", // Admin (Manuales)
  
  bookings: {
    base: "/bookings",           // Crear (POST)
    me: "/bookings/me",          // Mis reservas (Cliente)
    availability: "/bookings/availability", // Consultar slots
    detail: (id: string) => `/bookings/${id}`,
    cancel: (id: string) => `/bookings/${id}/cancel`,
    reschedule: (id: string) => `/bookings/${id}/reschedule`,
  },

  // 🔥 ACTUALIZADO: Objeto para soportar /my
  ratings: {
    base: "/ratings",
    my: "/ratings/my",
  },
  
  // 🔥 ACTUALIZADO: Objeto para soportar /email (si existe)
  notifications: {
    base: "/notifications",
    email: "/notifications/email",
  },

  // 🔥 ACTUALIZADO: Objeto para reportes
  reports: {
    base: "/reports",
    summary: "/reports/summary",
  },

  // Catalogos (Tu estructura original mantenida)
  catalog: {
    base: "/catalog",
    // Rutas específicas basadas en tu catalog.routes.ts
    list: "/catalog",              // GET (con query params ?page=1&q=...)
    create: "/catalog",            // POST
    detail: (id: string) => `/catalog/${id}`, // GET, PUT, DELETE

    // Sub-recursos
    services: (id: string) => `/catalog/${id}/services`, // GET, PUT
    addServices: (id: string) => `/catalog/${id}/services/add`, // POST
    removeServices: (id: string) => `/catalog/${id}/services/remove`, // POST

    // Actions
    activate: (id: string) => `/catalog/${id}/activate`, // PATCH
    deactivate: (id: string) => `/catalog/${id}/deactivate`, // PATCH
  },
};

export const getAuthHeader = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};