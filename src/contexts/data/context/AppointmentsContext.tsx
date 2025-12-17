import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/index";
import { dataService } from "../service";
import { Appointment, Booking } from "../types";

interface AppointmentsContextType {
  appointments: Appointment[]; // Citas manuales (Admin/Gerente)
  myBookings: Booking[];       // Mis reservas (Cliente)
  loading: boolean;
  
  refreshAppointments: () => Promise<void>; // Refresca Admin
  refreshMyBookings: () => Promise<void>;   // Refresca Cliente
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export function AppointmentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem("accessToken");
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
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
    if (!token) return;
    setLoading(true);
    try {
      const bookings = await dataService.fetchClientBookings(token);
      setMyBookings(bookings);
    } catch (err) {
      console.error("❌ Error al cargar mis reservas:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Efecto principal: Cargar datos según rol o login
  useEffect(() => {
    if (user && token) {
      // SOLUCIÓN AL ERROR: Forzamos la interpretación como string para evitar conflictos
      // si UserRole es un Enum o un tipo restrictivo.
      const userRole = user.role as string;

      // Si es cliente, priorizamos sus reservas
      if (userRole === 'CLIENTE') {
        refreshMyBookings();
      }
      
      // Si es Admin/Gerente/Estilista, cargamos las manuales
      if (['ADMIN', 'GERENTE', 'ESTILISTA'].includes(userRole)) {
        refreshAppointments();
      }
    }
  }, [user, token, refreshAppointments, refreshMyBookings]);

  return (
    <AppointmentsContext.Provider value={{ 
      appointments, 
      myBookings, 
      loading, 
      refreshAppointments, 
      refreshMyBookings 
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