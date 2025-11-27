import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useData } from '../../../contexts/data/index';
import { UserProfile } from '../../UserProfile';

// Componentes
import { StylistHeader } from './StylistHeader';
import { StylistStats } from './StylistStats';
// Usamos el calendario centralizado que ya soporta filtros y acciones
import { AppointmentCalendar } from '../../management/calendar/AppointmentCalendar'; 

export function StylistDashboard() {
  const { user, logout, refreshSession } = useAuth();
  const { getUserNotifications, fetchData } = useData();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (user) fetchData();
    const interval = setInterval(() => refreshSession(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData, refreshSession, user]);

  const notifications = getUserNotifications(user?.id || '');
  const unreadCount = notifications.filter((n) => !n.read).length;

  // CORRECCIÓN: Hacemos cast a string para evitar el error de tipado estricto
  // cuando el backend devuelve 'ESTILISTA' en mayúsculas.
  const userRole = user?.role as string | undefined;

  if (userRole !== 'stylist' && userRole !== 'ESTILISTA') {
    return <div className="p-10 text-white text-center">Acceso restringido.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <StylistHeader
        user={user}
        unreadCount={unreadCount}
        setShowProfile={setShowProfile}
        logout={logout}
      />

      <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Estadísticas Rápidas (Podríamos mejorarlas conectándolas a bookings reales luego) */}
        <StylistStats
            todayCount={0} // TODO: Conectar a myBookings count
            pendingCount={0}
            confirmedCount={0}
            completedTodayCount={0}
        />

        {/* Calendario Interactivo */}
        <div className="space-y-2">
            <h2 className="text-[#D4AF37] text-lg font-semibold pl-1">Gestión de Citas</h2>
            {/* El calendario cargará las citas. El estilista puede filtrar por su nombre si lo desea */}
            <AppointmentCalendar />
        </div>
      </main>

      <UserProfile open={showProfile} onOpenChange={setShowProfile} />
    </div>
  );
}