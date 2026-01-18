// services/api.ts
import { API_BASE_URL, getAuthHeader } from "../config/api";
import { logger } from "./logger";
import { toast } from "sonner";

// Callback global para logout cuando token expira
let onTokenExpiredCallback: (() => void) | null = null;

export function setTokenExpiredCallback(callback: () => void) {
  onTokenExpiredCallback = callback;
}

// -------------------------
// 🔧 Tipos básicos
// -------------------------
export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

// -------------------------
// 🔧 Ayuda: construir URLs
// -------------------------
function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

// -------------------------
// 🔧 Centralizador de peticiones
// -------------------------
async function request<T>(
  method: string,
  url: string,
  body?: any,
  token?: string
): Promise<ApiResponse<T>> {
  try {
    logger.debug(`API Request: ${method} ${url}`, { body }, 'API');
    
    const res = await fetch(buildUrl(url), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(token),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const status = res.status;

    let payload: any = null;
    try {
      payload = await res.json().catch(() => null);
    } catch {
      payload = null;
    }

    if (!res.ok) {
      logger.warn(`API Error: ${method} ${url} - Status ${status}`, { error: payload?.error }, 'API');
      
      // Detectar errores de autenticación (token expirado o inválido)
      if (status === 401 || (status === 403 && payload?.message?.toLowerCase().includes('token'))) {
        logger.error('Token expired or invalid, triggering logout', { status }, 'API');
        
        // Mostrar mensaje al usuario
        toast.error('Sesión expirada', {
          description: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
          duration: 5000,
        });
        
        // Ejecutar callback de logout si está configurado
        if (onTokenExpiredCallback) {
          setTimeout(() => onTokenExpiredCallback?.(), 1000);
        }
      }
      
      return {
        ok: false,
        status,
        error: payload?.message || payload?.error || "Error de servidor",
      };
    }

    logger.debug(`API Success: ${method} ${url} - Status ${status}`, {}, 'API');
    return {
      ok: true,
      status,
      data: payload,
    };
  } catch (err: any) {
    logger.error(`API Network Error: ${method} ${url}`, { message: err?.message }, 'API');
    return {
      ok: false,
      status: 0,
      error: err?.message || "Error de red",
    };
  }
}

// ------------------------------
// 🧩 Métodos HTTP
// ------------------------------
export const api = {
  get: <T>(url: string, token?: string) =>
    request<T>("GET", url, undefined, token),

  post: <T>(url: string, body?: any, token?: string) =>
    request<T>("POST", url, body, token),

  put: <T>(url: string, body?: any, token?: string) =>
    request<T>("PUT", url, body, token),

  patch: <T>(url: string, body?: any, token?: string) =>
    request<T>("PATCH", url, body, token),

  delete: <T>(url: string, token?: string) =>
    request<T>("DELETE", url, undefined, token),
};

// ------------------------------
// 🔐 AUTH endpoints específicos
// ------------------------------
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (data: any) =>
    api.post("/auth/register", data),

  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),

  logout: (token: string) =>
    api.post("/auth/logout", null, token),

  googleSignIn: (idToken: string) =>
    api.post("/auth/google", { idToken }),

  sendVerification: (email: string) =>
    api.post("/auth/send-verification-email", { email }),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post("/auth/reset-password", { email, code, newPassword }),

  // Nota: tu backend NO tiene endpoint GET /auth/profile. Esto lo manejará AuthContext con el token.
};

// ------------------------------
// 👤 USER PROFILE (admin/me)
// ------------------------------
export const userApi = {
  getProfile: (token: string) =>
    api.get("/users/me", token),

  updateProfile: (token: string, data: any) =>
    api.put("/users/me", data, token),
};

