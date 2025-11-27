import { useData } from '../../../contexts/data/index';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';

export function ManagerOverview() {
  const { appointments, ratings, stylists, services } = useData();

  // ===========================
  // 📅 Métricas y lógica
  // ===========================
  const today = new Date().toISOString().split('T')[0];

  // 1. Cambio: inicio -> start
  const todayAppointments = appointments.filter(
    (a) => a.start && a.start.split('T')[0] === today
  );

  const activeStylists = stylists.filter((s) => s.isActive);

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r.estrellas, 0) / ratings.length).toFixed(1)
      : '0.0';

  // ===========================
  // 🛠 Helpers de Renderizado
  // ===========================

  // 2. Helper para manejar array de servicios
  const getServicesName = (apptServices: any[]) => {
    if (!apptServices || apptServices.length === 0) return 'Sin servicio';
    return apptServices.map((s) => s.nombre).join(', ');
  };

  // 3. Helper para obtener nombre del estilista (Objeto o ID)
  const getStylistName = (stylistData: any) => {
    if (typeof stylistData === 'object' && stylistData !== null) {
      return `${stylistData.nombre} ${stylistData.apellido}`;
    }
    const s = stylists.find((st) => st._id === stylistData);
    return s ? `${s.nombre} ${s.apellido}` : 'Estilista no asignado';
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // 4. Mapeo de estados en ESPAÑOL
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <Badge className="bg-yellow-900 text-yellow-200 border-yellow-800">Pendiente</Badge>;
      case 'CONFIRMADA':
        return <Badge className="bg-green-900 text-green-200 border-green-800">Confirmada</Badge>;
      case 'COMPLETADA':
        return <Badge className="bg-blue-900 text-blue-200 border-blue-800">Completada</Badge>;
      case 'CANCELADA':
        return <Badge className="bg-red-900 text-red-200 border-red-800">Cancelada</Badge>;
      default:
        return <Badge className="bg-gray-800 text-gray-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-[#D4AF37] text-xl font-semibold">Resumen General</h2>

      {/* MÉTRICAS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardDescription className="text-gray-400">Citas Hoy</CardDescription>
            <CardTitle className="text-[#D4AF37] text-3xl font-bold">
              {todayAppointments.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardDescription className="text-gray-400">Estilistas Activos</CardDescription>
            <CardTitle className="text-[#D4AF37] text-3xl font-bold">
              {activeStylists.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardDescription className="text-gray-400">Servicios</CardDescription>
            <CardTitle className="text-[#D4AF37] text-3xl font-bold">
              {services.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardDescription className="text-gray-400">Calificación Promedio</CardDescription>
            <CardTitle className="text-[#D4AF37] text-3xl font-bold">
              {avgRating}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 📌 Citas Recientes */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg font-semibold">Citas Recientes</CardTitle>
        </CardHeader>

        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay citas registradas.</p>
          ) : (
            <div className="space-y-4">
              {appointments
                .slice()
                // Ordenar por start descendente
                .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
                .slice(0, 5)
                .map((appointment) => {
                  const { date, time } = formatDateTime(appointment.start);
                  
                  return (
                    <div
                      key={appointment._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-3 last:border-0 gap-3 sm:gap-0"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {getServicesName(appointment.services)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Estilista: {getStylistName(appointment.stylist)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {date} a las {time}
                        </p>
                        {appointment.notes && (
                           <p className="text-xs text-gray-500 italic mt-1">
                             "{appointment.notes}"
                           </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}