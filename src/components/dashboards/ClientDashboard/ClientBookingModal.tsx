import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { useClientBooking } from './hooks/useClientBooking';
import { Service, Stylist } from '../../../contexts/data/types';
import { safeParseDate } from './utils';

interface ClientBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  appointmentId?: string | null; // ID si estamos editando
  initialData?: any;             // Datos iniciales si editamos
  
  services: Service[];
  stylists: Stylist[];
  onSave: (payload: { slotId: string; date: string; notes?: string }) => Promise<void>;
  loading: boolean;
}

export function ClientBookingModal({
  isOpen,
  onClose,
  isEditing,
  initialData,
  services,
  stylists,
  onSave,
  loading,
}: ClientBookingModalProps) {
  const token = localStorage.getItem("accessToken");
  const [notes, setNotes] = useState("");

  // Hook de lógica de slots
  const {
    selectedService, setSelectedService,
    selectedStylist, setSelectedStylist,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    availableSlots,
    loadingSlots,
    resetSelection
  } = useClientBooking(token);

  // Cargar datos iniciales si es edición
  useEffect(() => {
    if (isOpen && isEditing && initialData) {
      setSelectedService(initialData.servicioId?._id || initialData.servicioId || "");
      setSelectedStylist(initialData.estilistaId?._id || initialData.estilistaId || "");
      setSelectedDate(safeParseDate(initialData.inicio));
      // Nota: No podemos pre-seleccionar el slot exacto porque los slots son dinámicos,
      // el usuario tendrá que volver a elegir hora al reprogramar.
    } else if (isOpen && !isEditing) {
      // Resetear si es nueva cita
      resetSelection();
      setNotes("");
      // Preseleccionar primer servicio
      if (services.length > 0) setSelectedService(services[0]._id);
    }
  }, [isOpen, isEditing, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!selectedSlot || !selectedDate) return;
    onSave({
      slotId: selectedSlot.slotId,
      date: selectedDate,
      notes
    });
  };

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
              ? "Selecciona una nueva fecha y horario para tu cita." 
              : "Completa los datos para reservar tu espacio."}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
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
              disabled={isEditing} // A veces no permitimos cambiar servicio al reprogramar, opcional
            >
              <option value="">-- Selecciona Servicio --</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nombre} - ${s.precio} ({s.duracionMin} min)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Estilista y Fecha (Row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estilista <span className="text-gray-500 text-xs">(Opcional)</span>
              </label>
              <select
                value={selectedStylist}
                onChange={(e) => setSelectedStylist(e.target.value)}
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
            
            {!selectedDate || !selectedService ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-800 rounded-md text-gray-500">
                Selecciona servicio y fecha para ver horarios
              </div>
            ) : loadingSlots ? (
              <div className="text-center py-8 text-[#9D8EC1] animate-pulse">
                Buscando disponibilidad...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-md text-center text-sm">
                No hay horarios disponibles con estos criterios. Intenta otra fecha o estilista.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {availableSlots.map((slot) => {
                   // Extraer hora local limpia
                   const timeLabel = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                   const isSelected = selectedSlot?.slotId === slot.slotId && selectedSlot?.start === slot.start;

                   return (
                    <button
                      key={`${slot.slotId}-${slot.start}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-md border text-sm transition-all
                        ${isSelected 
                          ? "bg-[#9D8EC1] text-black border-[#9D8EC1] font-semibold ring-2 ring-offset-2 ring-offset-gray-900 ring-[#9D8EC1]" 
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-750"
                        }
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Alergias, preferencias..."
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-[#9D8EC1] outline-none h-20 resize-none"
             />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50">
          <Button
            variant="ghost"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSave}
            disabled={loading || !selectedSlot}
            className={`
              ${loading || !selectedSlot ? "opacity-50 cursor-not-allowed" : ""}
              bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-medium min-w-[120px]
            `}
          >
            {loading ? "Procesando..." : isEditing ? "Confirmar Cambio" : "Reservar Cita"}
          </Button>
        </div>
      </div>
    </div>
  );
}