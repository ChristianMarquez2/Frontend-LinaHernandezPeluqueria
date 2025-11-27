import { Bell, User } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface ClientHeaderProps {
  user: any;
  unreadCount: number;
  onOpenBooking: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export function ClientHeader({
  user,
  unreadCount,
  onOpenBooking,
  onOpenProfile,
  onLogout,
}: ClientHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4">
        <h1 className="text-[#D4AF37] font-semibold text-lg">
          Panel del Cliente
        </h1>

        <div className="flex items-center gap-4">
          <Button
            variant="default"
            onClick={onOpenBooking}
            className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90"
          >
            Agendar Cita
          </Button>

          {/* Notificaciones */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white hover:bg-gray-800"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-[#9D8EC1] p-0 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </Button>

          {/* Perfil */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenProfile}
            className="text-white hover:bg-gray-800"
          >
            <User className="h-5 w-5" />
          </Button>

          <div className="text-right cursor-pointer" onClick={onOpenProfile}>
            <p className="text-sm hover:text-[#D4AF37] transition-colors">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400">Cliente</p>
          </div>

          <Button
            variant="outline"
            onClick={onLogout}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}