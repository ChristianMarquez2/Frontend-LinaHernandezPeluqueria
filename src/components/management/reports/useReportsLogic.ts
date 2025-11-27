import { useEffect, useMemo } from 'react';
import { useData } from '../../../contexts/data/index';

export interface ReportStats {
  appointmentsByStatus: { name: string; value: number }[];
  topServicesData: { name: string; count: number }[];
  revenueData: { month: string; revenue: number }[];
  ratingsData: { name: string; rating: number; reviews: number }[];
  totalRevenue: number;
  totalAppointments: number;
  completedCount: number;
  averageRating: number;
  totalReviews: number;
}

export function useReportsLogic() {
  const { reports, fetchReports, services, stylists } = useData();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const stats = useMemo<ReportStats | null>(() => {
    if (!reports) return null;

    // A. Citas por Estado
    const appointmentsByStatus = reports.bookingsByStatus.map((item) => {
      let name = item._id || 'Desconocido';
      if (item._id === 'COMPLETED') name = 'Completada';
      else if (item._id === 'SCHEDULED') name = 'Programada';
      else if (item._id === 'CANCELLED') name = 'Cancelada';
      else if (item._id === 'PENDING') name = 'Pendiente';
      else if (item._id === 'CONFIRMED') name = 'Confirmada';
      else if (item._id === 'NO_SHOW') name = 'No Asistió';

      return { name, value: item.count };
    });

    // B. Servicios Populares
    const topServicesData = reports.topServices.map((item) => {
      const serviceName = services.find(s => s._id === item._id)?.nombre || 'Desconocido';
      return { name: serviceName, count: item.count };
    });

    // C. Ingresos por Mes
    const revenueData = reports.revenueByMonth
      .filter(item => item._id && typeof item._id === 'string')
      .map((item) => {
        const parts = item._id.split('-');
        if (parts.length !== 2) return { month: item._id, revenue: item.total };

        const [year, month] = parts;
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          revenue: item.total,
        };
      });

    // D. Calificación por Estilista
    const ratingsData = reports.ratingsByStylist.map((item) => {
      const stylist = stylists.find(s => s._id === item._id);
      return {
        name: stylist ? `${stylist.nombre} ${stylist.apellido}` : 'Estilista',
        rating: parseFloat(item.avg.toFixed(1)),
        reviews: item.count
      };
    });

    // E. Totales
    const totalRevenue = reports.revenueByMonth.reduce((acc, curr) => acc + curr.total, 0);
    const totalAppointments = reports.bookingsByStatus.reduce((acc, curr) => acc + curr.count, 0);
    const completedCount = reports.bookingsByStatus.find(s => s._id === 'COMPLETED')?.count || 0;

    let totalStars = 0;
    let totalReviews = 0;
    reports.ratingsByStylist.forEach(r => {
      totalStars += r.avg * r.count;
      totalReviews += r.count;
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
      totalReviews
    };
  }, [reports, services, stylists]);

  return { stats, stylists }; 
}