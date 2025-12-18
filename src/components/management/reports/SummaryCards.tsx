import { Calendar, DollarSign, Star, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { ReportStats } from './useReportsLogic';

interface SummaryCardsProps {
  stats: ReportStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  // Formateador de moneda para Ecuador
  const formatUSD = (val: number) => 
    new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      
      {/* Ingresos Totales (Basado en PaymentModel del backend) */}
      <Card className="bg-gray-900 border-gray-800 hover:border-green-500/40 transition-all group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <CardDescription className="text-gray-400 font-medium">Ingresos Reales</CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <CardTitle className="text-green-500 text-3xl font-bold mt-2">
            {formatUSD(stats.totalRevenue)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            {stats.paidBookings} cobros procesados con éxito
          </p>
        </CardContent>
      </Card>

      {/* Volumen Operativo */}
      <Card className="bg-gray-900 border-gray-800 hover:border-[#D4AF37]/40 transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
              <Calendar className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <CardDescription className="text-gray-400 font-medium">Volumen Total</CardDescription>
          </div>
          <CardTitle className="text-[#D4AF37] text-3xl font-bold mt-2">
            {stats.totalAppointments}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            Citas gestionadas en agenda
          </p>
        </CardContent>
      </Card>

      {/* Satisfacción (Basado en RatingModel) */}
      <Card className="bg-gray-900 border-gray-800 hover:border-yellow-500/40 transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Star className="h-4 w-4 text-[#D4AF37]" />
            </div>
            <CardDescription className="text-gray-400 font-medium">Reputación</CardDescription>
          </div>
          <CardTitle className="text-[#D4AF37] text-3xl font-bold mt-2">
            {stats.averageRating.toFixed(1)} <span className="text-sm font-normal text-yellow-500/60">/ 5</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            De un total de {stats.totalReviews} reseñas
          </p>
        </CardContent>
      </Card>

      {/* Tasa de Efectividad */}
      <Card className="bg-gray-900 border-gray-800 hover:border-[#9D8EC1]/40 transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#9D8EC1]/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-[#9D8EC1]" />
            </div>
            <CardDescription className="text-gray-400 font-medium">Eficiencia</CardDescription>
          </div>
          <CardTitle className="text-[#9D8EC1] text-3xl font-bold mt-2">
             {stats.totalAppointments > 0 
                ? ((stats.completedCount / stats.totalAppointments) * 100).toFixed(0) 
                : 0}<span className="text-sm font-normal">%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            {stats.completedCount} servicios finalizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}