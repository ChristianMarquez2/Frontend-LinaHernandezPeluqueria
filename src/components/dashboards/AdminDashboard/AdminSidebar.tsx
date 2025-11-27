import {
  Users,
  Calendar,
  Scissors,
  BarChart3,
  Layers, // <--- Importar Icono
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
    { id: 'users' as AdminView, label: 'Gestión de Usuarios', icon: Users },
    { id: 'stylists' as AdminView, label: 'Gestión de Estilistas', icon: Scissors },
    { id: 'schedules' as AdminView, label: 'Horarios de Atención', icon: Calendar },
    
    // Agregamos Categorías antes o después de Servicios
    { id: 'categories' as AdminView, label: 'Categorías / Catálogo', icon: Layers }, // <--- NUEVO ITEM
    { id: 'services' as AdminView, label: 'Servicios', icon: Scissors },
    
    { id: 'reports' as AdminView, label: 'Reportes y Estadísticas', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 bg-black min-h-[calc(100vh-4rem)] p-4">
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
              onClick={() => setCurrentView(item.id)}
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