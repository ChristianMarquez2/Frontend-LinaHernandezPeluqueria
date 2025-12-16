import { useEffect, useMemo } from 'react';
import { useReports } from '../../../contexts/data/context/ReportsContext'; // Asegúrate de importar del contexto nuevo
import { useServices } from '../../../contexts/data/context/ServicesContext'; // Para nombres de servicios si hiciera falta

export interface ReportStats {
  appointmentsByStatus: { name: string; value: number }[];
  topServicesData: { name: string; count: number }[];
  revenueData: { date: string; revenue: number }[]; // Cambiado 'month' a 'date' pues ahora es diario/rango
  ratingsData: { name: string; rating: number; reviews: number }[];
  
  totalRevenue: number;
  totalAppointments: number;
  completedCount: number;
  averageRating: number;
  totalReviews: number;
  paidBookings: number;
}

export function useReportsLogic() {
  // Consumimos el nuevo contexto específico de reportes
  const { 
    dashboardData, 
    dateRange, 
    setDateRange, 
    refreshReports, 
    loading, 
    downloadPdf 
  } = useReports();
  
  const { services } = useServices();

  // refreshReports ya se llama en el useEffect del Provider, 
  // pero si quisieras forzar recarga al montar este componente específico:
  useEffect(() => {
    if (!dashboardData) {
      refreshReports();
    }
  }, [refreshReports, dashboardData]);

  const stats = useMemo<ReportStats | null>(() => {
    if (!dashboardData) return null;

    // A. Citas por Estado
    const appointmentsByStatus = dashboardData.bookingsByStatus.map((item) => {
      let name = item._id || 'Desconocido';
      const mapNames: Record<string, string> = {
        'COMPLETED': 'Completada',
        'SCHEDULED': 'Programada',
        'CANCELLED': 'Cancelada',
        'PENDING': 'Pendiente',
        'CONFIRMED': 'Confirmada',
        'NO_SHOW': 'No Asistió'
      };
      return { name: mapNames[name] || name, value: item.count };
    });

    // B. Servicios Populares
    const topServicesData = dashboardData.topServices.map((item) => {
      // El backend ya devuelve serviceName en el nuevo endpoint, usamos ese
      return { name: item.serviceName || 'Desconocido', count: item.bookingsCount };
    });

    // C. Tendencia de Ingresos (Ahora es por día o el rango que devuelva el backend)
    const revenueData = dashboardData.revenueByDay.map((item) => {
        // item.day viene como "YYYY-MM-DD"
        const [year, month, day] = item.day.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return {
            // Formateamos para que se vea bien en el eje X (ej: 16 Dic)
            date: dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            revenue: item.total
        };
    });

    // D. Calificación por Estilista
    const ratingsData = dashboardData.ratingsByStylist.map((item) => ({
      name: item.stylistName,
      rating: parseFloat(item.avgRating.toFixed(1)),
      reviews: item.ratingsCount
    }));

    // E. Totales Generales
    const totalRevenue = dashboardData.totals.totalRevenue;
    const paidBookings = dashboardData.totals.totalPaidBookings;
    
    // Calculamos totales de citas basados en el gráfico de estados
    const totalAppointments = dashboardData.bookingsByStatus.reduce((acc, curr) => acc + curr.count, 0);
    const completedCount = dashboardData.bookingsByStatus.find(s => s._id === 'COMPLETED')?.count || 0;

    // Promedio general de rating
    let totalStars = 0;
    let totalReviews = 0;
    dashboardData.ratingsByStylist.forEach(r => {
      totalStars += r.avgRating * r.ratingsCount;
      totalReviews += r.ratingsCount;
    });
    const averageRating = totalReviews > 0 ? (totalStars / totalReviews) : 0;

    return {
      appointmentsByStatus,
      topServicesData,
      revenueData,
      ratingsData,
      totalRevenue,
      totalAppointments,
      completedCount,
      averageRating,
      totalReviews,
      paidBookings
    };
  }, [dashboardData]);

  return { 
    stats, 
    loading, 
    dateRange, 
    setDateRange, 
    downloadPdf 
  }; 
}