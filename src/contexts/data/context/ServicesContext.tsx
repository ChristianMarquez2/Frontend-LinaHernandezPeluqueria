import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/index";
import { dataService } from "../service";
import { Service, Stylist, BusinessHours, DashboardSummary } from "../types";

interface ServicesContextType {
  services: Service[];
  stylists: Stylist[];
  businessHours: BusinessHours | null;
  refreshServices: () => Promise<void>;
  /** * Obtiene el resumen estadístico del local para un rango de fechas.
   * Formato esperado: "YYYY-MM-DD"
   */
  getDashboardData: (from: string, to: string) => Promise<DashboardSummary | null>;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // Es mejor obtener el token directamente para asegurar que esté actualizado
  const token = localStorage.getItem("accessToken");

  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);

  /**
   * Carga o refresca los datos estáticos (Servicios, Estilistas, Horarios del Local)
   */
  const refreshServices = useCallback(async () => {
    if (!token) return;
    try {
      const [srv, sty, bus] = await Promise.all([
        dataService.fetchServices(token),
        dataService.fetchStylists(token),
        dataService.fetchBusinessHours(token),
      ]);
      setServices(srv);
      setStylists(sty);
      setBusinessHours(bus);
    } catch (err) {
      console.error("Error cargando datos estáticos del salón:", err);
    }
  }, [token]);

  /**
   * Consulta al backend los reportes de ingresos y métricas.
   * Nota: Este método no guarda estado global para permitir diferentes rangos en la UI.
   */
  const getDashboardData = useCallback(async (from: string, to: string) => {
    if (!token) return null;
    try {
      return await dataService.fetchDashboardSummary(token, { from, to });
    } catch (err) {
      console.error("Error al obtener datos del dashboard:", err);
      return null;
    }
  }, [token]);

  // Efecto de carga inicial al autenticarse
  useEffect(() => {
    if (user && token) {
      refreshServices();
    }
  }, [user, token, refreshServices]);

  return (
    <ServicesContext.Provider 
      value={{ 
        services, 
        stylists, 
        businessHours, 
        refreshServices, 
        getDashboardData 
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
}

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices debe ser usado dentro de un ServicesProvider");
  }
  return context;
};