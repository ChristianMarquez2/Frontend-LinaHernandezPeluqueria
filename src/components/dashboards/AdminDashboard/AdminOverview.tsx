import { useData } from '../../../contexts/data/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';

export function AdminOverview() {
  const { appointments, ratings, stylists, services } = useData();

  // ===========================
  // 📅 Métricas y lógica de Fechas
  // ===========================
  
  // Helper robusto para comparar fechas ignorando hora y zona horaria UTC
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const now = new Date();

  // 1. Filtrar Citas de Hoy
  const todayAppointments = appointments.filter((a) => {
    if (!a.start) return false;
    return isSameDay(new Date(a.start), now);
  });

  // 2. Filtrar Pendientes (El Context ya asegura que el status venga en mayúsculas)
  const pendingAppointments = appointments.filter(
    (a) => a.status === 'PENDIENTE'
  );

  // 3. Métricas simples
  const activeStylists = stylists.filter((s) => s.isActive);
  const activeServices = services.filter((s) => s.activo);

  // 4. Promedio de estrellas (Manejo de división por cero)
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r.estrellas, 0) / ratings.length).toFixed(1)
      : '0.0';

  // ===========================
  // 🛠 Helpers de Renderizado
  // ===========================

  const getServicesName = (apptServices: any[]) => {
    if (!apptServices || apptServices.length === 0) return 'Sin servicio';
    return apptServices.map((s) => s.nombre).join(', ');
  };

  const getStylistName = (stylistData: any) => {
    // Caso 1: Objeto completo (Populated)
    if (typeof stylistData === 'object' && stylistData !== null) {
      return `${stylistData.nombre} ${stylistData.apellido}`;
    }
    // Caso 2: Solo ID string (Buscar en la lista de estilistas)
    const s = stylists.find((sty) => sty._id === stylistData);
    if (!s) return 'Estilista no asignado';
    return `${s.nombre} ${s.apellido}`;
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return { date: '-', time: '-' };
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getStatusBadge = (status: string) => {
    // Normalizamos por seguridad
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PENDIENTE':
        return <Badge className="bg-yellow-900 text-yellow-200 border-yellow-800">Pendiente</Badge>;
      case 'CONFIRMADA':
      case 'CONFIRMED':
        return <Badge className="bg-green-900 text-green-200 border-green-800">Confirmada</Badge>;
      case 'COMPLETADA':
      case 'COMPLETED':
        return <Badge className="bg-blue-900 text-blue-200 border-blue-800">Completada</Badge>;
      case 'CANCELADA':
      case 'CANCELLED':
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
              {todayAppointments.filter(a => a.status === 'CONFIRMADA').length} confirmadas
            </p>
          </CardContent>
        </Card>

        {/* Pendientes */}
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
                // Ordenar: Las más futuras o recientes primero
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
                          <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">
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