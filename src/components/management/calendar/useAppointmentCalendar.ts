import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { dataService } from '../../../contexts/data/service';
import { useData } from '../../../contexts/data/index';
// Importamos tus tipos exactos
import type { Booking, Stylist } from '../../../contexts/data/types'; 

export function useAppointmentCalendar() {
  const token = localStorage.getItem("accessToken");
  const { stylists } = useData(); // Usamos los estilistas del contexto

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  
  // Filtros
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStylistId, setSelectedStylistId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewAllDates, setViewAllDates] = useState<boolean>(false);
  
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: any = {
        stylistId: selectedStylistId !== 'ALL' ? selectedStylistId : undefined
      };

      // Si no estamos viendo todo, filtramos por fecha en la petición
      if (!viewAllDates && selectedDate) {
        params.date = selectedDate.toISOString().split('T')[0];
      }

      const data = await dataService.fetchAllBookings(token, params);
      
      let filtered = data;

      // Filtro local de seguridad para fecha
      if (!viewAllDates && selectedDate) {
         const dateStr = selectedDate.toISOString().split('T')[0];
         filtered = filtered.filter(b => b.inicio.startsWith(dateStr));
      }

      // Filtro por Estado
      if (selectedStatus !== 'ALL') {
        filtered = filtered.filter(b => b.estado === selectedStatus);
      }

      // Ordenar: Más recientes primero
      filtered.sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());

      setBookings(filtered);

      // Calcular fechas ocupadas para el calendario UI
      const dates = data.map(b => new Date(b.inicio));
      setBookedDates(dates);

    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast.error("Error al cargar el calendario");
    } finally {
      setLoading(false);
    }
  }, [token, selectedDate, selectedStylistId, selectedStatus, viewAllDates]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // === HELPERS INTELIGENTES ===

  const getServiceName = (booking: Booking) => {
    // Tu interfaz Booking tiene: servicio?: { nombre... }
    if (booking.servicio?.nombre) return booking.servicio.nombre;
    return 'Servicio General';
  };

  const getStylistLabel = (booking: Booking) => {
    // 1. Intentar leer del objeto anidado en Booking (según tu interfaz)
    if (booking.estilista?.nombre) {
        return `${booking.estilista.nombre} ${booking.estilista.apellido}`;
    }
    
    // 2. Si no viene populado, buscar en la lista global de estilistas del Context
    if (stylists && booking.estilistaId) {
        const found = stylists.find(s => s._id === booking.estilistaId);
        if (found) return `${found.nombre} ${found.apellido}`;
    }

    return 'Sin estilista asignado';
  };

  const getClientLabel = (booking: Booking) => {
    // Intentamos "forzar" la lectura del objeto clienteId por si el backend lo manda populado
    // aunque la interfaz diga string.
    const c = booking.clienteId as any; 

    // Caso A: Es un objeto con nombre/apellido (formato Stylist/User hispano)
    if (c && typeof c === 'object') {
        if (c.nombre) return `${c.nombre} ${c.apellido || ''}`;
        if (c.firstName) return `${c.firstName} ${c.lastName || ''}`;
        if (c.email) return c.email; // Fallback al email
    }

    // Caso B: Tu interfaz 'Appointment' tiene clientName, a veces Booking también lo trae
    if ((booking as any).clientName) return (booking as any).clientName;

    // Caso C: No tenemos datos del cliente, solo el ID
    return "Cliente Registrado";
  };

  // Acciones (Usando tu dataService)
  const handleConfirm = async (id: string) => { 
      if (!token) return;
      try {
        await dataService.updateBookingStatus(token, id, 'confirm'); 
        toast.success("Cita confirmada");
        fetchBookings();
      } catch(e) { toast.error("Error al confirmar"); }
  };

  const handleComplete = async (id: string, notes: string) => { 
      if (!token) return;
      try {
        await dataService.updateBookingStatus(token, id, 'complete', { notas: notes });
        toast.success("Cita completada");
        fetchBookings();
      } catch(e) { toast.error("Error al completar"); }
  };

  const handleCancel = async (id: string, motivo: string) => { 
      if (!token) return;
      try {
        await dataService.updateBookingStatus(token, id, 'cancel', { motivo });
        toast.success("Cita cancelada");
        fetchBookings();
      } catch(e) { toast.error("Error al cancelar"); }
  };

  const formatTime = (isoDate: string) => 
    new Date(isoDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const formatDateLabel = (date?: Date) => 
    date ? date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Historial Completo';

  return {
    bookings,
    loading,
    stylists,
    selectedDate, setSelectedDate,
    selectedStylistId, setSelectedStylistId,
    selectedStatus, setSelectedStatus,
    viewAllDates, setViewAllDates,
    bookedDates,
    formatTime, formatDateLabel,
    getServiceName, getStylistLabel, getClientLabel,
    handleConfirm, handleComplete, handleCancel
  };
}