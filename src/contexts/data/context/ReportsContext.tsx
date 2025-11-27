import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";
import { dataService } from "../service";
import { ReportSummary } from "../types";

interface ReportsContextType {
  reports: ReportSummary | null;
  fetchReports: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("accessToken");
  const [reports, setReports] = useState<ReportSummary | null>(null);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    try {
      const data = await dataService.fetchReports(token);
      if (data) setReports(data);
      else toast.error("No se pudieron cargar los reportes");
    } catch (e) {
      console.error("❌ Error al cargar informes:", e);
      toast.error("Error cargando reportes");
    }
  }, [token]);

  return (
    <ReportsContext.Provider value={{ reports, fetchReports }}>
      {children}
    </ReportsContext.Provider>
  );
}

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) throw new Error("useReports debe usarse dentro de ReportsProvider");
  return context;
};