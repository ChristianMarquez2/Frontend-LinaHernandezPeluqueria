import { User, UserRole } from "./types";

// Normaliza el rol del Backend al Frontend
export function mapRole(role?: string | null): UserRole {
  if (!role) return "client";
  
  const r = role.toUpperCase().trim();
  
  // Mapeo robusto
  if (r.includes("ADMIN")) return "admin";
  if (r.includes("GERENTE") || r.includes("MANAGER")) return "manager";
  
  // Aquí capturamos el rol en español del backend y lo volvemos 'stylist'
  if (r === "ESTILISTA" || r.includes("STYLIST")) return "stylist";
  
  return "client";
}

export function normalizeUser(raw: any): User {
  // Manejo seguro de ID (backend usa _id, frontend usa id)
  const id = raw.id || raw._id || "";

  return {
    id: id,
    email: raw.email || "",
    firstName: raw.nombre || raw.firstName || "",
    lastName: raw.apellido || raw.lastName || "",
    phone: raw.telefono || raw.phone || "",
    cedula: raw.cedula || "",
    gender: raw.genero || raw.gender || "",
    emailVerified: raw.emailVerified || false,
    provider: raw.provider === "google" ? "google" : "local",
    
    // 🔥 Aquí aplicamos la normalización del rol
    role: mapRole(raw.role),
    
    isActive: typeof raw.isActive !== 'undefined' ? raw.isActive : true,
  };
}