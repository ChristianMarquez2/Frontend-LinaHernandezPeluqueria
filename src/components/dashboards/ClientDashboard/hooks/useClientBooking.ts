import { useState, useEffect, useCallback } from "react";
import { dataService } from "../../../../contexts/data/service";
import { Service, AvailabilitySlot } from "../../../../contexts/data/types";

export function useClientBooking(token: string | null) {
  // Estados de selección
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedStylist, setSelectedStylist] = useState<string>(""); // Opcional
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  
  // Data cargada
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  
  // Estados de UI
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar disponibilidad cuando cambian los filtros
  useEffect(() => {
    // Reseteamos el slot seleccionado si cambian los parámetros
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (!token || !selectedService || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError(null);
      try {
        const slots = await dataService.fetchAvailability(
          token,
          selectedDate,
          selectedService,
          selectedStylist || undefined
        );
        setAvailableSlots(slots);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los horarios.");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [token, selectedService, selectedDate, selectedStylist]);

  const resetSelection = () => {
    setSelectedService("");
    setSelectedStylist("");
    setSelectedDate("");
    setSelectedSlot(null);
    setAvailableSlots([]);
    setError(null);
  };

  return {
    selectedService, setSelectedService,
    selectedStylist, setSelectedStylist,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    availableSlots,
    loadingSlots,
    error,
    resetSelection
  };
}