import { API_BASE_URL, API_ENDPOINTS } from "../../config/api";
import { User } from "./types";

const headersJson = { "Content-Type": "application/json" };
const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

// Helper para manejar respuestas y errores
const handleResponse = async (res: Response) => {
  let data;
  try {
    data = await res.json();
  } catch (error) {
    // Si el backend no devuelve JSON (ej. 500 error server), devolvemos null
    data = null;
  }

  if (!res.ok) {
    // ⚠️ AQUÍ ESTÁ LA CLAVE: 
    // Buscamos el mensaje de error del backend para lanzarlo
    const errorMessage = data?.message || data?.error || "Error en la petición";
    throw new Error(errorMessage);
  }

  // Si tu backend devuelve todo dentro de una propiedad "data" (ej: { ok: true, data: {...} })
  // deberías retornar data.data. Si devuelve directo el objeto, retorna data.
  // Basado en tu primer prompt, parece que tu backend devuelve la data directa en auth.
  return data;
};

export const authService = {
  login: async (email: string, password: string) => {
    const res = await fetch(API_BASE_URL + API_ENDPOINTS.auth.login, {
      method: "POST",
      headers: headersJson,
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  googleSignIn: async (idToken: string) => {
    const res = await fetch(API_BASE_URL + API_ENDPOINTS.auth.googleSignIn, {
      method: "POST",
      headers: headersJson,
      body: JSON.stringify({ idToken }),
    });
    return handleResponse(res);
  },

  register: async (data: any) => {
    const res = await fetch(API_BASE_URL + API_ENDPOINTS.auth.register, {
      method: "POST",
      headers: headersJson,
      body: JSON.stringify(data),
    });
    // Register usualmente solo necesitamos saber si fue OK o falló
    if (!res.ok) {
       const errData = await res.json().catch(() => ({}));
       throw new Error(errData.message || "Error al registrarse");
    }
    return true; 
  },

  getMe: async (token: string) => {
    const res = await fetch(API_BASE_URL + API_ENDPOINTS.users.me, {
      headers: authHeader(token),
    });
    return handleResponse(res);
  },

  refreshToken: async (refreshToken: string) => {
    const res = await fetch(API_BASE_URL + API_ENDPOINTS.auth.refresh, {
      method: "POST",
      headers: headersJson,
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse(res);
  },

  logout: async (token: string) => {
    // Logout suele ser "fire and forget", no esperamos respuesta estricta
    await fetch(API_BASE_URL + API_ENDPOINTS.auth.logout, {
      method: "POST",
      headers: authHeader(token),
    }).catch(err => console.error("Error de cierre de sesión", err));
  },

  updateProfile: async (token: string, data: Partial<User>) => {
    const res = await fetch(API_BASE_URL + API_ENDPOINTS.users.update, {
      method: "PUT",
      headers: { ...headersJson, ...authHeader(token) },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  sendVerificationEmail: async (email: string) => {
    const res = await fetch(API_BASE_URL + API_ENDPOINTS.auth.sendVerification, {
      method: "POST",
      headers: headersJson,
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Error enviando correo");
    return true;
  },

  forgotPassword: async (email: string) => {
    const res = await fetch(API_BASE_URL + API_ENDPOINTS.auth.forgotPassword, {
      method: "POST",
      headers: headersJson,
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Error en solicitud");
    return true;
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const res = await fetch(API_BASE_URL + API_ENDPOINTS.auth.resetPassword, {
      method: "POST",
      headers: headersJson,
      body: JSON.stringify({ email, code, newPassword }),
    });
    if (!res.ok) throw new Error("Error reseteando contraseña");
    return true;
  },
};