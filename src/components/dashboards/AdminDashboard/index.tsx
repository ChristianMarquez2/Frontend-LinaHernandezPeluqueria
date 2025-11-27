import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useData } from '../../../contexts/data/index';

// Sub-componentes importados
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminView } from './types';

// Componentes de Gestión (Rutas asumidas, ajusta si es necesario)
import { StylistManagement } from '../../management/stylist/StylistManagement';
import { ScheduleManagement } from '../../management/schedule/ScheduleManagement';
import { ServiceManagement } from '../../management/services/ServiceManagement';
import { ReportsAndStats } from '../../management/reports/ReportsAndStats';
import { UserManagement } from '../../management/users/UserManagement';
import { CategoryManagement } from '../../management/category/CategoryManagement';
import { UserProfile } from '../../UserProfile';

export function AdminDashboard() {
  const { user, logout, refreshSession } = useAuth();
  const { getUserNotifications, fetchData } = useData();

  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  // 🔄 Cargar datos iniciales
  useEffect(() => {
    if (user && typeof fetchData === 'function') {
      fetchData();
    }
  }, [user, fetchData]);

  // 🔁 Refrescar sesión (cada 10 minutos)
  useEffect(() => {
    if (typeof refreshSession !== 'function') {
      console.warn('AuthContext: refreshSession is not a function', refreshSession);
      return;
    }
    const interval = setInterval(() => {
      refreshSession();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshSession]);

  // 🔔 Notificaciones
  const notifications =
    typeof getUserNotifications === 'function'
      ? getUserNotifications(user?.id || '')
      : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 🚫 Validar acceso por rol
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>No tienes permisos para acceder a este panel.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <AdminHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        unreadCount={unreadCount}
        setShowProfile={setShowProfile}
        user={user}
        logout={logout}
      />

      {/* LAYOUT */}
      <div className="flex">
        {/* SIDEBAR */}
        <AdminSidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isOpen={sidebarOpen}
        />

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-6">
          {currentView === 'overview' && <AdminOverview />}
          {currentView === 'users' && <UserManagement />}
          {currentView === 'stylists' && <StylistManagement />}
          {currentView === 'schedules' && <ScheduleManagement />}
          {currentView === 'categories' && <CategoryManagement />}
          {currentView === 'services' && <ServiceManagement />}
          {currentView === 'reports' && <ReportsAndStats />}
        </main>
      </div>

      {/* MODAL PERFIL */}
      <UserProfile open={showProfile} onOpenChange={setShowProfile} />
    </div>
  );
}