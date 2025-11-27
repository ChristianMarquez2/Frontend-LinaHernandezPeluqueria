import { useReportsLogic } from './useReportsLogic';
import { SummaryCards } from './SummaryCards';
import { RevenueChart } from './charts/RatingsChart';
import { StatusChart } from './charts/StatusChart';
import { TopServicesChart } from './charts/TopServicesChart';
import { RatingsChart } from './charts/RevenueChart';

export function ReportsAndStats() {
  const { stats, stylists } = useReportsLogic();

  // Loading State
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96 text-[#D4AF37]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mr-2"></div>
        Cargando reportes del sistema...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-[#D4AF37] text-2xl font-semibold">Panel de Reportes</h2>
        <span className="text-gray-500 text-sm">Actualizado en tiempo real</span>
      </div>

      {/* Tarjetas de Resumen */}
      <SummaryCards 
        stats={stats} 
        activeStylistsCount={stylists.filter(s => s.isActive).length}
        totalStylistsCount={stylists.length}
      />

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart data={stats.revenueData} />
        <StatusChart data={stats.appointmentsByStatus} />
        <TopServicesChart data={stats.topServicesData} />
        <RatingsChart data={stats.ratingsData} />
      </div>
    </div>
  );
}