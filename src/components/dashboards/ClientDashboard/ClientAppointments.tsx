import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { RatingsManagement } from '../../management/ratings/RatingsManagement';
import { safeParseDate, safeParseTime } from './utils';
import { Booking } from '../../../contexts/data/types'; // Usamos el tipo Booking nuevo

interface ClientAppointmentsProps {
  showRatings: boolean;
  setShowRatings: (show: boolean) => void;
  // Usamos Booking[] que ya viene tipado correctamente desde myBookings
  appointments: Booking[]; 
  onEdit: (appointment: Booking) => void;
  onCancel: (id: string) => void;
}

export function ClientAppointments({
  showRatings,
  setShowRatings,
  appointments,
  onEdit,
  onCancel,
}: ClientAppointmentsProps) {
  
  // Helpers internos para obtener nombres seguros (por si el populate falla)
  const getServiceName = (booking: Booking) => {
    if (booking.servicio && typeof booking.servicio === 'object') {
      return booking.servicio.nombre;
    }
    return "Servicio";
  };

  const getStylistName = (booking: Booking) => {
    if (booking.estilista && typeof booking.estilista === 'object') {
      return `${booking.estilista.nombre} ${booking.estilista.apellido}`;
    }
    return "Estilista asignado";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
      case "CONFIRMED":
        return <Badge className="bg-yellow-900/50 text-yellow-200 border-yellow-800">Confirmada</Badge>;
      case "PENDING_STYLIST_CONFIRMATION":
        return <Badge className="bg-orange-900/50 text-orange-200 border-orange-800">Pendiente Aprobación</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-900/50 text-blue-200 border-blue-800">Completada</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-900/50 text-red-200 border-red-800">Cancelada</Badge>;
      case "NO_SHOW":
        return <Badge className="bg-gray-700 text-gray-300">No Asistió</Badge>;
      default:
        return <Badge className="bg-gray-800 text-gray-400">{status}</Badge>;
    }
  };

  return (
    <>
      {/* TABS / TOGGLES */}
      <div className="flex gap-4 mt-2">
        <Button
          variant={!showRatings ? "default" : "outline"}
          onClick={() => setShowRatings(false)}
          className={!showRatings 
            ? "bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-medium" 
            : "border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"}
        >
          Mis Citas
        </Button>

        <Button
          variant={showRatings ? "default" : "outline"}
          onClick={() => setShowRatings(true)}
          className={showRatings 
            ? "bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-medium" 
            : "border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"}
        >
          Calificaciones
        </Button>
      </div>

      {/* CONTENIDO */}
      {!showRatings ? (
        <Card className="bg-gray-900 border-gray-800 shadow-lg mt-4">
          <CardHeader>
            <CardTitle className="text-white text-lg font-semibold flex items-center justify-between">
              <span>Historial de Reservas</span>
              <span className="text-sm font-normal text-gray-500">{appointments.length} total</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-lg">
                  <p className="text-gray-400 mb-2">No tienes citas programadas aún.</p>
                  <p className="text-sm text-gray-600">¡Agenda tu primera cita arriba!</p>
                </div>
              ) : (
                appointments.map((booking) => {
                  const fecha = safeParseDate(booking.inicio);
                  const hora = safeParseTime(booking.inicio);
                  const isActive = ["SCHEDULED", "CONFIRMED", "PENDING_STYLIST_CONFIRMATION"].includes(booking.estado);

                  return (
                    <div
                      key={booking._id}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-800 pb-4 last:border-0 hover:bg-gray-800/30 p-3 rounded-lg transition-colors"
                    >
                      <div className="mb-3 sm:mb-0">
                        <div className="flex items-center gap-3">
                            <h3 className="text-white font-medium text-lg">
                            {getServiceName(booking)}
                            </h3>
                            {getStatusBadge(booking.estado)}
                        </div>
                        
                        <p className="text-sm text-gray-400 mt-1">
                           con <span className="text-gray-300">{getStylistName(booking)}</span>
                        </p>
                        
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                📅 {fecha}
                            </span>
                            <span className="flex items-center gap-1">
                                ⏰ {hora}
                            </span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(booking)}
                            className="flex-1 sm:flex-none text-sm text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700"
                          >
                            Reprogramar
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onCancel(booking._id)}
                            className="flex-1 sm:flex-none text-sm bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4">
            <RatingsManagement />
        </div>
      )}
    </>
  );
}