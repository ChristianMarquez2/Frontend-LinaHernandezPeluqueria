import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useData } from '../../../contexts/data/index';

// Sub-componentes UI
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminOverview } from './AdminOverview';
import { AdminView } from './types';
import { UserProfile } from '../../UserProfile';

// Módulos de Gestión
import { StylistManagement } from '../../management/stylist/StylistManagement';
import { ScheduleManagement } from '../../management/schedule/ScheduleManagement';
import { ServiceManagement } from '../../management/services/ServiceManagement';
import { ReportsAndStats } from '../../management/reports/ReportsAndStats';
import { UserManagement } from '../../management/users/UserManagement';
import { CategoryManagement } from '../../management/category/CategoryManagement';

// Nuevos Módulos Integrados
import { AppointmentCalendar } from '../../management/calendar/AppointmentCalendar'; // <--- NUEVO
import { RatingsManagement } from '../../management/ratings/RatingsManagement';     // <--- NUEVO
import { PaymentsManagement } from '../../management/payments/PaymentsManagement'; // <--- NUEVO: Gestión de Pagos

export function AdminDashboard() {
  const { user, logout, refreshSession } = useAuth();
  const { getUserNotifications, fetchData } = useData();

  // Recuperar vista guardada de localStorage o usar 'overview' por defecto
  const [currentView, setCurrentViewState] = useState<AdminView>(() => {
    const saved = localStorage.getItem('adminCurrentView');
    return (saved as AdminView) || 'overview';
  });

  // Wrapper para guardar en localStorage cuando cambia
  const setCurrentView = (view: AdminView) => {
    setCurrentViewState(view);
    localStorage.setItem('adminCurrentView', view);
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  // 🔄 Cargar datos
  useEffect(() => {
    if (user && typeof fetchData === 'function') {
      fetchData();
    }
  }, [user, fetchData]);

  // 🔁 Refrescar sesión
  useEffect(() => {
    if (typeof refreshSession === 'function') {
      const interval = setInterval(() => refreshSession(), 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshSession]);

  // 🔔 Notificaciones
  const notifications = typeof getUserNotifications === 'function' ? getUserNotifications(user?.id || '') : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 🚫 Validación
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <div className="flex h-screen items-center justify-center bg-black text-white">Acceso denegado.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* HEADER */}
      <AdminHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        unreadCount={unreadCount}
        setShowProfile={setShowProfile}
        user={user}
        logout={logout}
      />

      {/* LAYOUT PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <AdminSidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isOpen={sidebarOpen}
        />

        {/* CONTENIDO SCROLLEABLE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-black/50">
          <div className="max-w-7xl mx-auto">
            {currentView === 'overview' && <AdminOverview />}
            
            {/* Gestión Operativa */}
            {currentView === 'calendar' && <AppointmentCalendar />}
            {currentView === 'schedules' && <ScheduleManagement />}
            
            {/* Gestión Recursos */}
            {currentView === 'users' && <UserManagement />}
            {currentView === 'stylists' && <StylistManagement />}
            
            {/* Catálogo */}
            {currentView === 'categories' && <CategoryManagement />}
            {currentView === 'services' && <ServiceManagement />}
            
            {/* Análisis */}
            {currentView === 'ratings' && <RatingsManagement />} {/* Ahora el Admin ve todos los ratings */}
            {currentView === 'payments' && <PaymentsManagement />}
            {currentView === 'reports' && <ReportsAndStats />}
          </div>
        </main>
      </div>

      <UserProfile open={showProfile} onOpenChange={setShowProfile} />
    </div>
  );
}