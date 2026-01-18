import { User } from 'lucide-react';
import { Button } from '../../ui/button';
import { APP_VERSION } from '../../../config/version';

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
          <span className="text-xs text-gray-500 ml-2">v{APP_VERSION}</span>
        </h1>

        <div className="flex items-center gap-4">
          <Button
            variant="default"
            onClick={onOpenBooking}
            className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90"
          >
            Agendar Cita
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
            className="bg-gradient-to-r from-[#D4AF37] to-[#E8C962] text-black hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}