import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/card';

interface StylistStatsProps {
  todayCount: number;
  confirmedCount: number;
  canceledCount: number;
  completedCount: number;
}

export function StylistStats({
  todayCount,
  confirmedCount,
  canceledCount,
  completedCount,
}: StylistStatsProps) {
  return (
    <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-4 w-4 text-[#D4AF37]" />
            <CardDescription className="text-gray-400 text-xs md:text-sm">Hoy</CardDescription>
          </div>
          <CardTitle className="text-[#D4AF37] text-2xl md:text-3xl font-bold">
            {todayCount}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <CardDescription className="text-gray-400 text-xs md:text-sm">Confirmadas</CardDescription>
          </div>
          <CardTitle className="text-green-500 text-2xl md:text-3xl font-bold">
            {confirmedCount}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4" style={{ color: '#ef4444' }} />
            <CardDescription className="text-gray-400 text-xs md:text-sm">Canceladas</CardDescription>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold" style={{ color: '#ef4444' }}>
            {canceledCount}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <CardDescription className="text-gray-400 text-xs md:text-sm">Completadas</CardDescription>
          </div>
          <CardTitle className="text-blue-500 text-2xl md:text-3xl font-bold">
            {completedCount}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}