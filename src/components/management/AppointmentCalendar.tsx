import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useData } from '../../contexts/data/index';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

// Función auxiliar para obtener fecha local en formato YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function AppointmentCalendar() {
  const { user } = useAuth();
  const { appointments, services } = useData(); // Asumimos que appointments viene del contexto global

  // 1. Usar fecha local para evitar errores de zona horaria por la noche
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  if (!user) return null;

  // ---------------------------------------------
  // 🔍 LÓGICA DE FILTRADO
  // ---------------------------------------------
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt: any) => {
      // A. Filtro por Estilista:
      // Verifica cómo se llama el campo en tu DB: ¿stylistId, stylist, o estilistaId?
      // Y asegúrate de comparar strings (toString) por si viene como ObjectId
      const apptStylistId = appt.stylistId || appt.stylist || appt.estilistaId;
      const isMyAppointment = String(apptStylistId) === String(user.id || user.id);

      if (!isMyAppointment) return false;

      // B. Filtro por Fecha:
      // Convertimos la fecha de inicio de la cita a string local para comparar
      const apptDate = new Date(appt.startDate || appt.inicio); // Soporta ambos nombres
      const apptDateString = getLocalDateString(apptDate);
      
      return apptDateString === selectedDate;
    });
  }, [appointments, user, selectedDate]);

  // ---------------------------------------------
  // 🏷️ HELPERS DE VISUALIZACIÓN
  // ---------------------------------------------
  const getServiceName = (id: string) => {
    // Busca en tu array de servicios
    const service = services.find((s) => s._id === id );
    return service ? service.nombre : 'Servicio desconocido';
  };

  const getClientName = (appt: any) => {
    // Opción A: Tu backend ya envió el objeto cliente populado (Ideal)
    if (appt.client && appt.client.name) return appt.client.name;
    if (appt.cliente && appt.cliente.nombre) return appt.cliente.nombre;

    // Opción B: Solo tienes el ID
    const id = appt.clientId || appt.clienteId || "???";
    return `Cliente #${String(id).slice(-4)}`;
  };

  const formatTimeRange = (start: string, end: string) => {
    const format = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${format(start)} — ${format(end)}`;
  };

  const getStatusBadge = (status: string) => {
    // Normalizamos a mayúsculas por seguridad
    const s = status?.toUpperCase();
    const styles: Record<string, string> = {
      SCHEDULED: "bg-yellow-900 text-yellow-200 border-yellow-700",
      CONFIRMED: "bg-green-900 text-green-200 border-green-700",
      COMPLETED: "bg-blue-900 text-blue-200 border-blue-700",
      CANCELLED: "bg-red-900 text-red-200 border-red-700",
    };
    
    // Traducción simple para mostrar
    const labels: Record<string, string> = {
      SCHEDULED: "Programada",
      CONFIRMED: "Confirmada",
      COMPLETED: "Completada",
      CANCELLED: "Cancelada",
    };

    return (
      <Badge className={`${styles[s] || "bg-gray-800 text-gray-300"} border px-2 py-0.5`}>
        {labels[s] || s}
      </Badge>
    );
  };

  // ---------------------------------------------
  // 🖥️ RENDER
  // ---------------------------------------------
  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader className="border-b border-gray-800 pb-4">
          <CardTitle className="text-white flex items-center gap-3 text-xl">
            <Calendar className="h-6 w-6 text-[#D4AF37]" />
            Agenda del Estilista
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Selector de Fecha */}
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Seleccionar día de trabajo
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white w-full md:w-auto focus:ring-[#D4AF37]"
            />
          </div>

          <div>
            <h3 className="text-[#D4AF37] text-lg font-medium mb-4 flex items-center gap-2">
              📅 Citas para el {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { 
                  weekday: 'long', day: 'numeric', month: 'long' 
              })}
            </h3>

            <div className="space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-black/20 rounded-lg border border-dashed border-gray-800">
                  <p className="text-gray-500">No tienes citas programadas para este día.</p>
                </div>
              ) : (
                filteredAppointments
                  .sort((a: any, b: any) => new Date(a.startDate || a.inicio).getTime() - new Date(b.startDate || b.inicio).getTime())
                  .map((appt: any) => (
                    <div 
                      key={appt._id || appt.id}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-black border border-gray-800 rounded-lg hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 bg-gray-800 p-2 rounded-full group-hover:bg-gray-700 transition-colors">
                          <Clock className="h-5 w-5 text-[#D4AF37]" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-lg">
                              {formatTimeRange(appt.startDate || appt.inicio, appt.endDate || appt.fin)}
                            </span>
                            {getStatusBadge(appt.status || appt.estado)}
                          </div>
                          
                          <p className="text-[#D4AF37] font-medium">
                            {getServiceName(appt.serviceId || appt.servicioId)}
                          </p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <UserIcon className="h-3 w-3" />
                            <span>{getClientName(appt)}</span>
                          </div>

                          {(appt.notes || appt.notas) && (
                            <p className="text-xs text-gray-500 italic mt-1 bg-gray-900/50 p-1 rounded px-2">
                              Nota: {appt.notes || appt.notas}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Aquí podrías agregar botones de acción (ej: Completar, Cancelar) */}
                    </div>
                  ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}