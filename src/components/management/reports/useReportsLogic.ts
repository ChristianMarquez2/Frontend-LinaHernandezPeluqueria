import { useEffect, useMemo } from 'react';
import { useReports } from '../../../contexts/data/context/ReportsContext';
import { useServices } from '../../../contexts/data/context/ServicesContext';

export interface ReportStats {
  appointmentsByStatus: { name: string; value: number }[];
  topServicesData: { name: string; count: number }[];
  revenueData: { date: string; revenue: number }[];
  ratingsData: { name: string; rating: number; reviews: number }[];
  totalRevenue: number;
  totalAppointments: number;
  completedCount: number;
  averageRating: number;
  totalReviews: number;
  paidBookings: number;
}

export function useReportsLogic() {
  const { dashboardData, dateRange, setDateRange, refreshReports, loading, downloadPdf } = useReports();
  const { services } = useServices();

  useEffect(() => {
    if (!dashboardData) refreshReports();
  }, [refreshReports, dashboardData]);

  const stats = useMemo<ReportStats | null>(() => {
    if (!dashboardData) return null;

    // A. Citas por Estado (Mapeo exacto al backend)
    const mapNames: Record<string, string> = {
      'COMPLETED': 'Completada',
      'SCHEDULED': 'Programada',
      'CANCELLED': 'Cancelada',
      'CONFIRMED': 'Confirmada',
      'NO_SHOW': 'No Asistió',
      'IN_PROGRESS': 'En Curso',
      'PENDING_STYLIST_CONFIRMATION': 'Pendiente Stylist'
    };

    const appointmentsByStatus = dashboardData.bookingsByStatus.map((item) => ({
      name: mapNames[item._id] || item._id || 'Otros',
      value: item.count
    }));

    // B. Servicios Populares (Usando serviceName del backend)
    const topServicesData = dashboardData.topServices.map((item) => ({
      name: item.serviceName || 'Servicio Eliminado',
      count: item.bookingsCount
    }));

    // C. Tendencia de Ingresos (Formato Ecuador)
    const revenueData = dashboardData.revenueByDay.map((item) => {
      const [year, month, day] = item.day.split('-');
      // Mes -1 porque en JS los meses van de 0 a 11
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return {
        date: dateObj.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }),
        revenue: item.total
      };
    });

    // D. Ratings por Estilista
    const ratingsData = dashboardData.ratingsByStylist.map((item) => ({
      name: item.stylistName,
      rating: parseFloat(item.avgRating.toFixed(1)),
      reviews: item.ratingsCount
    }));

    // E. Totales y Promedios
    const totalRevenue = dashboardData.totals.totalRevenue;
    const paidBookings = dashboardData.totals.totalPaidBookings;
    const totalAppointments = dashboardData.bookingsByStatus.reduce((acc, curr) => acc + curr.count, 0);
    const completedCount = dashboardData.bookingsByStatus.find(s => s._id === 'COMPLETED')?.count || 0;

    // Promedio Ponderado de Rating
    let totalWeightedStars = 0;
    let totalReviews = 0;
    dashboardData.ratingsByStylist.forEach(r => {
      totalWeightedStars += (r.avgRating * r.ratingsCount);
      totalReviews += r.ratingsCount;
    });
    const averageRating = totalReviews > 0 ? (totalWeightedStars / totalReviews) : 0;

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

  return { stats, loading, dateRange, setDateRange, downloadPdf };
}