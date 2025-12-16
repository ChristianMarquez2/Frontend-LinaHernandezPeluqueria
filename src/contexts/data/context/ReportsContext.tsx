import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { dataService } from "../service";
import { DashboardSummary, StylistReportResponse, ReportRangeParams } from "../types";
import { useAuth } from "../../auth"; // Asumo que tienes esto para saber el rol

interface ReportsContextType {
  // Estado de Datos
  dashboardData: DashboardSummary | null;
  stylistReportData: StylistReportResponse | null;
  
  // Estado de Filtros
  dateRange: { from: string; to: string };
  setDateRange: (range: { from: string; to: string }) => void;
  selectedStylistId: string | undefined; // Para filtrar un estilista específico en admin
  setSelectedStylistId: (id: string | undefined) => void;
  
  // Acciones
  loading: boolean;
  refreshReports: () => Promise<void>;
  downloadPdf: (type: 'GENERAL' | 'STYLIST') => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Helper para obtener el primer y último día del mes actual
const getCurrentMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: firstDay.toISOString().split('T')[0],
    to: lastDay.toISOString().split('T')[0]
  };
};

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("accessToken");
  const { user } = useAuth();
  
  // Estados de datos
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [stylistReportData, setStylistReportData] = useState<StylistReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados de filtros (Por defecto: mes actual)
  const [dateRange, setDateRange] = useState(getCurrentMonthRange());
  const [selectedStylistId, setSelectedStylistId] = useState<string | undefined>(undefined);

  const refreshReports = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);

    const params: ReportRangeParams = {
      from: dateRange.from,
      to: dateRange.to,
      stylistId: selectedStylistId
    };

    try {
      const userRole = (user.role || '').toString().toUpperCase();

      if (userRole === 'ADMIN' || userRole === 'GERENTE') {
        // Cargar Dashboard General
        const dash = await dataService.fetchDashboardSummary(token, params);
        setDashboardData(dash);

        // Si se quiere ver detalle de estilistas (o de uno específico)
        const styl = await dataService.fetchStylistReports(token, params);
        setStylistReportData(styl);
      
      } else if (userRole === 'ESTILISTA') {
        // Estilista solo ve SU reporte
        const personal = await dataService.fetchStylistReports(token, params, true);
        setStylistReportData(personal);
        setDashboardData(null); // Estilista no ve dashboard financiero global
      }

    } catch (e) {
      console.error("Error loading reports", e);
      toast.error("Error actualizando reportes");
    } finally {
      setLoading(false);
    }
  }, [token, user, dateRange, selectedStylistId]);

  // Cargar al montar o cambiar filtros
  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  // Función para descargar PDF
  const downloadPdf = async (type: 'GENERAL' | 'STYLIST') => {
    if (!token) return;
    const toastId = toast.loading("Generando PDF...");
    
    try {
      const params: ReportRangeParams = {
        from: dateRange.from,
        to: dateRange.to,
        stylistId: selectedStylistId
      };
      
      let blob: Blob | null = null;
      const isPersonal = user?.role === 'stylist';

      if (type === 'GENERAL' && !isPersonal) {
        blob = await dataService.downloadGeneralReportPDF(token, params);
      } else {
        blob = await dataService.downloadStylistReportPDF(token, params, isPersonal);
      }

      if (blob) {
        // Crear link temporal para descargar
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${type.toLowerCase()}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("PDF descargado correctamente");
      } else {
        toast.error("No se pudo generar el PDF");
      }
    } catch (e) {
      toast.error("Error en la descarga");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <ReportsContext.Provider value={{ 
      dashboardData, 
      stylistReportData, 
      dateRange, 
      setDateRange,
      selectedStylistId,
      setSelectedStylistId,
      loading,
      refreshReports,
      downloadPdf
    }}>
      {children}
    </ReportsContext.Provider>
  );
}

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) throw new Error("useReports debe usarse dentro de ReportsProvider");
  return context;
};