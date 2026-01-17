import { Download, Calendar as CalendarIcon, Loader2, User as UserIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { useReportsLogic } from './useReportsLogic';
import { SummaryCards } from './SummaryCards';

import { RevenueChart } from './charts/RevenueChart';
import { RatingsChart } from './charts/RatingsChart';
import { StatusChart } from './charts/StatusChart';
import { TopServicesChart } from './charts/TopServicesChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useAuth } from '../../../contexts/auth';
import { useState } from 'react';
import { toast } from 'sonner';

export function ReportsAndStats() {
  const { user } = useAuth();
  const {
    stats,
    loading,
    dateRange,
    setDateRange,
    downloadPdf,
    selectedStylistId,
    setSelectedStylistId,
    stylists,
  } = useReportsLogic();

  const [dateError, setDateError] = useState<string>("");

  // Handler para inputs de fecha (formato YYYY-MM-DD nativo del input date)
  const handleDateChange = (field: 'from' | 'to', value: string) => {
    const newDateRange = { ...dateRange, [field]: value };
    
    // Validación 1: Ambas fechas deben estar completadas
    if (!newDateRange.from || !newDateRange.to) {
      const fieldName = field === 'from' ? 'inicial' : 'final';
      const errorMsg = `Debes completar ambas fechas. Falta la fecha ${fieldName}.`;
      setDateError(errorMsg);
      toast.error("Fechas incompletas", {
        description: errorMsg,
        style: { color: "black", background: "#ef4444" },
        descriptionClassName: "text-black",
      });
      return; // No actualizar si falta alguna fecha
    }
    
    // Validación 2: la fecha "to" no puede ser anterior a "from"
    if (newDateRange.from && newDateRange.to) {
      const fromDate = new Date(newDateRange.from);
      const toDate = new Date(newDateRange.to);
      
      if (toDate < fromDate) {
        const errorMsg = "La fecha final no puede ser anterior a la fecha inicial";
        setDateError(errorMsg);
        toast.error("Error en rango de fechas", {
          description: errorMsg,
          style: { color: "black", background: "#ef4444" },
          descriptionClassName: "text-black",
        });
        return; // No actualizar el estado si las fechas son inválidas
      }
    }
    
    // Si todo es válido, limpiar error y actualizar
    setDateError("");
    setDateRange(newDateRange);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* HEADER Y CONTROLES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg">
        <div>
          <h2 className="text-[#D4AF37] text-2xl font-bold tracking-tight">Panel de Reportes</h2>
          <p className="text-gray-500 text-sm">Visualiza el rendimiento basado en pagos confirmados</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selectores de Fecha con estilo unificado */}
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-gray-700 focus-within:border-[#D4AF37] transition-all">
            <CalendarIcon className="w-4 h-4 text-[#D4AF37] ml-1" />

            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange('from', e.target.value)}
              className="bg-transparent text-white text-sm outline-none border-none w-32 [color-scheme:dark] date-green"
            />

            <span className="text-gray-600 font-bold">→</span>

            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange('to', e.target.value)}
              className="bg-transparent text-white text-sm outline-none border-none w-32 [color-scheme:dark] date-green"
            />
          </div>

          {/* Selector de Estilista (solo admin/manager) */}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-gray-700">
              <UserIcon className="w-4 h-4 text-[#D4AF37] ml-1" />
              <Select
                value={selectedStylistId || ''}
                onValueChange={(v) => setSelectedStylistId(v || undefined)}
              >
                <SelectTrigger className="bg-transparent text-white border-none w-56">
                  <SelectValue placeholder="Seleccionar estilista" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white max-h-60">
                  {stylists.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.nombre} {s.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}


          {/* Botón Exportar PDF con estado de carga */}
          <Button
            variant="outline"
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black gap-2 h-10 transition-all active:scale-95"
            onClick={() => downloadPdf('GENERAL')}
            disabled={loading || !stats || !!dateError || !dateRange.from || !dateRange.to}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {loading ? "Procesando..." : "Exportar PDF General"}
          </Button>

          {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'stylist') && (
            <Button
              variant="outline"
              className="border-[#9D8EC1] text-[#9D8EC1] hover:bg-[#9D8EC1] hover:text-black gap-2 h-10 transition-all active:scale-95"
              onClick={() => downloadPdf('STYLIST')}
              disabled={loading || (user?.role !== 'stylist' && !selectedStylistId) || !!dateError || !dateRange.from || !dateRange.to}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {loading ? 'Procesando...' : 'Exportar PDF Estilista'}
            </Button>
          )}
        </div>
      </div>

      {/* ESTADO DE CARGA INICIAL O FILTRADO */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
          <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
          <p className="text-gray-400 animate-pulse">Consultando métricas en tiempo real...</p>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL - Solo se muestra si no está cargando o si ya hay datos */}
      {!loading && stats ? (
        <div className="space-y-6">
          <SummaryCards stats={stats} />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Gráfico de Línea (Ingresos diarios) */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-sm">
              <h3 className="text-gray-300 font-medium mb-4 ml-2">Tendencia de Ingresos ($)</h3>
              <RevenueChart data={stats.revenueData} />
            </div>

            {/* Gráfico de Barras (Desempeño Estilistas) */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-sm">
              <h3 className="text-gray-300 font-medium mb-4 ml-2">Rating por Estilista</h3>
              <RatingsChart data={stats.ratingsData} />
            </div>

            {/* Gráfico de Pastel (Distribución Operativa) */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-sm">
              <h3 className="text-gray-300 font-medium mb-4 ml-2">Estados de Reservas</h3>
              <StatusChart data={stats.appointmentsByStatus} />
            </div>

            {/* Gráfico Horizontal (Demanda de Servicios) */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-sm">
              <h3 className="text-gray-300 font-medium mb-4 ml-2">Servicios más Solicitados</h3>
              <TopServicesChart data={stats.topServicesData} />
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-500">No hay datos de pagos confirmados para este rango de fechas.</p>
          </div>
        )
      )}
    </div>
  );
}