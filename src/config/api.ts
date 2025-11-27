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
  },

  users: {
    me: "/users/me",        // GET
    update: "/users/me",    // PUT
  },

  // Otros módulos
  services: "/services",
  stylists: "/stylists",
  schedules: "/schedules",
  appointments: "/bookings",
  ratings: "/ratings",
  notifications: "/notifications",
  reports: "/reports",


  //Catalogos
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
