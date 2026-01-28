import { Menu, X, User } from 'lucide-react';
import { Button } from '../../ui/button';
import { APP_VERSION } from '../../../config/version';
import { Badge } from '../../ui/badge';

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  unreadCount: number;
  setShowProfile: (show: boolean) => void;
  user: any; 
  logout: () => void;
}

export function AdminHeader({
  sidebarOpen,
  setSidebarOpen,
  unreadCount,
  setShowProfile,
  user,
  logout,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-gray-800"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-[#D4AF37] font-semibold">Panel de Administración</h1>
          <span className="text-xs text-gray-500 ml-2">v{APP_VERSION}</span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowProfile(true)}
            className="text-white hover:bg-gray-800"
          >
            <User className="h-5 w-5" />
          </Button>

          <div
            className="text-right cursor-pointer"
            onClick={() => setShowProfile(true)}
          >
            <p className="text-sm hover:text-[#D4AF37] transition-colors">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>

          <Button
            onClick={logout}
            className="bg-gradient-to-r from-[#D4AF37] to-[#E8C962] text-black hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all"
          >
            Cerrar Sesión
          </Button>

        </div>
      </div>
    </header>
  );
}