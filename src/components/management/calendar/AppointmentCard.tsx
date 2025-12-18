import { Clock, User, Scissors, CalendarDays, Check, X, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import type { Booking } from "../../../contexts/data/types";
import { cn } from "../../ui/utils";

interface AppointmentCardProps {
  booking: Booking;
  formatTime: (iso: string) => string;
  getServiceName: (booking: Booking) => string;
  getClientLabel: (booking: Booking) => string;
  getStylistLabel: (booking: Booking) => string;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
}

export function AppointmentCard({
  booking,
  formatTime,
  getServiceName,
  getClientLabel,
  getStylistLabel,
  onConfirm,
  onCancel,
  onComplete,
}: AppointmentCardProps) {

  const getStatusBadge = (estado: string) => {
    const s = estado?.toUpperCase() || "";
    switch (s) {
      case "SCHEDULED":
        return <Badge variant="outline" className="bg-yellow-900 text-yellow-200 border-yellow-500/20">Programada</Badge>;
      case "CONFIRMED":
        return <Badge variant="outline" className="bg-blue-900 text-blue-500 border-blue-500/20">Confirmada</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-900 text-green-200">Completada</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-900 text-red-200">Cancelada</Badge>;
      case "NO_SHOW":
        return <Badge variant="outline" className="bg-gray-900 text-gray-400 border-gray-500/20">No asistió</Badge>;
      case "PENDING_STYLIST_CONFIRMATION":
        return <Badge variant="outline" className="bg-yellow-900 text-yellow-200 border-yellow-500/20">Reagendada</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-400">{estado}</Badge>;
    }
  };

  // Lógica de visualización basada en estados del backend
  const isFinished = ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.estado);
  const canConfirm = ["SCHEDULED", "PENDING_STYLIST_CONFIRMATION"].includes(booking.estado);
  const canComplete = booking.estado === "CONFIRMED";
  const canCancel = !isFinished;

  const dateObj = new Date(booking.inicio);
  const dateLabel = dateObj.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });

  return (
    <Card className="bg-black border-gray-800 hover:border-gray-700 transition-all group relative overflow-hidden shadow-lg">
      {/* Barra lateral de color dinámica según estado real */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
        booking.estado === 'CONFIRMED' && 'bg-blue-500',
        booking.estado === 'COMPLETED' && 'bg-green-500',
        booking.estado === 'CANCELLED' && 'bg-red-600',
        booking.estado === 'SCHEDULED' && 'bg-yellow-500',
        booking.estado === 'PENDING_STYLIST_CONFIRMATION' && 'bg-orange-500',
        booking.estado === 'NO_SHOW' && 'bg-gray-700'
      )} />

      <CardContent className="pt-5 pb-4 px-6">
        <div className="flex flex-col gap-4">

          {/* Fila 1: Fecha y Estado */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <CalendarDays className="h-3 w-3" />
                <span>{dateLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Clock className="h-4 w-4 text-[#D4AF37]" />
                <span>{formatTime(booking.inicio)}</span>
              </div>
            </div>
            {getStatusBadge(booking.estado)}
          </div>

          {/* Fila 2: Servicio e Intervinientes */}
          <div className="space-y-3">
            <p className="text-[#D4AF37] font-bold text-xl leading-tight truncate" title={getServiceName(booking)}>
              {getServiceName(booking)}
            </p>

            <div className="grid gap-2">
              <div className="flex items-center gap-2.5 text-sm text-gray-300">
                <div className="p-1 bg-gray-800 rounded">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <span className="truncate font-medium">{getClientLabel(booking)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <div className="p-1 bg-gray-800 rounded">
                  <Scissors className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <span className="truncate">Estilista: <span className="text-gray-300">{getStylistLabel(booking)}</span></span>
              </div>
            </div>
          </div>

          {/* Notas del cliente */}
          {booking.notas && (
            <div className="flex gap-2 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/10 mt-1">
              <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                {booking.notas}
              </p>
            </div>
          )}

          {/* Acciones de Control */}
          {!isFinished && (
            <div className="flex gap-2 mt-2 pt-4 border-t border-gray-800/50">

              {canConfirm && (
                <Button
                  size="sm"
                  className="flex-1 bg-blue-900 hover:bg-blue-700 text-white font-bold h-9 shadow-lg shadow-blue-900/20"
                  onClick={() => onConfirm(booking._id)}
                >
                  <Check className="h-4 w-4 mr-2" /> Confirmar
                </Button>
              )}

              {canComplete && (
                <Button
                  size="sm"
                  className="flex-1 bg-green-900 hover:bg-green-700 text-white font-bold h-9 shadow-lg shadow-green-900/20"
                  onClick={() => onComplete(booking._id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Finalizar
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="bg-red-900 text-red-200"
                onClick={() => onCancel(booking._id)}
                title="Cancelar cita"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}