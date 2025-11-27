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
  const { appointments, refreshAppointments } = useAppointments();
  const { ratings, createRating, refreshRatings } = useRatings();
  const { notifications, getUserNotifications, refreshNotifications } = useNotifications();
  const { reports, fetchReports } = useReports();

  // Reconstruimos la función fetchData "monolítica" para compatibilidad
  const fetchData = useCallback(async () => {
    // Disparamos todas las cargas en paralelo
    await Promise.all([
      refreshServices(),
      refreshAppointments(),
      refreshRatings(),
      refreshNotifications()
    ]);
  }, [refreshServices, refreshAppointments, refreshRatings, refreshNotifications]);

  return {
    services,
    stylists,
    businessHours,
    appointments,
    ratings,
    notifications,
    reports,
    fetchData,          // Versión combinada
    fetchReports,       // Directo del contexto
    getUserNotifications,
    createRating,
  };
}