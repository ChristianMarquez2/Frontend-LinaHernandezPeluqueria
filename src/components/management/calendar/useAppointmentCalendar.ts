import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { dataService } from '../../../contexts/data/service';
import { Booking } from '../../../contexts/data/index';
import { useData } from '../../../contexts/data/index';

export function useAppointmentCalendar() {
  const token = localStorage.getItem("accessToken");
  const { stylists } = useData();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStylistId, setSelectedStylistId] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  // Cargar citas cuando cambian los filtros
  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await dataService.fetchAllBookings(token, {
        date: selectedDate, 
        stylistId: selectedStylistId !== 'ALL' ? selectedStylistId : undefined
      });
      
      // Filtrado de seguridad
      const filtered = data.filter(b => b.inicio.startsWith(selectedDate));
      setBookings(filtered);

    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast.error("Error al cargar el calendario");
    } finally {
      setLoading(false);
    }
  }, [token, selectedDate, selectedStylistId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // === ACCIONES ===
  const handleConfirm = async (id: string) => {
    if (!token) return;
    try {
      await dataService.updateBookingStatus(token, id, 'confirm');
      toast.success("Cita confirmada");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleComplete = async (id: string, notes: string) => {
    if (!token) return;
    try {
      await dataService.updateBookingStatus(token, id, 'complete', { notas: notes });
      toast.success("Cita completada");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (id: string, motivo: string) => {
    if (!token) return;
    try {
      await dataService.updateBookingStatus(token, id, 'cancel', { motivo });
      toast.success("Cita cancelada");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // === HELPERS DE FORMATO (Para la Vista) ===
  
  const formatTime = (isoDate: string) => 
    new Date(isoDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const formatDateLabel = (dateStr: string) => 
    new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  // Obtener nombre del servicio de forma segura
  const getServiceName = (booking: Booking) => {
    if (booking.servicio && typeof booking.servicio === 'object') {
      return booking.servicio.nombre;
    }
    return 'Servicio';
  };

  // Obtener etiqueta del cliente (Backend popula clienteId)
  const getClientLabel = (booking: Booking) => {
    // Si clienteId viene populado como objeto
    const c = booking.clienteId as any; 
    if (c && c.nombre) {
        return `${c.nombre} ${c.apellido || ''}`.trim();
    }
    return 'Cliente Registrado';
  };

  return {
    bookings,
    loading,
    selectedDate,
    setSelectedDate,
    selectedStylistId,
    setSelectedStylistId,
    stylists,
    handleConfirm,
    handleComplete,
    handleCancel,
    // Helpers exportados para la UI
    formatTime,
    formatDateLabel,
    getServiceName,
    getClientLabel
  };
}