import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { logger } from "../../../services/logger";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { LoadingAnimation } from "../../LoadingAnimation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { cn } from "../../ui/utils";

import { useAppointmentCalendar } from "./useAppointmentCalendar";
import { AppointmentCard } from "./AppointmentCard";
import { useAuth } from "../../../contexts/auth";


export function AppointmentCalendar({ enrichWithClientData = false }: { enrichWithClientData?: boolean }) {
  const { user } = useAuth();
  
  // Estados para diálogos
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string>("");
  const [cancelReason, setCancelReason] = useState("");
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completingBookingId, setCompletingBookingId] = useState<string>("");

  const {
    bookings,
    loading,
    selectedDate,
    setSelectedDate,
    selectedStylistId,
    setSelectedStylistId,
    selectedStatus,
    setSelectedStatus,
    viewAllDates,
    setViewAllDates,
    stylists,
    formatDateLabel,
    formatTime,
    getServiceName,
    getClientLabel,
    getStylistLabel,
    handleConfirm,
    handleCancel,
    handleComplete,
  } = useAppointmentCalendar(enrichWithClientData);

  const isStylist =
    user?.role?.toLowerCase() === "stylist" ||
    user?.role?.toLowerCase() === "estilista";

  useEffect(() => {
    if (isStylist && user?.id && selectedStylistId !== user.id) {
      logger.debug('AppointmentCalendar: Filtering to stylist appointments', { stylistId: user.id }, 'AppointmentCalendar');
      setSelectedStylistId(user.id);
    }
  }, [isStylist, user?.id, selectedStylistId, setSelectedStylistId]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      logger.debug('AppointmentCalendar: Date filter changed', { date: e.target.value }, 'AppointmentCalendar');
      setSelectedDate(new Date(`${e.target.value}T12:00:00`));
    } else {
      setSelectedDate(undefined as any);
    }
  };

  const dateValue = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  const handleCancelClick = (id: string) => {
    logger.info('AppointmentCalendar: Opening cancel dialog', { bookingId: id }, 'AppointmentCalendar');
    setCancellingBookingId(id);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (cancelReason.trim()) {
      logger.info('AppointmentCalendar: Confirming cancellation', { bookingId: cancellingBookingId, reason: cancelReason }, 'AppointmentCalendar');
      handleCancel(cancellingBookingId, cancelReason);
      setCancelDialogOpen(false);
      setCancelReason("");
    }
  };

  const handleCompleteClick = (id: string) => {
    logger.info('AppointmentCalendar: Opening complete dialog', { bookingId: id }, 'AppointmentCalendar');
    setCompletingBookingId(id);
    setCompleteDialogOpen(true);
  };

  const handleCompleteConfirm = () => {
    logger.info('AppointmentCalendar: Confirming completion', { bookingId: completingBookingId }, 'AppointmentCalendar');
    handleComplete(completingBookingId, "Finalizado desde panel");
    setCompleteDialogOpen(false);
  };

  return (
    <div className="appointment-calendar">
      <div className="appointment-calendar__container">
        <Card className="appointment-calendar__card">
          {/* HEADER */}
          <CardHeader className="appointment-calendar__header">
            <div className="appointment-calendar__header-top">
              <CardTitle className="appointment-calendar__title">
                <CalendarIcon className="appointment-calendar__icon" />
                {isStylist ? "Mi Agenda Personal" : "Gestión Global de Citas"}
              </CardTitle>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewAllDates(!viewAllDates)}
                className={cn(
                  "appointment-calendar__toggle-btn",
                  viewAllDates && "is-active"
                )}
              >
                {viewAllDates
                  ? "Ver solo hoy"
                  : "Ver historial completo"}
              </Button>
            </div>

            {/* FILTERS */}
            <div className="appointment-calendar__filters">
              {!viewAllDates && (
                <div className="appointment-calendar__field">
                  <Label>Fecha</Label>
                  <div className="appointment-calendar__date-wrapper">
                    <CalendarIcon className="appointment-calendar__date-icon" />
                    <input
                      type="date"
                      value={dateValue}
                      onChange={handleDateChange}
                      className="appointment-calendar__date-input"
                    />
                  </div>
                </div>
              )}

              {!isStylist && (
                <div className="appointment-calendar__field">
                  <Label>Estilista</Label>
                  <Select
                    value={selectedStylistId}
                    onValueChange={setSelectedStylistId}
                  >
                    <SelectTrigger className="appointment-calendar__select-trigger">
                      <SelectValue placeholder="Seleccionar estilista" />
                    </SelectTrigger>
                    <SelectContent className="appointment-calendar__select-content">
                      <SelectItem value="ALL">
                        Todos los profesionales
                      </SelectItem>
                      {stylists.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.nombre} {s.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="appointment-calendar__field">
                <Label>Estado</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="appointment-calendar__select-trigger">
                    <div className="appointment-calendar__select-inner">
                      <Filter size={14} />
                      <SelectValue placeholder="Estado" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="appointment-calendar__select-content">
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmadas</SelectItem>
                    <SelectItem value="COMPLETED">Finalizadas</SelectItem>
                    <SelectItem value="CANCELLED">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {/* CONTENT */}
          <CardContent className="appointment-calendar__content">
            <div className="appointment-calendar__results">
              <h3 className="appointment-calendar__results-title">
                {viewAllDates
                  ? "Historial de citas"
                  : formatDateLabel(selectedDate)}
                <Badge className="appointment-calendar__badge">
                  {bookings.length}
                </Badge>
              </h3>
            </div>

            {loading ? (
              <LoadingAnimation message="Cargando citas..." />
            ) : bookings.length === 0 ? (
              <div className="appointment-calendar__empty">
                <XCircle size={48} />
                <p>No hay citas para mostrar</p>
                <span>Cambia los filtros para ver resultados</span>
              </div>
            ) : (
              <div className="appointment-calendar__grid">
                {bookings.map((booking) => (
                  <AppointmentCard
                    key={booking._id}
                    booking={booking}
                    formatTime={formatTime}
                    getServiceName={getServiceName}
                    getClientLabel={getClientLabel}
                    getStylistLabel={getStylistLabel}
                    onConfirm={handleConfirm}
                    onCancel={handleCancelClick}
                    onComplete={handleCompleteClick}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de Cancelación */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#D4AF37]">
              Cancelar Cita
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Por favor indica el motivo de la cancelación. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Escribe el motivo de la cancelación..."
              className="bg-black border-gray-700 text-white min-h-[100px]"
              autoFocus
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setCancelDialogOpen(false)}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim()}
              className="btn-red"
            >
              Cancelar Cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Completar */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#D4AF37]">
              Completar Servicio
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              ¿Confirmas que el servicio finalizó correctamente?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setCompleteDialogOpen(false)}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteConfirm}
              className="bg-gradient-to-r from-[#D4AF37] to-[#E8C962] text-black hover:shadow-lg hover:shadow-[#D4AF37]/50"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* Label helper */
function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="appointment-calendar__label">
      {children}
    </label>
  );
}
