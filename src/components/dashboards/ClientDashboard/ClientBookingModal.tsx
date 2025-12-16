import { useEffect } from 'react';
import { Button } from '../../ui/button';
import { useClientBooking } from './hooks/useClientBooking';
import { Service, Stylist } from '../../../contexts/data/types';
import { safeParseDate } from './utils';

interface ClientBookingModalProps {
  isOpen: boolean;
  onClose: (shouldRefresh?: boolean) => void; // Actualizado para indicar si hubo cambios
  isEditing: boolean;
  initialData?: any;
  
  services: Service[];
  stylists: Stylist[];
  
  // onSave se usa principalmente para Reprogramar (PUT) 
  // ya que la Creación (POST) ahora la maneja el hook internamente.
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

  // 1. Hook actualizado con toda la lógica y estados
  const {
    selectedService, setSelectedService,
    selectedStylist, setSelectedStylist,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    bookingNotes, setBookingNotes, // Estado de notas en el hook
    
    availableSlots,
    loadingSlots,
    loadingBooking, // Estado de carga al confirmar
    error: slotError, // Error al buscar slots
    bookingError, // Error al confirmar reserva (Backend)
    
    confirmBooking, // Función para crear reserva
    resetSelection
  } = useClientBooking(token);

  // 2. Cargar datos iniciales o resetear
  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        // Cargar datos existentes
        setSelectedService(initialData.servicioId?._id || initialData.servicioId || "");
        setSelectedStylist(initialData.estilistaId?._id || initialData.estilistaId || "");
        setSelectedDate(safeParseDate(initialData.inicio));
        setBookingNotes(initialData.notas || ""); // Cargar notas existentes
      } else {
        // Reset para nueva cita
        resetSelection();
        if (services.length > 0) setSelectedService(services[0]._id);
      }
    }
  }, [isOpen, isEditing, initialData, services]); // Agregué services a dependencias

  if (!isOpen) return null;

  // 3. Manejador de la acción principal
  const handlePrimaryAction = async () => {
    if (!selectedSlot || !selectedDate) return;

    if (isEditing) {
      // CASO REPROGRAMAR:
      // Usamos la prop onSave porque la lógica de PUT (reprogramar) 
      // suele ser distinta a crear y puede requerir lógica del padre.
      try {
        await onSave({
          slotId: selectedSlot.slotId,
          date: selectedDate,
          notes: bookingNotes
        });
        onClose(true); // Cerramos y pedimos refrescar
      } catch (e) {
        console.error("Error al reprogramar desde modal", e);
      }
    } else {
      // CASO NUEVA CITA:
      // Usamos la lógica interna del hook (createBooking)
      const success = await confirmBooking();
      if (success) {
        onClose(true); // Éxito: cerrar modal y refrescar tabla padre
      }
      // Si falla, el hook setea 'bookingError' y se muestra en la UI automáticamente
    }
  };

  // Combinamos el estado de carga externo (si onSave es async) con el interno del hook
  const isProcessing = loadingBooking; 

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg bg-gray-900 border border-gray-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? "Reprogramar Cita" : "Agendar Nueva Cita"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isEditing 
              ? "Selecciona una nueva fecha y horario." 
              : "Completa los datos para reservar tu espacio."}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* Mensajes de Error (Backend) */}
          {bookingError && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-md text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{bookingError}</span>
            </div>
          )}

          {/* 1. Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Servicio</label>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-[#9D8EC1] focus:border-transparent outline-none transition-all"
              disabled={isEditing || isProcessing}
            >
              <option value="">-- Selecciona Servicio --</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nombre} - ${s.precio} ({s.duracionMin} min)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Estilista y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estilista <span className="text-gray-500 text-xs">(Opcional)</span>
              </label>
              <select
                value={selectedStylist}
                onChange={(e) => setSelectedStylist(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-[#9D8EC1] outline-none"
              >
                <option value="">Cualquiera disponible</option>
                {stylists.map((st) => (
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
                disabled={isProcessing}
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-[#9D8EC1] outline-none"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* 3. Slots (Horarios) */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Horarios Disponibles
            </label>
            
            {/* Error de carga de slots */}
            {slotError && (
               <p className="text-red-400 text-xs mb-2">{slotError}</p>
            )}

            {!selectedDate || !selectedService ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-800 rounded-md text-gray-500">
                Selecciona servicio y fecha para ver horarios
              </div>
            ) : loadingSlots ? (
              <div className="text-center py-8 text-[#9D8EC1] animate-pulse flex flex-col items-center">
                <span>Buscando disponibilidad...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-amber-900/20 border border-amber-900/50 text-amber-200 p-4 rounded-md text-center text-sm">
                No hay horarios disponibles. Intenta otra fecha o estilista.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {availableSlots.map((slot) => {
                   const timeLabel = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                   // Comparación estricta para saber si está seleccionado
                   const isSelected = selectedSlot?.slotId === slot.slotId;

                   return (
                    <button
                      key={slot.slotId}
                      onClick={() => setSelectedSlot(slot)}
                      disabled={isProcessing}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-md border text-sm transition-all
                        ${isSelected 
                          ? "bg-[#9D8EC1] text-black border-[#9D8EC1] font-semibold ring-2 ring-offset-2 ring-offset-gray-900 ring-[#9D8EC1]" 
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-750"
                        }
                        ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <span>{timeLabel}</span>
                      <span className={`text-[10px] truncate w-full text-center ${isSelected ? "text-black/70" : "text-gray-500"}`}>
                        {slot.stylistName.split(' ')[0]}
                      </span>
                    </button>
                   );
                })}
              </div>
            )}
          </div>

          {/* 4. Notas */}
          <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Notas (Opcional)</label>
             <textarea 
               value={bookingNotes}
               onChange={(e) => setBookingNotes(e.target.value)}
               disabled={isProcessing}
               placeholder="Alergias, preferencias, código de entrada..."
               className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-[#9D8EC1] outline-none h-20 resize-none"
             />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50">
          <Button
            variant="ghost"
            onClick={() => onClose()}
            disabled={isProcessing}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>

          <Button
            onClick={handlePrimaryAction}
            disabled={isProcessing || !selectedSlot}
            className={`
              ${(isProcessing || !selectedSlot) ? "opacity-50 cursor-not-allowed" : ""}
              bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-medium min-w-[140px]
            `}
          >
            {isProcessing 
              ? "Procesando..." 
              : isEditing 
                ? "Confirmar Cambio" 
                : "Reservar Cita"}
          </Button>
        </div>
      </div>
    </div>
  );
}