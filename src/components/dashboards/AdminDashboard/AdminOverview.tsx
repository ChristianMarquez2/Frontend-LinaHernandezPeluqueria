import React, { useMemo } from 'react';
import { useData } from '../../../contexts/data/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
// Importamos iconos para darle vida visual (opcional, asumiendo lucide-react)
import { CalendarDays, AlertCircle, Users, Star, TrendingUp } from 'lucide-react';

export function AdminOverview() {
  // Aseguramos valores por defecto para evitar crash si el contexto aún carga
  const { appointments = [], ratings = [], stylists = [], services = [] } = useData();

  // ===========================
  // 🧠 Lógica y Cálculos (Memoized)
  // ===========================

  const stats = useMemo(() => {
    const now = new Date();
    // Normalizamos la fecha de hoy a string local (YYYY-MM-DD) para comparar fácil
    const todayString = now.toLocaleDateString('en-CA'); // Formato ISO local

    // 1. Citas de Hoy
    const todayAppts = appointments.filter((a) => {
      if (!a.start) return false;
      const apptDate = new Date(a.start).toLocaleDateString('en-CA');
      return apptDate === todayString;
    });

    // 2. Pendientes (Normalizamos a mayúsculas para asegurar coincidencia)
    const pendingAppts = appointments.filter(
      (a) => a.status?.toUpperCase() === 'PENDIENTE'
    );

    // 3. Confirmadas de hoy (para el desglose)
    const confirmedToday = todayAppts.filter(
      (a) => a.status?.toUpperCase() === 'CONFIRMADA' || a.status?.toUpperCase() === 'CONFIRMED'
    ).length;

    // 4. Promedio de estrellas
    const totalStars = ratings.reduce((acc, r) => acc + (Number(r.estrellas) || 0), 0);
    const avgRating = ratings.length > 0 ? (totalStars / ratings.length).toFixed(1) : '0.0';

    // 5. Citas Recientes (Ordenadas)
    const recentAppts = [...appointments]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, 5);

    return {
      todayAppts,
      pendingAppts,
      confirmedToday,
      avgRating,
      recentAppts,
      activeStylistsCount: stylists.filter(s => s.isActive).length,
      activeServicesCount: services.filter(s => s.activo).length
    };
  }, [appointments, ratings, stylists, services]);

  // ===========================
  // 🛠 Helpers de Renderizado
  // ===========================

  const getServicesName = (apptServices: any[]) => {
    if (!apptServices || apptServices.length === 0) return 'Sin servicio';
    return apptServices.map((s) => s.nombre).join(', ');
  };

  const getStylistName = (stylistData: any) => {
    if (!stylistData) return 'Sin asignar';
    if (typeof stylistData === 'object' && stylistData.nombre) {
      return `${stylistData.nombre} ${stylistData.apellido || ''}`;
    }
    const s = stylists.find((sty) => sty._id === stylistData);
    return s ? `${s.nombre} ${s.apellido}` : 'Desconocido';
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
    const s = (status || '').toUpperCase();
    const badgeStyles: Record<string, string> = {
        PENDIENTE: "bg-yellow-900 text-yellow-200 border-yellow-800 hover:bg-yellow-900",
        CONFIRMADA: "bg-green-900 text-green-200 border-green-800 hover:bg-green-900",
        CONFIRMED: "bg-green-900 text-green-200 border-green-800 hover:bg-green-900",
        COMPLETADA: "bg-blue-900 text-blue-200 border-blue-800 hover:bg-blue-900",
        COMPLETED: "bg-blue-900 text-blue-200 border-blue-800 hover:bg-blue-900",
        CANCELADA: "bg-red-900 text-red-200 border-red-800 hover:bg-red-900",
        CANCELLED: "bg-red-900 text-red-200 border-red-800 hover:bg-red-900",
    };

    return (
        <Badge className={badgeStyles[s] || "bg-gray-800 text-gray-200"}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
        </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-[#D4AF37] text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Resumen General
        </h2>
      </div>

      {/* CARDS DE ESTADÍSTICAS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Citas Hoy */}
        <Card className="bg-gray-900 border-gray-800 hover:border-[#D4AF37]/50 transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-gray-400">Citas Hoy</CardDescription>
            <CalendarDays className="h-4 w-4 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.todayAppts.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.confirmedToday} confirmadas para hoy
            </p>
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card className="bg-gray-900 border-gray-800 hover:border-yellow-500/50 transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-gray-400">Por Aprobar</CardDescription>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.pendingAppts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Requieren acción inmediata</p>
          </CardContent>
        </Card>

        {/* Estilistas */}
        <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-gray-400">Equipo Activo</CardDescription>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.activeStylistsCount}</div>
            <p className="text-xs text-gray-500 mt-1">Estilistas disponibles</p>
          </CardContent>
        </Card>

        {/* Calificaciones */}
        <Card className="bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-gray-400">Calidad</CardDescription>
            <Star className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.avgRating}</div>
            <p className="text-xs text-gray-500 mt-1">Basado en {ratings.length} reseñas</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE CITAS RECIENTES */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-lg font-semibold">Actividad Reciente</CardTitle>
          <CardDescription className="text-gray-500">Últimas 5 citas registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentAppts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
                No hay datos de citas disponibles.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentAppts.map((appointment) => {
                const { date, time } = formatDateTime(appointment.start);
                const serviceName = getServicesName(appointment.services);
                const stylistName = getStylistName(appointment.stylist);

                return (
                  <div
                    key={appointment._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-4 last:border-0 last:pb-0 gap-3 sm:gap-0"
                  >
                    <div className="flex gap-4">
                        {/* Avatar o indicador visual simple */}
                        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-[#D4AF37] font-bold">
                            {stylistName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-white font-medium">{serviceName}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>{stylistName}</span>
                                <span className="text-gray-600">•</span>
                                <span>{date} - {time}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
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