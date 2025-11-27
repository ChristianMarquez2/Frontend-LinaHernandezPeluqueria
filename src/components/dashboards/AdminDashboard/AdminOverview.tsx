import { useData } from '../../../contexts/data/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';

export function AdminOverview() {
  const { appointments, ratings, stylists, services } = useData();

  // ===========================
  // 📅 Métricas y lógica
  // ===========================
  const today = new Date().toISOString().split('T')[0];

  // 1. Cambio: inicio -> start
  const todayAppointments = appointments.filter(
    (a) => a.start && a.start.split('T')[0] === today
  );

  // 2. Cambio: estado -> status y valor 'PENDIENTE'
  const pendingAppointments = appointments.filter(
    (a) => a.status === 'PENDIENTE'
  );

  const activeStylists = stylists.filter((s) => s.isActive);
  const activeServices = services.filter((s) => s.activo);

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r.estrellas, 0) / ratings.length).toFixed(1)
      : '0.0';

  // ===========================
  // 🛠 Helpers de Renderizado
  // ===========================

  // 3. Helper para manejar array de servicios
  const getServicesName = (apptServices: any[]) => {
    if (!apptServices || apptServices.length === 0) return 'Sin servicio';
    // Une los nombres con comas
    return apptServices.map((s) => s.nombre).join(', ');
  };

  // 4. Helper para obtener nombre del estilista (Maneja Objeto o ID string)
  const getStylistName = (stylistData: any) => {
    // Si ya viene el objeto populated
    if (typeof stylistData === 'object' && stylistData !== null) {
      return `${stylistData.nombre} ${stylistData.apellido}`;
    }
    // Si viene solo el ID (fallback)
    const s = stylists.find((sty) => sty._id === stylistData);
    if (!s) return 'Estilista no encontrado';
    return `${s.nombre} ${s.apellido}`;
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // 5. Mapeo de estados en ESPAÑOL
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

      {/* CARDS DE ESTADÍSTICAS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Citas Hoy */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-400">Citas Hoy</CardDescription>
            <CardTitle className="text-[#D4AF37] text-3xl font-bold">
              {todayAppointments.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              {/* Mostramos las confirmadas de hoy como dato útil */}
              {todayAppointments.filter(a => a.status === 'CONFIRMADA').length} confirmadas
            </p>
          </CardContent>
        </Card>

        {/* Citas Pendientes (Total) */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-400">Pendientes de Acción</CardDescription>
            <CardTitle className="text-yellow-500 text-3xl font-bold">
              {pendingAppointments.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Requieren confirmación</p>
          </CardContent>
        </Card>

        {/* Estilistas */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-400">Estilistas Activos</CardDescription>
            <CardTitle className="text-[#D4AF37] text-3xl font-bold">
              {activeStylists.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">De {stylists.length} registrados</p>
          </CardContent>
        </Card>

        {/* Calificaciones */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-gray-400">Calificación Media</CardDescription>
            <CardTitle className="text-[#D4AF37] text-3xl font-bold">
              {avgRating}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">{ratings.length} reseñas totales</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE CITAS RECIENTES */}
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
                // Ordenar por fecha de inicio descendente (más recientes primero)
                .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
                .slice(0, 5)
                .map((appointment) => {
                  const { date, time } = formatDateTime(appointment.start);
                  const serviceName = getServicesName(appointment.services);
                  const stylistName = getStylistName(appointment.stylist);

                  return (
                    <div
                      key={appointment._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-3 last:border-0 gap-3 sm:gap-0"
                    >
                      <div>
                        <p className="text-white font-medium">{serviceName}</p>
                        <p className="text-sm text-gray-400">Estilista: {stylistName}</p>
                        <p className="text-xs text-gray-500">{date} a las {time}</p>
                        {appointment.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">
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