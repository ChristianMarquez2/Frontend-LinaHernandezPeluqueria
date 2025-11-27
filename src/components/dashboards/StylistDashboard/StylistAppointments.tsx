import { AppointmentCalendar } from '../../management/AppointmentCalendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';

// 👇 SOLUCIÓN: Importamos el tipo centralizado en lugar de redefinirlo
import { Appointment } from '../../../contexts/data/types';

interface StylistAppointmentsProps {
  appointments: Appointment[];
}

export function StylistAppointments({ appointments }: StylistAppointmentsProps) {
  
  // Función auxiliar para obtener nombre del cliente
  const getClientName = (appt: Appointment) => {
    // Verificamos si es un objeto (populado) y no null
    if (appt.clientId && typeof appt.clientId === 'object') {
      return `${appt.clientId.nombre} ${appt.clientId.apellido}`;
    }
    return appt.clientName || 'Cliente sin registro';
  };

  // Función auxiliar para listar servicios
  const getServicesName = (appt: Appointment) => {
    if (appt.services && appt.services.length > 0) {
      return appt.services.map(s => s.nombre).join(', ');
    }
    return 'Servicio General';
  };

  return (
    <>
      {/* CALENDARIO */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#D4AF37] text-lg font-semibold">Mi Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentCalendar />
          
          {/* LISTA COMPLETA DE CITAS */}
          <Card className="bg-gray-900 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-[#D4AF37] text-lg font-semibold">
                Todas mis citas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Lista cronológica de todas tus citas programadas y completadas
              </CardDescription>
            </CardHeader>

            <CardContent>
              {appointments.length === 0 && (
                <p className="text-gray-400 text-center p-6">
                  No tienes citas registradas.
                </p>
              )}

              <div className="space-y-4">
                {appointments
                  .slice() 
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .map((a) => {
                    const fechaObj = new Date(a.start);
                    const fecha = fechaObj.toLocaleDateString();
                    const hora = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={a._id}
                        className="flex flex-col sm:flex-row justify-between border-b border-gray-800 pb-3 last:border-0 gap-4 sm:gap-0"
                      >
                        <div>
                          {/* Servicios */}
                          <p className="text-white font-medium text-lg">
                            {getServicesName(a)}
                          </p>
                          {/* Cliente */}
                          <p className="text-sm text-gray-300">
                            Cliente: <span className="text-gray-400">{getClientName(a)}</span>
                          </p>
                          {/* Fecha */}
                          <p className="text-xs text-gray-500 mt-1">
                            {fecha} — {hora}
                          </p>
                        </div>

                        <div className="flex items-center">
                          <Badge
                            className={
                              a.status === "PENDIENTE"
                                ? "bg-yellow-900/50 text-yellow-200 border-yellow-800"
                                : a.status === "CONFIRMADA"
                                ? "bg-green-900/50 text-green-200 border-green-800"
                                : a.status === "COMPLETADA"
                                ? "bg-blue-900/50 text-blue-200 border-blue-800"
                                : "bg-red-900/50 text-red-200 border-red-800"
                            }
                          >
                            {a.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </>
  );
}