import { useCallback } from "react";
import { useServices } from "../data/context/ServicesContext";
import { useAppointments } from "../data/context/AppointmentsContext";
import { useRatings } from "../data/context/RatingsContext";
import { useNotifications } from "../data/context/NotificationsContext";
import { useReports } from "../data/context/ReportsContext";
import { DataContextType } from "./types"; 

export function useData(): DataContextType {
  // 1. Inyectamos todos los sub-contextos
  const { services, stylists, businessHours, refreshServices } = useServices();
  const { appointments, myBookings, stylistBookings, refreshAppointments, refreshMyBookings, refreshStylistBookings } = useAppointments();
  const { ratings, createRating, refreshRatings } = useRatings();
  const { notifications, getUserNotifications, refreshNotifications } = useNotifications();
  const { dashboardData, refreshReports } = useReports();

  // 2. Función monolítica para recargar TODO (útil para "pull-to-refresh")
  const fetchData = useCallback(async () => {
    // Ejecutamos en paralelo para máxima velocidad
    await Promise.allSettled([
      refreshServices(),
      refreshAppointments(),
      refreshMyBookings(),
      refreshStylistBookings(),
      refreshRatings(),
      refreshNotifications(),
      refreshReports()
    ]);
  }, [
    refreshServices, 
    refreshAppointments, 
    refreshMyBookings,
    refreshStylistBookings,
    refreshRatings, 
    refreshNotifications, 
    refreshReports
  ]);

  // 3. Devolvemos el objeto plano que esperan tus componentes antiguos
  return {
    services,
    stylists,
    businessHours,
    appointments,
    myBookings,
    stylistBookings,
    ratings,
    notifications,
    // Mantenemos 'reports' apuntando a dashboardData para no romper tipos
    reports: dashboardData as any, 
    fetchData,
    fetchReports: refreshReports, // Alias por compatibilidad
    getUserNotifications,
    createRating,
  };
}