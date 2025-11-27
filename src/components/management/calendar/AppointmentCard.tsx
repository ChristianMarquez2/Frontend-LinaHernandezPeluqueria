import { Clock } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import type { Appointment } from "../../../contexts/data/types";

interface AppointmentCardProps {
  appointment: Appointment;
  formatTime: (iso: string) => string;
  // CORRECCIÓN: El helper recibe la Appointment entera, no un string id
  getServiceNames: (appointment: Appointment) => string; 
  getClientLabel: (a: Appointment) => string;
}

export function AppointmentCard({
  appointment,
  formatTime,
  getServiceNames,
  getClientLabel,
}: AppointmentCardProps) {
  
  const getStatusBadge = (status: string) => {
    // Aseguramos que el switch coincida con los valores del backend
    switch (status) {
      case "PENDIENTE":
        return (
          <Badge variant="outline" className="bg-yellow-900/40 text-yellow-200 border-yellow-800">
            Pendiente
          </Badge>
        );
      case "CONFIRMADA":
        return (
          <Badge variant="outline" className="bg-blue-900/40 text-blue-200 border-blue-800">
            Confirmada
          </Badge>
        );
      case "COMPLETADA":
        return (
          <Badge variant="outline" className="bg-green-900/40 text-green-200 border-green-800">
            Completada
          </Badge>
        );
      case "CANCELADA":
        return (
          <Badge variant="outline" className="bg-red-900/40 text-red-200 border-red-800">
            Cancelada
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-800 text-gray-200 border-gray-700">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-black border-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-white">
                {formatTime(appointment.start)} — {formatTime(appointment.end)}
              </span>
              {getStatusBadge(appointment.status)}
            </div>

            <div>
              <p className="text-white font-medium">
                {/* CORRECCIÓN: Usamos el helper pasado por props en vez de mapear manualmente */}
                {getServiceNames(appointment)}
              </p>

              <p className="text-sm text-gray-400">
                {getClientLabel(appointment)}
              </p>
            </div>

            {appointment.notes && (
              <p className="text-sm text-gray-500 italic">
                Nota: {appointment.notes}
              </p>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );
}