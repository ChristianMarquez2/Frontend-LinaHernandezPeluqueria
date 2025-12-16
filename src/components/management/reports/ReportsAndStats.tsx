import { Download, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';
import { useReportsLogic } from './useReportsLogic';
import { SummaryCards } from './SummaryCards';

// Asegúrate de que los imports de los gráficos apunten a los archivos correctos (abajo los defino)
import { RevenueChart } from './charts/RevenueChart';
import { RatingsChart } from './charts/RatingsChart'; 
import { StatusChart } from './charts/StatusChart';
import { TopServicesChart } from './charts/TopServicesChart';

export function ReportsAndStats() {
  const { stats, loading, dateRange, setDateRange, downloadPdf } = useReportsLogic();

  // Handler simple para inputs de fecha
  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setDateRange({ ...dateRange, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER Y CONTROLES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 p-4 rounded-lg border border-gray-800">
        <div>
           <h2 className="text-[#D4AF37] text-2xl font-semibold">Panel de Reportes</h2>
           <p className="text-gray-500 text-sm">Métricas clave del negocio</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           {/* Selectores de Fecha */}
           <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-md border border-gray-700">
              <CalendarIcon className="w-4 h-4 text-gray-400 ml-1" />
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="bg-transparent text-white text-sm outline-none border-none w-32"
              />
              <span className="text-gray-500">-</span>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="bg-transparent text-white text-sm outline-none border-none w-32"
              />
           </div>

           {/* Botón PDF */}
           <Button 
             variant="outline" 
             className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black gap-2"
             onClick={() => downloadPdf('GENERAL')}
             disabled={loading}
           >
             <Download className="w-4 h-4" />
             {loading ? "Generando..." : "Exportar PDF"}
           </Button>
        </div>
      </div>

      {/* ESTADO DE CARGA O ERROR */}
      {loading && !stats && (
        <div className="flex items-center justify-center h-64 text-[#D4AF37]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mr-2"></div>
          Cargando datos actualizados...
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      {stats && (
        <>
          <SummaryCards stats={stats} />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Gráfico de Línea (Ingresos) */}
            <RevenueChart data={stats.revenueData} />
            
            {/* Gráfico de Barras (Satisfacción) */}
            <RatingsChart data={stats.ratingsData} />
            
            {/* Gráfico de Pastel (Estados) */}
            <StatusChart data={stats.appointmentsByStatus} />
            
            {/* Gráfico Horizontal (Servicios) */}
            <TopServicesChart data={stats.topServicesData} />
          </div>
        </>
      )}
    </div>
  );
}