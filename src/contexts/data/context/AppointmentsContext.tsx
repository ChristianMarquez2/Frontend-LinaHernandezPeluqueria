import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/index";
import { dataService } from "../service";
import { Appointment, Booking } from "../types";

interface AppointmentsContextType {
  appointments: Appointment[]; // Citas manuales (Admin/Gerente)
  myBookings: Booking[];       // Mis reservas (Cliente)
  stylistBookings: Booking[];  // Citas del estilista
  loading: boolean;
  
  refreshAppointments: () => Promise<void>; // Refresca Admin
  refreshMyBookings: () => Promise<void>;   // Refresca Cliente
  refreshStylistBookings: () => Promise<void>; // Refresca Estilista
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export function AppointmentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem("accessToken");
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [stylistBookings, setStylistBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Cargar Citas Manuales (Admin / General / Estilista)
  const refreshAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const appts = await dataService.fetchManualAppointments(token);
      setAppointments(appts);
    } catch (err) {
      console.error("❌ Error al cargar citas manuales:", err);
    }
  }, [token]);

  // 2. Cargar Mis Reservas (Cliente)
  const refreshMyBookings = useCallback(async () => {
    if (!token) {
      console.warn("⚠️ refreshMyBookings: No hay token disponible");
      return;
    }
    
    // Verificar que el usuario sea cliente
    const userRole = (user?.role as string)?.toUpperCase() || "";
    if (userRole !== 'CLIENTE' && userRole !== 'CLIENT') {
      console.log("ℹ️ refreshMyBookings: Usuario no es cliente (rol:", userRole + "), ignorando");
      return;
    }
    
    setLoading(true);
    try {
      const bookings = await dataService.fetchClientBookings(token);
      setMyBookings(bookings);
    } catch (err) {
      console.error("❌ Error al cargar mis reservas:", err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  // 3. Cargar Citas del Estilista
  const refreshStylistBookings = useCallback(async () => {
    if (!token) {
      console.warn("⚠️ refreshStylistBookings: No hay token disponible");
      return;
    }
    
    // Verificar que el usuario sea estilista
    const userRole = (user?.role as string)?.toUpperCase() || "";
    if (userRole !== 'ESTILISTA' && userRole !== 'STYLIST') {
      console.log("ℹ️ refreshStylistBookings: Usuario no es estilista (rol:", userRole + "), ignorando");
      return;
    }
    
    setLoading(true);
    try {
      const bookings = await dataService.fetchStylistBookings(token);
      setStylistBookings(bookings);
      console.log("✅ Citas del estilista cargadas:", bookings.length);
    } catch (err) {
      console.error("❌ Error al cargar citas del estilista:", err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  // Efecto principal: Cargar datos según rol o login
  useEffect(() => {
    if (user && token) {
      // SOLUCIÓN AL ERROR: Forzamos la interpretación como string para evitar conflictos
      // si UserRole es un Enum o un tipo restrictivo.
      const userRole = (user.role as string)?.toUpperCase() || "";

      console.log("👤 AppointmentsContext - Usuario:", user.email, "Rol:", userRole);

      // Si es cliente, priorizamos sus reservas
      if (userRole === 'CLIENTE' || userRole === 'CLIENT') {
        console.log("📌 Cargando reservas de cliente...");
        refreshMyBookings();
      }
      
      // Si es estilista, cargamos sus citas
      if (userRole === 'ESTILISTA' || userRole === 'STYLIST') {
        console.log("📌 Cargando citas del estilista...");
        refreshStylistBookings();
      }
      
      // Si es Admin/Gerente/Estilista, cargamos las manuales
      if (['ADMIN', 'GERENTE', 'MANAGER'].includes(userRole)) {
        console.log("📌 Cargando citas manuales para admin/gerente...");
        refreshAppointments();
      }

      if (!['CLIENTE', 'CLIENT', 'ADMIN', 'GERENTE', 'ESTILISTA', 'MANAGER', 'STYLIST'].includes(userRole)) {
        console.warn("⚠️ Rol no reconocido:", userRole);
      }
    } else {
      console.log("⚠️ AppointmentsContext: user o token no disponibles", { user, hasToken: !!token });
    }
  }, [user, token, refreshAppointments, refreshMyBookings, refreshStylistBookings]);

  return (
    <AppointmentsContext.Provider value={{ 
      appointments, 
      myBookings, 
      stylistBookings,
      loading, 
      refreshAppointments, 
      refreshMyBookings,
      refreshStylistBookings
    }}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) throw new Error("useAppointments debe usarse dentro de AppointmentsProvider");
  return context;
};