// services/users.ts
import { api } from "./api";
import { API_BASE_URL } from "../config/api";

export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono?: string;
  genero?: "M" | "F" | "O" | string;
  edad?: number;
  email: string;
  role: "admin" | "manager" | "stylist" | "client";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

// 🔹 Mapea rol del backend → frontend
function mapRole(role: string): User["role"] {
  const roleMap: Record<string, User["role"]> = {
    ADMIN: "admin",
    GERENTE: "manager",
    ESTILISTA: "stylist",
    CLIENTE: "client",
  };
  return roleMap[role] || "client";
}

// ---------------------------------------------
// 🔹 Obtener todos los usuarios (ADMIN)
// ---------------------------------------------
export async function getAllUsers(
  page = 1,
  limit = 20,
  token?: string
): Promise<PaginatedResponse<User> | null> {
  
  const res = await api.get<PaginatedResponse<any>>(
    `/users?page=${page}&limit=${limit}`,
    token
  );

  if (!res.ok || !res.data) {
    console.error("❌ Error getAllUsers:", res.error);
    return null;
  }

  const mapped = res.data.data.map((u: any) => ({
    ...u,
    role: mapRole(u.role),
  }));

  return {
    data: mapped,
    meta: res.data.meta,
  };
}


// ---------------------------------------------
// 🔹 Crear usuario (solo admin)
// ---------------------------------------------
export async function createUser(newUser: Partial<User>, token?: string) {
  const res = await api.post("/users", newUser, token);

  if (!res.ok) throw new Error(res.error);
  return res.data;
}

// ---------------------------------------------
// 🔹 Actualizar perfil de usuario (ADMIN/GERENTE)
// ---------------------------------------------
export async function updateUserProfile(
  id: string,
  updates: Partial<Pick<User, 'nombre' | 'apellido' | 'cedula' | 'telefono' | 'genero' | 'edad'>> & { password?: string },
  token?: string
) {
  const res = await api.put(`/users/${id}/profile`, updates, token);

  if (!res.ok) throw new Error(res.error);
  return res.data;
}

// ---------------------------------------------
// 🔹 Desactivar usuario (soft delete)
// ---------------------------------------------
export async function deactivateUser(id: string, token?: string) {
  const res = await api.patch(`/users/${id}/deactivate`, {}, token);

  if (!res.ok) throw new Error(res.error);
  return res.data;
}

// ---------------------------------------------
// 🔹 Activar usuario
// ---------------------------------------------
export async function activateUser(id: string, token?: string) {
  const res = await api.patch(`/users/${id}/activate`, {}, token);

  if (!res.ok) throw new Error(res.error);
  return res.data;
}