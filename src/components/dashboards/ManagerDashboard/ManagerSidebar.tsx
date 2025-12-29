import { BarChart3, Calendar, Scissors, CalendarDays, Star, Tag, CreditCard } from 'lucide-react';
import { Button } from '../../ui/button';
import { ManagerView } from './types';

interface ManagerSidebarProps {
  isOpen: boolean;
  currentView: ManagerView;
  setCurrentView: (view: ManagerView) => void;
}

export function ManagerSidebar({ isOpen, currentView, setCurrentView }: ManagerSidebarProps) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'overview', label: 'Panel Principal', icon: BarChart3 },
    { id: 'calendar', label: 'Agenda de Citas', icon: CalendarDays },
    { id: 'stylists', label: 'Gestión de Estilistas', icon: Scissors },
    { id: 'schedules', label: 'Horarios de Atención', icon: Calendar },
    { id: 'services', label: 'Servicios', icon: Tag },
    { id: 'ratings', label: 'Calificaciones', icon: Star },
    { id: 'payments', label: 'Pagos y Comprobantes', icon: CreditCard },
    { id: 'reports', label: 'Reportes y Estadísticas', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 p-4 border-r border-gray-800 bg-black min-h-[calc(100vh-4rem)]">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${
                currentView === item.id
                  ? 'bg-[#9D8EC1] text-white hover:bg-[#9D8EC1]/90'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={() => setCurrentView(item.id as ManagerView)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}