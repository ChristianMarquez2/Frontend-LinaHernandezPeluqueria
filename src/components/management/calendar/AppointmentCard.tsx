import { Clock, User, Scissors, CalendarDays } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Check, X, CheckCircle, Play } from "lucide-react"; // Añadí Play por si quieres estado 'En curso'
import type { Booking } from "../../../contexts/data/types";

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
    // Normalizamos a mayúsculas por seguridad
    const s = estado?.toUpperCase() || "";
    
    switch (s) {
      case "SCHEDULED": return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pendiente</Badge>;
      case "CONFIRMED": return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Confirmada</Badge>;
      case "COMPLETED": return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Completada</Badge>;
      case "CANCELLED": return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Cancelada</Badge>;
      case "PENDING_STYLIST_CONFIRMATION": return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Por Confirmar</Badge>;
      case "IN_PROGRESS": return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">En Curso</Badge>;
      default: return <Badge variant="outline" className="text-gray-400">{estado}</Badge>;
    }
  };

  // Lógica: Mostramos acciones siempre que la cita NO esté ya finalizada (Completada o Cancelada)
  // Esto le da el poder al admin de actuar sobre cualquier cita viva.
  const isFinished = ["COMPLETED", "CANCELLED"].includes(booking.estado);
  const showActions = !isFinished;

  // Helpers booleanos para legibilidad en el JSX
  const isConfirmed = booking.estado === 'CONFIRMED';
  const isInProgress = booking.estado === 'IN_PROGRESS';
  const isScheduled = booking.estado === 'SCHEDULED' || booking.estado === 'PENDING_STYLIST_CONFIRMATION';

  // Usamos booking.inicio directamente
  const dateObj = new Date(booking.inicio);
  const dateLabel = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  return (
    <Card className="bg-black border-gray-800 hover:border-gray-700 transition-colors group relative overflow-hidden">
      {/* Barra lateral de color */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          booking.estado === 'CONFIRMED' ? 'bg-blue-500' : 
          booking.estado === 'COMPLETED' ? 'bg-green-500' : 
          booking.estado === 'CANCELLED' ? 'bg-red-900' : 
          booking.estado === 'IN_PROGRESS' ? 'bg-purple-500' : 'bg-yellow-500'
      } opacity-50`} />

      <CardContent className="pt-4 pb-3 px-5">
        <div className="flex flex-col gap-3">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <CalendarDays className="h-3 w-3" />
                    <span>{dateLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                    <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                    <span>
                        {formatTime(booking.inicio)} - {formatTime(booking.fin)}
                    </span>
                </div>
            </div>
            {getStatusBadge(booking.estado)}
          </div>

          {/* Info Principal */}
          <div>
            <p className="text-white font-semibold text-lg leading-tight mb-2 truncate">
              {getServiceName(booking)}
            </p>
            
            <div className="space-y-1.5">
                {/* Cliente */}
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <User className="h-3.5 w-3.5 text-gray-500" />
                    <span className="truncate font-medium">{getClientLabel(booking)}</span>
                </div>
                {/* Estilista */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Scissors className="h-3.5 w-3.5 text-gray-600" />
                    <span className="italic truncate">Estilista: {getStylistLabel(booking)}</span>
                </div>
            </div>
          </div>

          {/* Notas */}
          {booking.notas && (
            <div className="text-xs text-gray-400 italic bg-gray-900 p-2 rounded border border-gray-800 mt-1">
              "{booking.notas}"
            </div>
          )}

          {/* Acciones - Panel de Administrador Flexible */}
          {showActions && (
            <div className="flex gap-2 mt-2 pt-3 border-t border-gray-800 opacity-90 group-hover:opacity-100 transition-opacity">
              
              {/* BOTÓN CONFIRMAR:
                  Aparece si NO está confirmada y NO está en curso.
                  Permite confirmar citas pendientes o reagendadas. */}
              {(!isConfirmed && !isInProgress) && (
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 flex-1 bg-blue-900/10 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 border border-blue-900/20" 
                    onClick={() => onConfirm(booking._id)}
                >
                  <Check className="h-4 w-4 mr-1" /> Confirmar
                </Button>
              )}
              
              {/* BOTÓN COMPLETAR:
                  Aparece si YA está confirmada O si está EN CURSO.
                  (Opcional: Si quieres que pueda completar DIRECTAMENTE desde Pendiente, quita la condición isScheduled check arriba) */}
              {(isConfirmed || isInProgress) && (
                <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 flex-1 bg-green-900/10 text-green-400 hover:bg-green-900/30 hover:text-green-300 border border-green-900/20" 
                    onClick={() => onComplete(booking._id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Completar
                </Button>
              )}

              {/* BOTÓN CANCELAR: 
                  Siempre visible si la cita está activa */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 text-red-400 hover:bg-red-900/20 hover:text-red-300 border border-red-900/10" 
                onClick={() => onCancel(booking._id)}
                title="Cancelar Cita"
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