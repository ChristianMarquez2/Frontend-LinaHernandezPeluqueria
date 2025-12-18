import { useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
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


export function AppointmentCalendar() {
  const { user } = useAuth();

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
  } = useAppointmentCalendar();

  const isStylist =
    user?.role?.toLowerCase() === "stylist" ||
    user?.role?.toLowerCase() === "estilista";

  useEffect(() => {
    if (isStylist && user?.id && selectedStylistId !== user.id) {
      setSelectedStylistId(user.id);
    }
  }, [isStylist, user?.id, selectedStylistId, setSelectedStylistId]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(`${e.target.value}T12:00:00`));
    } else {
      setSelectedDate(undefined as any);
    }
  };

  const dateValue = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

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
                    <SelectItem value="SCHEDULED">Pendientes</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmadas</SelectItem>
                    <SelectItem value="COMPLETED">Finalizadas</SelectItem>
                    <SelectItem value="CANCELLED">Canceladas</SelectItem>
                    <SelectItem value="NO_SHOW">No asistió</SelectItem>
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
              <div className="appointment-calendar__loading">
                <Loader2 className="spin" size={40} />
                <span>Cargando citas...</span>
              </div>
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
                    onCancel={(id) => {
                      const motivo = prompt(
                        "Motivo de la cancelación:"
                      );
                      if (motivo) handleCancel(id, motivo);
                    }}
                    onComplete={(id) => {
                      if (
                        window.confirm(
                          "¿Confirmar que el servicio finalizó?"
                        )
                      ) {
                        handleComplete(
                          id,
                          "Finalizado desde panel"
                        );
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
