import {
  Users,
  Calendar,
  Scissors,
  BarChart3,
  Layers,
  Star, 
  Clock, 
  Tag,
  CreditCard 
} from 'lucide-react';
import { Button } from '../../ui/button';
import { AdminView } from './types';

interface AdminSidebarProps {
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;
  isOpen: boolean;
}

export function AdminSidebar({ currentView, setCurrentView, isOpen }: AdminSidebarProps) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'overview' as AdminView, label: 'Panel Principal', icon: BarChart3 },
    
    // Gestión Operativa
    { id: 'calendar' as AdminView, label: 'Agenda de Citas', icon: Clock }, 
    { id: 'schedules' as AdminView, label: 'Turnos y Horarios', icon: Calendar },
    
    // Gestión de Recursos
    { id: 'users' as AdminView, label: 'Usuarios', icon: Users },
    { id: 'stylists' as AdminView, label: 'Estilistas', icon: Scissors },
    
    // Catálogo
    { id: 'categories' as AdminView, label: 'Categorías', icon: Layers },
    { id: 'services' as AdminView, label: 'Servicios', icon: Tag },
    
    // Análisis y Feedback
    { id: 'ratings' as AdminView, label: 'Calificaciones', icon: Star }, 
    { id: 'payments' as AdminView, label: 'Pagos y Comprobantes', icon: CreditCard }, 
    { id: 'reports' as AdminView, label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 bg-black min-h-[calc(100vh-4rem)] p-4 flex-shrink-0 transition-all duration-300">
      <div className="mb-4 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Menú
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={`w-full justify-start mb-1 ${
                isActive
                  ? 'bg-[#9D8EC1] text-black hover:bg-[#9D8EC1]/90 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setCurrentView(item.id)}
            >
              <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-black' : 'text-gray-500'}`} />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}