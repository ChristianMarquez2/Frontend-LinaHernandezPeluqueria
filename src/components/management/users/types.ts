export type UserRole = "admin" | "manager" | "stylist" | "client";

export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: string; // Backend devuelve strings como "ADMIN", "GERENTE", etc.
  isActive: boolean;
  cedula?: string;
  telefono?: string;
  genero?: string;
  edad?: number;
  createdAt: string;
}

export interface UserFormData {
  nombre: string;
  apellido: string;
  email: string;
  role: string;
  password: string;
  isActive: boolean;
  cedula: string;
  telefono: string;
  genero: string;
  edad: string;
}

export interface ValidationErrors {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  email?: string;
  password?: string;
  telefono?: string;
  genero?: string;
  edad?: string;
}

// 🛠️ Utilidades de Mapeo de Roles
export const mapRoleToBackend = (r: string | undefined): string | undefined => {
  if (!r) return undefined;
  const rr = r.toLowerCase();
  if (rr === "admin") return "ADMIN";
  if (rr === "manager") return "GERENTE";
  if (rr === "stylist") return "ESTILISTA";
  return undefined; // Cliente u otros
};

export const mapRoleFromBackend = (r: string | undefined): UserRole | "" => {
  if (!r) return "";
  const R = r.toString().toUpperCase();
  if (R.includes("ADMIN")) return "admin";
  if (R.includes("GERENTE") || R.includes("MANAGER")) return "manager";
  if (R.includes("ESTILISTA") || R.includes("STYLIST")) return "stylist";
  return "client";
};