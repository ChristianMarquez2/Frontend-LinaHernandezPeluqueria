import { useState, useMemo } from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { RatingsManagement } from '../../management/ratings/RatingsManagement';
import { safeParseDate, safeParseTime } from './utils';
import { Booking } from '../../../contexts/data/types';
import { useData } from '../../../contexts/data/index';
import { TransferPaymentDialog } from './TransferPaymentDialog';
import {
  CalendarDays,
  Clock,
  User,
  Filter,
  CheckCircle2,
  Calendar,
  Clock3 // Icono para "En revisión"
} from 'lucide-react';

interface ClientAppointmentsProps {
  showRatings: boolean;
  setShowRatings: (show: boolean) => void;
  appointments: Booking[];
  onEdit: (appointment: Booking) => void;
  onCancel: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; borderClass: string }> = {
  ALL: { label: "Todas", className: "status-badge-default", borderClass: "bg-gray-700" },
  CONFIRMED: { label: "Confirmada", className: "status-badge-confirmed", borderClass: "bg-[#D4AF37]" },
  COMPLETED: { label: "Completada", className: "status-badge-completed", borderClass: "bg-emerald-500" },
  CANCELLED: { label: "Cancelada", className: "status-badge-cancelled", borderClass: "bg-red-500" },
  NO_SHOW: { label: "No Asistió", className: "status-badge-noshow", borderClass: "bg-gray-500" },
};

export function ClientAppointments({
  showRatings,
  setShowRatings,
  appointments,
  onEdit,
  onCancel,
}: ClientAppointmentsProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const { services, stylists } = useData();
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null);

  // --- HELPERS DE BÚSQUEDA ---
  const getServiceName = (booking: Booking) => {
    if (booking.servicio && typeof booking.servicio === 'object') return booking.servicio.nombre;
    const serviceId = typeof booking.servicioId === 'string' ? booking.servicioId : (booking as any).servicio;
    const found = services.find(s => s._id === serviceId);
    return found ? found.nombre : "Servicio";
  };

  const getStylistName = (booking: Booking) => {
    if (booking.estilista && typeof booking.estilista === 'object') {
      return `${booking.estilista.nombre} ${booking.estilista.apellido}`;
    }
    const stylistId = typeof booking.estilistaId === 'string' ? booking.estilistaId : (booking as any).estilista;
    const found = stylists.find(s => s._id === stylistId);
    return found ? `${found.nombre} ${found.apellido}` : "Estilista asignado";
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredAppointments = useMemo(() => {
    let data = [...appointments];
    if (filterStatus !== "ALL") {
      data = data.filter(a => a.estado === filterStatus);
    }
    return data.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
  }, [appointments, filterStatus]);

  const renderStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.ALL;
    return (
      <Badge variant="outline" className={`status-badge ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* DIÁLOGO DE PAGO */}
      <TransferPaymentDialog
        isOpen={!!paymentBookingId}
        onClose={() => setPaymentBookingId(null)}
        bookingId={paymentBookingId}
        onSuccess={() => {
          setPaymentBookingId(null);
          // Aquí el estado del componente se actualizará solo si recargas los datos desde el padre
          // o si gestionas el estado localmente, pero al cerrarse ya no mostrará el botón
          // porque booking.transferProofUrl habrá cambiado en el backend (requiere refresh de datos).
        }}
      />

      {/* --- TABS --- */}
      <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-xl border border-gray-800 w-full sm:w-fit backdrop-blur-sm">
        <button
          onClick={() => setShowRatings(false)}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${!showRatings ? "bg-[#9D8EC1] text-black shadow-[0_0_15px_rgba(157,142,193,0.2)]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
          Mis Citas
        </button>
        <button
          onClick={() => setShowRatings(true)}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${showRatings ? "bg-[#9D8EC1] text-black shadow-[0_0_15px_rgba(157,142,193,0.2)]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
          Calificaciones
        </button>
      </div>

      {!showRatings ? (
        <div className="space-y-6">
          {/* Header y Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                <Calendar className="h-6 w-6 text-[#9D8EC1]" />
                Historial de Reservas
              </h2>
              <p className="text-gray-500 text-sm">Gestiona y revisa tus citas programadas.</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full sm:w-auto">
              {Object.keys(STATUS_CONFIG).map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => setFilterStatus(statusKey)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${filterStatus === statusKey ? "bg-gray-800 text-white border-[#9D8EC1] shadow-[0_0_10px_rgba(157,142,193,0.1)]" : "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300"}`}
                >
                  {STATUS_CONFIG[statusKey].label}
                </button>
              ))}
            </div>
          </div>

          {/* --- GRID DE TARJETAS --- */}
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
              <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                <Filter className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-gray-300 font-medium text-lg">No hay citas</h3>
              <p className="text-gray-500 text-sm mt-1">No se encontraron reservas con el filtro seleccionado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              {filteredAppointments.map((booking) => {
                const fecha = safeParseDate(booking.inicio);
                const hora = safeParseTime(booking.inicio);
                const isActive = ["SCHEDULED", "CONFIRMED", "PENDING_STYLIST_CONFIRMATION"].includes(booking.estado);
                const statusConfig = STATUS_CONFIG[booking.estado] || STATUS_CONFIG.ALL;

                // =========================================================
                // 💡 LÓGICA DE PAGO MODIFICADA (Frontend Forzado)
                // =========================================================

                const isCancelled = ["CANCELLED", "NO_SHOW", "COMPLETED"].includes(booking.estado);

                // 1. Ya pagó?
                const isPaid = booking.paymentStatus === 'PAID';

                // 2. Ya subió comprobante? (Aunque el admin no haya confirmado)
                const hasProof = !!booking.transferProofUrl;

                // 3. Mostrar botón SI: No está cancelada, No está pagada Y No tiene comprobante subido.
                // Ignoramos si está "Confirmed" o "Scheduled", sale siempre que deba plata.
                const showPayButton = !isCancelled && !isPaid && !hasProof;

                // 4. Mostrar "En revisión" SI: No está pagada PERO ya tiene foto
                const showReviewMessage = !isCancelled && !isPaid && hasProof;

                return (
                  <div key={booking._id} className="group relative h-full text-card-foreground flex flex-col gap-6 rounded-xl border bg-gray-900 border-gray-800 hover:bg-gray-800/50 transition-colors overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${statusConfig.borderClass}`} />
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        {renderStatusBadge(booking.estado)}
                        <span className="text-[10px] text-gray-600 font-mono bg-gray-900 px-2 py-1 rounded-md border border-gray-800">
                          #{booking._id.slice(-6)}
                        </span>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                          {getServiceName(booking)}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-white">
                          <div className="p-1 rounded-full bg-gray-900 border border-gray-800">
                            <User className="h-3 w-3 text-[#9D8EC1]" />
                          </div>
                          <span>{getStylistName(booking)}</span>
                        </div>
                      </div>

                      <div className="mt-auto mb-6 bg-gray-900/50 rounded-xl p-3 border border-gray-800 flex items-center justify-between group-hover:border-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#9D8EC1]/10 p-2 rounded-lg">
                            <CalendarDays className="h-4 w-4 text-[#9D8EC1]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-[#D4AF37] font-bold tracking-wider">Fecha</span>
                            <span className="text-white font-medium text-sm">{fecha}</span>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-800"></div>
                        <div className="flex items-center gap-3 pr-2">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase text-[#D4AF37] font-bold tracking-wider">Hora</span>
                            <span className="text-white font-medium text-sm">{hora}</span>
                          </div>
                          <Clock className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-800/50 flex flex-col gap-2">

                        {/* ✅ BOTÓN DE PAGO (Solo si no ha subido foto aún) */}
                        {showPayButton && (
                          <Button
                            onClick={() => setPaymentBookingId(booking._id)}
                            className="btn-gold-pay"
                          >
                            Pagar / Subir Comprobante
                          </Button>
                        )}

                        {/* ⏳ MENSAJE EN REVISIÓN (Si ya subió foto pero admin no confirma) */}
                        {showReviewMessage && (
                          <div className="w-full bg-blue-900/20 border border-blue-900/50 rounded-lg p-2.5 mb-2 flex items-center justify-center gap-2">
                            <Clock3 className="h-4 w-4 text-blue-400 animate-pulse" />
                            <span className="text-sm font-medium text-blue-200">Comprobante en revisión</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          {isActive ? (
                            <>
                              <Button variant="outline" onClick={() => onEdit(booking)} className="btn-green-outline flex-1 h-10">
                                Reprogramar
                              </Button>
                              <Button variant="ghost" onClick={() => onCancel(booking._id)} className="btn-red">
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <div className="w-full flex justify-end items-center gap-2 text-xs text-gray-300 opacity-90">
                              <span>Histórico</span>
                              {booking.estado === 'COMPLETED' ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-600"></div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <RatingsManagement />
        </div>
      )}
    </div>
  );
}