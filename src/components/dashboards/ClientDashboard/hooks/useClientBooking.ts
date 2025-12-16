import { useState, useEffect, useCallback } from "react";
import { dataService } from "../../../../contexts/data/service";
import { AvailabilitySlot } from "../../../../contexts/data/types";

export function useClientBooking(token: string | null) {
  // --- Estados de Selección ---
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedStylist, setSelectedStylist] = useState<string>(""); // Opcional
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [bookingNotes, setBookingNotes] = useState<string>(""); // Nuevo: Notas para la cita

  // --- Data Cargada ---
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);

  // --- Estados de UI (Carga y Errores) ---
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false); // Nuevo: Carga al crear reserva
  const [error, setError] = useState<string | null>(null); // Error general o de slots
  const [bookingError, setBookingError] = useState<string | null>(null); // Nuevo: Error específico al reservar

  // 1. Buscar disponibilidad cuando cambian los filtros
  useEffect(() => {
    // Resetear selección dependiente
    setSelectedSlot(null);
    setAvailableSlots([]);
    setError(null);
    setBookingError(null);

    // Validar requisitos mínimos para buscar
    if (!token || !selectedService || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const slots = await dataService.fetchAvailability(
          token,
          selectedDate, // Asegúrate de que venga en formato YYYY-MM-DD
          selectedService,
          selectedStylist || undefined
        );
        setAvailableSlots(slots);
      } catch (err: any) {
        console.error(err);
        setError("No se pudieron cargar los horarios disponibles.");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [token, selectedService, selectedDate, selectedStylist]);

  // 2. Función para Confirmar la Reserva (POST)
  const confirmBooking = async () => {
    if (!token || !selectedSlot || !selectedDate) {
      setBookingError("Faltan datos para completar la reserva.");
      return false;
    }

    setLoadingBooking(true);
    setBookingError(null);

    try {
      // payload coincide con createBookingSchema del backend
      await dataService.createBooking(token, {
        slotId: selectedSlot.slotId, // El backend espera 'slotId' (singular) o 'slotIds'
        date: selectedDate,
        notas: bookingNotes,
      });
      
      return true; // Éxito
    } catch (err: any) {
      console.error("Error creating booking:", err);
      
      // Manejo de errores basado en tu backend (bookings.controller.ts)
      let msg = "Error al crear la reserva.";
      
      // Si el error viene del backend como objeto JSON
      if (err.message) {
        // Casos específicos detectados en tu backend:
        if (err.message.includes("bloqueada")) {
            msg = "Tu cuenta está temporalmente bloqueada por cancelaciones tardías.";
        } else if (err.message.includes("solapan") || err.message.includes("No disponible")) {
            msg = "El horario seleccionado ya no está disponible. Por favor elige otro.";
        } else if (err.message.includes("tienes una reserva")) {
            msg = "Ya tienes una reserva o cita en este horario.";
        } else {
            msg = err.message;
        }
      }
      
      setBookingError(msg);
      return false; // Fallo
    } finally {
      setLoadingBooking(false);
    }
  };

  // 3. Reset completo
  const resetSelection = useCallback(() => {
    setSelectedService("");
    setSelectedStylist("");
    setSelectedDate("");
    setSelectedSlot(null);
    setBookingNotes("");
    setAvailableSlots([]);
    setError(null);
    setBookingError(null);
  }, []);

  return {
    // Selectores
    selectedService, setSelectedService,
    selectedStylist, setSelectedStylist,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    bookingNotes, setBookingNotes,

    // Data
    availableSlots,

    // UI States
    loadingSlots,
    loadingBooking,
    error,
    bookingError,

    // Acciones
    confirmBooking,
    resetSelection
  };
}