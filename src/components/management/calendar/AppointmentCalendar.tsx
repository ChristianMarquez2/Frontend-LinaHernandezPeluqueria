import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { useAppointmentCalendar } from './useAppointmentCalendar';
import { AppointmentCard } from './AppointmentCard';

export function AppointmentCalendar() {
  const {
    user,
    selectedDate,
    setSelectedDate,
    appointmentsForDate,
    formatDateLabel,
    formatTime,
    // CORRECCIÓN: El nombre en el hook es getServiceNames (plural)
    getServiceNames, 
    getClientLabel,
  } = useAppointmentCalendar();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D4AF37]" />
            Mi calendario de citas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Selector de Fecha */}
          <div>
            <Label className="text-gray-300">Seleccionar fecha</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-black border-gray-700 text-white mt-1"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-[#D4AF37] font-medium">
              Citas para {formatDateLabel(selectedDate)}
            </h3>

            {appointmentsForDate.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border border-dashed border-gray-800 rounded-lg">
                No hay citas programadas para esta fecha.
              </div>
            ) : (
              <div className="space-y-3">
                {appointmentsForDate.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    formatTime={formatTime}
                    // CORRECCIÓN: Pasamos la función con el nombre correcto
                    getServiceNames={getServiceNames}
                    getClientLabel={getClientLabel}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}