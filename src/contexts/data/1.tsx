import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext"; 
import { dataService } from "./service";
import { normalizeServicesOffered } from "./utils";
import { 
  DataContextType, 
  Service, 
  Stylist, 
  BusinessHours, 
  Appointment, 
  Rating, 
  Notification, 
  ReportSummary,
  CreateRatingPayload 
} from "./types";

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem("accessToken");

  // --- ESTADO ---
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);
  
  // Aquí TypeScript usará la nueva interfaz Appointment
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reports, setReports] = useState<ReportSummary | null>(null);

  // --- ACCIONES ---

  // 🔄 FETCH GENERAL
  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      const data = await dataService.fetchInitialData(token);

      // Asignación directa
      if (data.services) setServices(data.services);
      if (data.businessHours) setBusinessHours(data.businessHours);
      
      // data.appointments vendrá con la estructura nueva gracias a service.ts
      if (data.appointments) setAppointments(data.appointments);
      
      if (data.ratings) setRatings(data.ratings);
      if (data.notifications) setNotifications(data.notifications);

      // Lógica específica para Estilistas (Normalización)
      if (data.stylists) {
        const rawList = Array.isArray(data.stylists) ? data.stylists : (data.stylists as any).data || [];
        const normalizedStylists = rawList.map((s: any) => ({
          ...s,
          servicesOffered: normalizeServicesOffered(s.servicesOffered ?? []),
        }));
        setStylists(normalizedStylists);
      }

    } catch (err) {
      console.error("❌ Error general en DataContext:", err);
    }
  }, [token]);

  // 📊 FETCH REPORTES
  const fetchReports = useCallback(async () => {
    if (!token) return;
    const data = await dataService.fetchReports(token);
    if (data) setReports(data);
    else toast.error("No se pudieron cargar los reportes");
  }, [token]);

  // ⭐ CREAR RATING
  const createRating = async (payload: CreateRatingPayload): Promise<boolean> => {
    if (!token) return false;
    try {
      const newRating = await dataService.createRating(token, payload);
      setRatings((prev) => [newRating, ...prev]);
      return true;
    } catch (error: any) {
      console.error("Create rating error:", error);
      toast.error(error.message);
      return false;
    }
  };

  // 🔔 HELPER NOTIFICACIONES
  const getUserNotifications = useCallback(
    (userId: string) => notifications.filter((n) => n.userId === userId),
    [notifications]
  );

  // ▶ Cargar datos al iniciar si hay usuario
  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  return (
    <DataContext.Provider
      value={{
        services,
        stylists,
        businessHours,
        appointments,
        ratings,
        notifications,
        reports,
        fetchData,
        fetchReports,
        getUserNotifications,
        createRating,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}

// Re-exportar interfaces para uso en componentes
export type { Appointment } from "./types";