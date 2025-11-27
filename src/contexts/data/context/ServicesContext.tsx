import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/index";
import { dataService } from "../service";
import { Service, Stylist, BusinessHours } from "../types";

interface ServicesContextType {
  services: Service[];
  stylists: Stylist[];
  businessHours: BusinessHours | null;
  refreshServices: () => Promise<void>;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem("accessToken");

  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);

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
      console.error("Error cargando datos estáticos:", err);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      refreshServices();
    }
  }, [user, token, refreshServices]);

  return (
    <ServicesContext.Provider value={{ services, stylists, businessHours, refreshServices }}>
      {children}
    </ServicesContext.Provider>
  );
}

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) throw new Error("useServices must be used within ServicesProvider");
  return context;
};