import { Clock, User } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Check, X, CheckCircle } from "lucide-react";
import type { Booking } from "../../../contexts/data/types"; // 🔥 Usamos Booking

interface AppointmentCardProps {
  booking: Booking;
  formatTime: (iso: string) => string;
  getServiceName: (booking: Booking) => string;
  getClientLabel: (booking: Booking) => string;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
}

export function AppointmentCard({
  booking,
  formatTime,
  getServiceName,
  getClientLabel,
  onConfirm,
  onCancel,
  onComplete,
}: AppointmentCardProps) {

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "SCHEDULED":
        return <Badge variant="outline" className="bg-yellow-900/40 text-yellow-200 border-yellow-800">Pendiente</Badge>;
      case "CONFIRMED":
        return <Badge variant="outline" className="bg-blue-900/40 text-blue-200 border-blue-800">Confirmada</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-900/40 text-green-200 border-green-800">Completada</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-900/40 text-red-200 border-red-800">Cancelada</Badge>;
      case "PENDING_STYLIST_CONFIRMATION":
        return <Badge variant="outline" className="bg-orange-900/40 text-orange-200 border-orange-800">Reprogramada</Badge>;
      case "NO_SHOW":
        return <Badge variant="outline" className="bg-gray-700 text-gray-300">No Asistió</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-800 text-gray-200 border-gray-700">{estado}</Badge>;
    }
  };

  const isActive = ["SCHEDULED", "CONFIRMED", "PENDING_STYLIST_CONFIRMATION"].includes(booking.estado);

  return (
    <Card className="bg-black border-gray-800 hover:border-gray-700 transition-colors">
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex flex-col gap-3">
          
          {/* Header: Hora y Estado */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-white font-medium">
              <Clock className="h-4 w-4 text-[#D4AF37]" />
              <span>
                {formatTime(booking.inicio)} - {formatTime(booking.fin)}
              </span>
            </div>
            {getStatusBadge(booking.estado)}
          </div>

          {/* Info Principal */}
          <div>
            <p className="text-white font-semibold text-lg leading-tight">
              {getServiceName(booking)}
            </p>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                <User className="h-3 w-3" />
                {getClientLabel(booking)}
            </div>
          </div>

          {/* Notas */}
          {booking.notas && (
            <div className="text-xs text-gray-500 italic bg-gray-900/50 p-2 rounded border border-gray-800/50">
              "{booking.notas}"
            </div>
          )}

          {/* Acciones */}
          {isActive && (
            <div className="flex gap-2 mt-2 pt-3 border-t border-gray-800">
              {booking.estado !== 'CONFIRMED' && (
                <Button size="sm" variant="ghost" className="h-8 flex-1 bg-blue-900/10 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300" onClick={() => onConfirm(booking._id)}>
                  <Check className="h-4 w-4 mr-1" /> Confirmar
                </Button>
              )}
              
              {booking.estado === 'CONFIRMED' && (
                <Button size="sm" variant="ghost" className="h-8 flex-1 bg-green-900/10 text-green-400 hover:bg-green-900/30 hover:text-green-300" onClick={() => onComplete(booking._id)}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Completar
                </Button>
              )}

              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-900/20 hover:text-red-300" onClick={() => onCancel(booking._id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}