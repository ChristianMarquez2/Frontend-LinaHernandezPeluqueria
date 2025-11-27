import { Calendar, DollarSign, Star, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { ReportStats } from './useReportsLogic';

interface SummaryCardsProps {
  stats: ReportStats;
  activeStylistsCount: number;
  totalStylistsCount: number;
}

export function SummaryCards({ stats, activeStylistsCount, totalStylistsCount }: SummaryCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Citas */}
      <Card className="bg-gray-900 border-gray-800 hover:border-[#D4AF37]/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#D4AF37]" />
            <CardDescription className="text-gray-400">Total Citas</CardDescription>
          </div>
          <CardTitle className="text-[#D4AF37] text-2xl">{stats.totalAppointments}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            {stats.completedCount} completadas exitosamente
          </p>
        </CardContent>
      </Card>

      {/* Ingresos Totales */}
      <Card className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <CardDescription className="text-gray-400">Ingresos Registrados</CardDescription>
          </div>
          <CardTitle className="text-green-500 text-2xl">
            ${stats.totalRevenue.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Ingresos brutos acumulados
          </p>
        </CardContent>
      </Card>

      {/* Calificación Promedio */}
      <Card className="bg-gray-900 border-gray-800 hover:border-yellow-500/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[#FFD700]" />
            <CardDescription className="text-gray-400">Calidad del Servicio</CardDescription>
          </div>
          <CardTitle className="text-[#FFD700] text-2xl">
            {stats.averageRating.toFixed(1)} ⭐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Basado en {stats.totalReviews} reseñas reales
          </p>
        </CardContent>
      </Card>

      {/* Estilistas Activos */}
      <Card className="bg-gray-900 border-gray-800 hover:border-[#9D8EC1]/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#9D8EC1]" />
            <CardDescription className="text-gray-400">Equipo</CardDescription>
          </div>
          <CardTitle className="text-[#9D8EC1] text-2xl">
            {activeStylistsCount}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Estilistas activos de {totalStylistsCount} totales
          </p>
        </CardContent>
      </Card>
    </div>
  );
}