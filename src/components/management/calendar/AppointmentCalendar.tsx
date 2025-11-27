import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useAppointmentCalendar } from './useAppointmentCalendar';
import { AppointmentCard } from './AppointmentCard';

export function AppointmentCalendar() {
  const {
    bookings,
    loading,
    selectedDate,
    setSelectedDate,
    selectedStylistId,
    setSelectedStylistId,
    stylists,
    formatDateLabel,
    formatTime,
    getServiceName,
    getClientLabel,
    handleConfirm,
    handleCancel,
    handleComplete
  } = useAppointmentCalendar();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D4AF37]" />
            Calendario de Citas
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             {/* Filtro Estilista */}
             <div className="w-full sm:w-48">
                <Select value={selectedStylistId} onValueChange={setSelectedStylistId}>
                    <SelectTrigger className="bg-black border-gray-700 text-white">
                        <SelectValue placeholder="Filtrar Estilista" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="ALL">Todos</SelectItem>
                        {stylists.map(s => (
                            <SelectItem key={s._id} value={s._id}>{s.nombre} {s.apellido}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>

             {/* Selector Fecha */}
             <div className="w-full sm:w-auto">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-black border-gray-700 text-white"
                />
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-[#D4AF37] font-medium text-sm uppercase tracking-wide">
              Agenda para {formatDateLabel(selectedDate)}
            </h3>

            {loading ? (
                <div className="text-center py-12 text-[#9D8EC1]">Cargando reservas...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-800 rounded-lg">
                No hay reservas programadas para este día.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking) => (
                  <AppointmentCard
                    key={booking._id}
                    booking={booking}
                    formatTime={formatTime}
                    getServiceName={getServiceName}
                    getClientLabel={getClientLabel}
                    onConfirm={handleConfirm}
                    onCancel={(id) => {
                        const motivo = prompt("Motivo de la cancelación:");
                        if (motivo) handleCancel(id, motivo);
                    }}
                    onComplete={(id) => handleComplete(id, "Completado desde panel")}
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