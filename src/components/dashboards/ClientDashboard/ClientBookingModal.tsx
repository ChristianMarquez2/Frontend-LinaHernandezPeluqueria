import { useEffect, useMemo } from 'react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';

import { useClientBooking } from './hooks/useClientBooking';
import { Service, Stylist } from '../../../contexts/data/types';
import { safeParseDate } from './utils';

import { Clock, CalendarCheck, Scissors } from 'lucide-react';

interface ClientBookingModalProps {
  isOpen: boolean;
  onClose: (shouldRefresh?: boolean) => void;
  isEditing: boolean;
  initialData?: any;
  services: Service[];
  stylists: Stylist[];
  onSave: (payload: { slotId: string; date: string; notes?: string }) => Promise<void>;
  loading?: boolean;
}

export function ClientBookingModal({
  isOpen,
  onClose,
  isEditing,
  initialData,
  services,
  stylists,
  onSave,
}: ClientBookingModalProps) {

  const token = localStorage.getItem("accessToken");

  const {
    selectedService, setSelectedService,
    selectedStylist, setSelectedStylist,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    bookingNotes, setBookingNotes,

    availableSlots,
    loadingSlots,
    loadingBooking,
    error: slotError,
    bookingError,

    confirmBooking,
    resetSelection
  } = useClientBooking(token);

  const filteredServices = useMemo(() => {
    if (!selectedStylist) return services;
    const currentStylist = stylists.find(s => s._id === selectedStylist);
    if (!currentStylist?.servicesOffered) return services;

    const offeredIds = currentStylist.servicesOffered.map(s =>
      typeof s === 'string' ? s : s._id
    );

    return services.filter(service => offeredIds.includes(service._id));
  }, [services, stylists, selectedStylist]);

  const filteredStylists = useMemo(() => {
    if (!selectedService) return stylists;
    return stylists.filter(stylist =>
      stylist.servicesOffered?.some(s =>
        (typeof s === 'string' ? s : s._id) === selectedService
      )
    );
  }, [stylists, selectedService]);

  useEffect(() => {
    if (selectedStylist && selectedService) {
      const stylist = stylists.find(s => s._id === selectedStylist);
      const offersService = stylist?.servicesOffered?.some(s =>
        (typeof s === 'string' ? s : s._id) === selectedService
      );
      if (!offersService) setSelectedStylist("");
    }
  }, [selectedService, selectedStylist, stylists, setSelectedStylist]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && initialData) {
      setSelectedService(initialData.servicioId?._id || initialData.servicioId || "");
      setSelectedStylist(initialData.estilistaId?._id || initialData.estilistaId || "");
      setSelectedDate(safeParseDate(initialData.inicio));
      setBookingNotes(initialData.notas || "");
    } else {
      resetSelection();
    }
  }, [isOpen, isEditing, initialData]);

  const handlePrimaryAction = async () => {
    if (!selectedSlot || !selectedDate) return;

    try {
      await onSave({
        slotId: selectedSlot.slotId,
        date: selectedDate,
        notes: bookingNotes
      });
      onClose(true);
    } catch (error) {
      console.error("Error al guardar la cita:", error);
    }
  };

  const isProcessing = loadingBooking;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto sm:max-w-lg">

        {/* HEADER */}
        <DialogHeader className="pb-3 border-b border-gray-800">
          <DialogTitle className="text-[#9D8EC1] flex items-center gap-2 text-xl">
            {isEditing ? <CalendarCheck className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
            {isEditing ? "Reprogramar Cita" : "Agendar Nueva Cita"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? "Selecciona una nueva fecha y horario."
              : "Completa los datos para reservar tu espacio."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3">

          {/* ERROR */}
          {bookingError && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm flex gap-2 items-center">
              <span>⚠️</span>
              <span>{bookingError}</span>
            </div>
          )}

          {/* SECCIÓN DATOS */}
          <div className="bg-black/30 border border-gray-800/60 rounded-xl p-4 space-y-4">

            {/* SERVICIO */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1 block">
                Servicio
              </label>
              <select
                value={selectedService}
                onChange={(e) => { setSelectedService(e.target.value); setSelectedSlot(null); }}
                disabled={isEditing || isProcessing}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-[#9D8EC1] outline-none"
              >
                <option value="">-- Selecciona Servicio --</option>
                {filteredServices.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.nombre} - ${s.precio}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ESTILISTA */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1 block">
                  Estilista
                </label>
                <select
                  value={selectedStylist}
                  onChange={(e) => setSelectedStylist(e.target.value)}
                  disabled={isProcessing}
                  className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-lg outline-none focus:border-[#9D8EC1]"
                >
                  <option value="">Cualquiera</option>
                  {filteredStylists.map(st => (
                    <option key={st._id} value={st._id}>
                      {st.nombre} {st.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {/* FECHA */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1 block">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={isProcessing}
                  className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-lg outline-none focus:border-[#9D8EC1]"
                />
              </div>
            </div>
          </div>

          {/* HORARIOS */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2 flex items-center gap-2">
              <Clock className="h-3 w-3" /> Horarios Disponibles
            </label>

            {slotError && <p className="text-red-400 text-xs mb-2">{slotError}</p>}

            <div className="min-h-[120px] bg-black/30 rounded-xl p-4 border border-gray-800/60">
              {!selectedDate || !selectedService ? (
                <div className="flex items-center justify-center text-gray-500 text-sm py-6">
                  Selecciona fecha y servicio
                </div>
              ) : loadingSlots ? (
                <div className="flex justify-center py-6 text-[#9D8EC1] animate-pulse">
                  Buscando horarios...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-amber-300/80 text-center text-sm py-6">
                  No hay espacios disponibles
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableSlots.map(slot => {
                    const time = new Date(slot.start).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const isSelected = selectedSlot?.slotId === slot.slotId;

                    return (
                      <button
                        key={slot.slotId}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={isProcessing}
                        className={`
                          flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all
                          ${isSelected
                            ? "bg-[#9D8EC1] text-black border-[#9D8EC1] scale-105 shadow-[0_0_15px_rgba(157,142,193,0.3)]"
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
                          }
                        `}
                      >
                        <span className="font-semibold text-[13px] tracking-wide">
                          {time}
                        </span>
                        <span className={`text-[9px] mt-0.5 truncate ${
                          isSelected ? "text-gray-800 font-medium" : "text-gray-500"
                        }`}>
                          {slot.stylistName.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* NOTAS */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1 block">
              Notas <span className="text-gray-600 font-normal">(opcional)</span>
            </label>
            <textarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              disabled={isProcessing}
              placeholder="Detalles adicionales..."
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg h-20 resize-none focus:border-[#9D8EC1] outline-none text-sm placeholder:text-gray-600"
            />
          </div>

        </div>

        {/* FOOTER */}
        <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="ghost"
            disabled={isProcessing}
            onClick={() => onClose()}
            className="text-gray-400 hover:text-white"
          >
            Cancelar
          </Button>

          <Button
            onClick={handlePrimaryAction}
            disabled={isProcessing || !selectedSlot}
            className={`bg-[#9D8EC1] hover:bg-[#8A7BAF] text-black font-semibold min-w-[160px]
              ${(isProcessing || !selectedSlot) ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isProcessing
              ? "Procesando..."
              : isEditing
              ? "Guardar Cambios"
              : "Confirmar Cita"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
