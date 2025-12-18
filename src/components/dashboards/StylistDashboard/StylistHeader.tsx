import { Bell, User } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface StylistHeaderProps {
  user: any;
  unreadCount: number;
  setShowProfile: (show: boolean) => void;
  logout: () => void;
}

export function StylistHeader({
  user,
  unreadCount,
  setShowProfile,
  logout,
}: StylistHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4">
        <h1 className="text-[#D4AF37] font-semibold">Panel del Estilista</h1>

        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white hover:bg-gray-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-[#9D8EC1] flex items-center justify-center p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Perfil */}
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
              {/* CAMBIO: Usamos nombre y apellido que es lo que viene de la DB */}
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-gray-400">Estilista</p>
          </div>

          {/* Logout */}
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