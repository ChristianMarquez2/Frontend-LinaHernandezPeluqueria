import { useCallback } from "react";
import { useServices } from "../data/context/ServicesContext";
import { useAppointments } from "../data/context/AppointmentsContext";
import { useRatings } from "../data/context/RatingsContext";
import { useNotifications } from "../data/context/NotificationsContext";
import { useReports } from "../data/context/ReportsContext";

// Interface para mantener compatibilidad exacta con lo que esperaban tus componentes
import { DataContextType } from "./types"; 

export function useData(): DataContextType {
  const { services, stylists, businessHours, refreshServices } = useServices();
  // 🔥 CORRECCIÓN: Extraemos también 'myBookings' y 'refreshMyBookings'
  const { appointments, myBookings, refreshAppointments, refreshMyBookings } = useAppointments();
  const { ratings, createRating, refreshRatings } = useRatings();
  const { notifications, getUserNotifications, refreshNotifications } = useNotifications();
  const { reports, fetchReports } = useReports();

  // Reconstruimos la función fetchData "monolítica" para compatibilidad
  const fetchData = useCallback(async () => {
    // Disparamos todas las cargas en paralelo
    await Promise.all([
      refreshServices(),
      refreshAppointments(),
      refreshMyBookings(), // Agregamos el refresco de mis reservas
      refreshRatings(),
      refreshNotifications()
    ]);
  }, [refreshServices, refreshAppointments, refreshMyBookings, refreshRatings, refreshNotifications]);

  return {
    services,
    stylists,
    businessHours,
    
    appointments, // Citas manuales (Admin)
    myBookings,   // 🔥 CORRECCIÓN: Agregamos la propiedad faltante (Cliente)

    ratings,
    notifications,
    reports,
    
    fetchData,          // Versión combinada
    fetchReports,       // Directo del contexto
    getUserNotifications,
    createRating,
  };
}