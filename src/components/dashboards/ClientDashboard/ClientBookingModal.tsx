import { useEffect, useMemo } from 'react'; // Importamos useMemo
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

interface ClientBookingModalProps {
  isOpen: boolean;
  onClose: (shouldRefresh?: boolean) => void;
  isEditing: boolean;
  initialData?: any;
  services: Service[];
  stylists: Stylist[];
  onSave: (payload: { slotId: string; date: string; notes?: string }) => Promise<void>;
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

  /* =======================
      LÓGICA DE FILTRADO (Cross-Filtering)
     ======================= */

  // 1. Filtrar Servicios: Si hay estilista seleccionado, solo mostrar sus servicios.
  const filteredServices = useMemo(() => {
    if (!selectedStylist) return services; // Si no hay estilista, mostrar todos

    const currentStylist = stylists.find(s => s._id === selectedStylist);
    if (!currentStylist || !currentStylist.servicesOffered) return services;

    // Extraemos los IDs de los servicios que ofrece el estilista
    const offeredIds = currentStylist.servicesOffered.map(s => 
      typeof s === 'string' ? s : s._id
    );

    return services.filter(service => offeredIds.includes(service._id));
  }, [services, stylists, selectedStylist]);

  // 2. Filtrar Estilistas: Si hay servicio seleccionado, solo mostrar estilistas que lo hagan.
  const filteredStylists = useMemo(() => {
    if (!selectedService) return stylists; // Si no hay servicio, mostrar todos

    return stylists.filter(stylist => {
      // Verificar si el estilista ofrece el servicio seleccionado
      if (!stylist.servicesOffered) return false;
      
      return stylist.servicesOffered.some(s => 
        (typeof s === 'string' ? s : s._id) === selectedService
      );
    });
  }, [stylists, selectedService]);

  // 3. Auto-corrección: Si cambio el servicio y el estilista seleccionado YA NO lo ofrece, limpiar estilista.
  useEffect(() => {
    if (selectedStylist && selectedService) {
      const stylist = stylists.find(s => s._id === selectedStylist);
      const offersService = stylist?.servicesOffered?.some(s => 
        (typeof s === 'string' ? s : s._id) === selectedService
      );

      if (!offersService) {
        setSelectedStylist(""); // Resetear estilista si hay conflicto
      }
    }
  }, [selectedService, selectedStylist, stylists, setSelectedStylist]);


  /* =======================
      Inicialización
     ======================= */
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && initialData) {
      setSelectedService(initialData.servicioId?._id || initialData.servicioId || "");
      setSelectedStylist(initialData.estilistaId?._id || initialData.estilistaId || "");
      setSelectedDate(safeParseDate(initialData.inicio));
      setBookingNotes(initialData.notas || "");
    } else {
      resetSelection();
      // Opcional: Preseleccionar el primer servicio de la lista filtrada si lo deseas
      // if (services.length > 0) setSelectedService(services[0]._id);
    }
  }, [isOpen, isEditing, initialData, services]); // quitamos resetSelection de deps para evitar loops

  const handlePrimaryAction = async () => {
    if (!selectedSlot || !selectedDate) return;

    if (isEditing) {
      try {
        await onSave({
          slotId: selectedSlot.slotId,
          date: selectedDate,
          notes: bookingNotes
        });
        onClose(true);
      } catch (e) {
        console.error("Error al reprogramar", e);
      }
    } else {
      const success = await confirmBooking();
      if (success) onClose(true);
    }
  };

  const isProcessing = loadingBooking;

  /* =======================
      RENDER
     ======================= */
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-[#9D8EC1]">
            {isEditing ? "Reprogramar Cita" : "Agendar Nueva Cita"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? "Selecciona una nueva fecha y horario."
              : "Completa los datos para reservar tu espacio."}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-5 py-2">

          {/* Error Backend */}
          {bookingError && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md text-sm flex gap-2">
              <span>⚠️</span>
              <span>{bookingError}</span>
            </div>
          )}

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Servicio</label>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setSelectedSlot(null);
              }}
              disabled={isEditing || isProcessing}
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-[#9D8EC1]"
            >
              <option value="">-- Selecciona Servicio --</option>
              {/* 🔥 USAMOS LA LISTA FILTRADA */}
              {filteredServices.map(s => (
                <option key={s._id} value={s._id}>
                  {s.nombre} - ${s.precio} ({s.duracionMin} min)
                </option>
              ))}
            </select>
            {filteredServices.length === 0 && selectedStylist && (
               <p className="text-xs text-yellow-500 mt-1">Este estilista no tiene servicios asignados disponibles.</p>
            )}
          </div>

          {/* Estilista + Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estilista</label>
              <select
                value={selectedStylist}
                onChange={(e) => setSelectedStylist(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-md"
              >
                {/* Si seleccionó servicio, "Cualquiera disponible" buscará en el backend 
                   entre todos los que hacen ese servicio (el backend ya filtra disponibilidad).
                */}
                <option value="">Cualquiera disponible</option>
                
                {/* 🔥 USAMOS LA LISTA FILTRADA */}
                {filteredStylists.map(st => (
                  <option key={st._id} value={st._id}>
                    {st.nombre} {st.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                disabled={isProcessing}
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-md"
              />
            </div>
          </div>

          {/* Horarios */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Horarios Disponibles
            </label>

            {slotError && (
              <p className="text-red-400 text-xs mb-2">{slotError}</p>
            )}

            {!selectedDate || !selectedService ? (
              <div className="text-center p-6 border border-dashed border-gray-800 rounded-md text-gray-500">
                Selecciona servicio y fecha para ver horarios
              </div>
            ) : loadingSlots ? (
              <div className="text-center py-6 text-[#9D8EC1] animate-pulse">
                Buscando disponibilidad...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-amber-900/20 border border-amber-900/50 text-amber-200 p-4 rounded-md text-center text-sm">
                No hay horarios disponibles para estos criterios.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1">
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
                      className={`p-2 rounded-md border text-sm transition-all
                        ${isSelected
                          ? "bg-[#9D8EC1] text-black border-[#9D8EC1] ring-2 ring-offset-2 ring-offset-gray-900"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"}
                      `}
                    >
                      <span>{time}</span>
                      <span className="block text-[10px] opacity-70 truncate w-full">
                        {slot.stylistName.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
            <textarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-md h-20 resize-none"
              placeholder="Alergias, preferencias, observaciones..."
            />
          </div>

        </div>

        {/* Footer */}
        <DialogFooter className="pt-4 gap-3">
          <Button
            type="button"
            onClick={() => onClose()}
            disabled={isProcessing}
            className="btn-red"
          >
            Cancelar
          </Button>

          <Button
            onClick={handlePrimaryAction}
            disabled={isProcessing || !selectedSlot}
            className={`bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-medium min-w-[160px]
              ${(isProcessing || !selectedSlot) ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isProcessing
              ? "Procesando..."
              : isEditing
                ? "Confirmar Cambio"
                : "Reservar Cita"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}