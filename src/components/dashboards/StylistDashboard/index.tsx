import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useData } from '../../../contexts/data/index';
import { UserProfile } from '../../UserProfile';

// Sub-componentes
import { StylistHeader } from './StylistHeader';
import { StylistStats } from './StylistStats';
import { StylistAppointments } from './StylistAppointments';


export function StylistDashboard() {
  const { user, logout, refreshSession } = useAuth();
  // Asumimos que appointments viene populated del backend
  const { appointments, getUserNotifications, fetchData } = useData();
  const [showProfile, setShowProfile] = useState(false);

  // ============================
  // 🔄 Cargar datos y sesión viva
  // ============================
  useEffect(() => {
    if (user) fetchData();
    const interval = setInterval(() => {
      refreshSession();
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData, refreshSession, user]);

  // ============================
  // 🔔 Notificaciones
  // ============================
  const notifications = getUserNotifications(user?.id || '');
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ============================
  // 💇‍♂️ Citas del estilista
  // ============================
  // Filtramos asegurando que el objeto stylist coincida (puede venir como ID string o como objeto populated)
  const myAppointments = appointments.filter((a) => {
    const stylistId = typeof a.stylist === 'object' ? a.stylist?._id : a.stylist;
    return stylistId === user?.id;
  });

  const today = new Date().toISOString().split('T')[0];

  const todayAppointments = myAppointments.filter(
    (a) => a.start && a.start.split('T')[0] === today
  );

  // Estados basados en appointments.schemas.ts y controller (Español)
  const pendingCount = myAppointments.filter(
    (a) => a.status === 'PENDIENTE'
  ).length;

  const confirmedCount = myAppointments.filter(
    (a) => a.status === 'CONFIRMADA'
  ).length;

  const completedTodayCount = todayAppointments.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'COMPLETADA'
  ).length;

  // ============================
  // 🚫 Validar acceso por rol
  // ============================
  if (user?.role !== 'stylist') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-4">
        <p className="text-xl">No tienes permisos para acceder a este panel.</p>
        <p className="text-sm text-gray-500">
          Rol detectado: {user?.role || 'Ninguno'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <StylistHeader
        user={user}
        unreadCount={unreadCount}
        setShowProfile={setShowProfile}
        logout={logout}
      />

      {/* MAIN CONTENT */}
      <main className="p-6">
        <div className="space-y-6">
          {/* TARJETAS */}
          <StylistStats
            todayCount={todayAppointments.length}
            pendingCount={pendingCount}
            confirmedCount={confirmedCount}
            completedTodayCount={completedTodayCount}
          />

          {/* CALENDARIO Y LISTA */}
          <StylistAppointments appointments={myAppointments} />
        </div>
      </main>

      {/* PERFIL */}
      <UserProfile open={showProfile} onOpenChange={setShowProfile} />
    </div>
  );
}