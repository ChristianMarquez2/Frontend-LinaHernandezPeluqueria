import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useData } from '../../../contexts/data/index';
import { UserProfile } from '../../UserProfile';

// Sub-componentes
import { ManagerHeader } from './ManagerHeader';
import { ManagerSidebar } from './ManagerSidebar';
import { ManagerOverview } from './ManagerOverview';
import { ManagerView } from './types';

// Componentes de Gestión
import { StylistManagement } from '../../management/stylist/StylistManagement';
import { ScheduleManagement } from '../../management/schedule/ScheduleManagement';
import { ServiceManagement } from '../../management/services/ServiceManagement';
import { ReportsAndStats } from '../../management/reports/ReportsAndStats';

export function ManagerDashboard() {
  const { user, logout, refreshSession } = useAuth();
  const { getUserNotifications, fetchData } = useData();

  const [currentView, setCurrentView] = useState<ManagerView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  // 🔄 Cargar datos iniciales y refrescar sesión
  useEffect(() => {
    if (typeof fetchData === 'function') fetchData();

    const interval = setInterval(() => {
      if (typeof refreshSession === 'function') refreshSession();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchData, refreshSession]);

  // 🔔 Notificaciones
  const notifications =
    typeof getUserNotifications === 'function'
      ? getUserNotifications(user?.id || '')
      : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 🚫 Acceso restringido
  if (user?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>No tienes permisos para acceder a este panel.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <ManagerHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        unreadCount={unreadCount}
        setShowProfile={setShowProfile}
        user={user}
        logout={logout}
      />

      {/* LAYOUT */}
      <div className="flex">
        {/* Sidebar */}
        <ManagerSidebar
          isOpen={sidebarOpen}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {/* Contenido */}
        <main className="flex-1 p-6">
          {currentView === 'overview' && <ManagerOverview />}
          {currentView === 'stylists' && <StylistManagement />}
          {currentView === 'schedules' && <ScheduleManagement />}
          {currentView === 'services' && <ServiceManagement />}
          {currentView === 'reports' && <ReportsAndStats />}
        </main>
      </div>

      {/* Perfil */}
      <UserProfile open={showProfile} onOpenChange={setShowProfile} />
    </div>
  );
}