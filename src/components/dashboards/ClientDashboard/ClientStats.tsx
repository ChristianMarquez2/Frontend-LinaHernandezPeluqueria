import { Calendar, Clock, CheckCircle, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/card';

interface ClientStatsProps {
  upcomingCount: number;
  pendingCount: number;
  completedCount: number;
  ratingsCount: number;
}

export function ClientStats({
  upcomingCount,
  pendingCount,
  completedCount,
  ratingsCount,
}: ClientStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      {/* Próximas */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#D4AF37]" />
            <CardDescription className="text-gray-400">
              Próximas Citas
            </CardDescription>
          </div>
          <CardTitle className="text-[#D4AF37] text-2xl font-bold">
            {upcomingCount}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Pendientes */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <CardDescription className="text-gray-400">
              Pendientes
            </CardDescription>
          </div>
          <CardTitle className="text-yellow-500 text-2xl font-bold">
            {pendingCount}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Completadas */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <CardDescription className="text-gray-400">
              Completadas
            </CardDescription>
          </div>
          <CardTitle className="text-green-500 text-2xl font-bold">
            {completedCount}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Calificaciones */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[#D4AF37]" />
            <CardDescription className="text-gray-400">
              Calificaciones
            </CardDescription>
          </div>
          <CardTitle className="text-[#D4AF37] text-2xl font-bold">
            {ratingsCount}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}