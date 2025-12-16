import { Calendar, DollarSign, Star, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { ReportStats } from './useReportsLogic';

interface SummaryCardsProps {
  stats: ReportStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Ingresos Totales */}
      <Card className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <CardDescription className="text-gray-400">Ingresos (Pagados)</CardDescription>
          </div>
          <CardTitle className="text-green-500 text-2xl">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            {stats.paidBookings} transacciones registradas
          </p>
        </CardContent>
      </Card>

      {/* Total Citas */}
      <Card className="bg-gray-900 border-gray-800 hover:border-[#D4AF37]/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#D4AF37]" />
            <CardDescription className="text-gray-400">Volumen de Citas</CardDescription>
          </div>
          <CardTitle className="text-[#D4AF37] text-2xl">{stats.totalAppointments}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            En el periodo seleccionado
          </p>
        </CardContent>
      </Card>

      {/* Calificación Promedio */}
      <Card className="bg-gray-900 border-gray-800 hover:border-yellow-500/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[#FFD700]" />
            <CardDescription className="text-gray-400">Calidad Promedio</CardDescription>
          </div>
          <CardTitle className="text-[#FFD700] text-2xl">
            {stats.averageRating.toFixed(1)} ⭐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Basado en {stats.totalReviews} reseñas
          </p>
        </CardContent>
      </Card>

      {/* Citas Completadas */}
      <Card className="bg-gray-900 border-gray-800 hover:border-[#9D8EC1]/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#9D8EC1]" />
            <CardDescription className="text-gray-400">Tasa de Cierre</CardDescription>
          </div>
          <CardTitle className="text-[#9D8EC1] text-2xl">
             {stats.totalAppointments > 0 
                ? ((stats.completedCount / stats.totalAppointments) * 100).toFixed(0) 
                : 0}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            {stats.completedCount} completadas exitosamente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}