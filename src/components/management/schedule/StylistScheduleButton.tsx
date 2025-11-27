import { Clock } from 'lucide-react';
import { Button } from '../../ui/button';

interface StylistScheduleButtonProps {
  stylistId: string;
  onClick?: () => void;
}

export function StylistScheduleButton({ stylistId, onClick }: StylistScheduleButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    // Ajusta la ruta según tu router
    window.location.href = `/admin/stylists/${stylistId}/schedule`;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-2 text-[#D4AF37] hover:bg-gray-800"
      aria-label={`Gestionar horarios del estilista ${stylistId}`}
      title="Gestionar Horarios"
    >
      <Clock className="h-4 w-4" />
      <span className="hidden sm:inline">Horarios</span>
    </Button>
  );
}