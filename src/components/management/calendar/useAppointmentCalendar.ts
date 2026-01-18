import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { logger } from '../../../services/logger';
import { dataService } from '../../../contexts/data/service';
import { useData } from '../../../contexts/data/index';
import { useAuth } from '../../../contexts/auth';
import { API_BASE_URL } from '../../../config/api';
// Importamos tus tipos exactos
import type { Booking, Stylist, User } from '../../../contexts/data/types'; 

export function useAppointmentCalendar(enrichWithClientData: boolean = false) {
  const token = localStorage.getItem("accessToken");
  const { stylists, services } = useData(); // Obtenemos services del contexto
  const { user } = useAuth(); // Usuario actual para validación

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [clientsCache, setClientsCache] = useState<Map<string, User>>(new Map());
  const [failedClientIds, setFailedClientIds] = useState<Set<string>>(new Set());
  
  // Filtros
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStylistId, setSelectedStylistId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewAllDates, setViewAllDates] = useState<boolean>(false);
  
  const [loading, setLoading] = useState(false);

  // Función para cargar datos de clientes que no están en caché
  const enrichBookingsWithClientData = useCallback(async (bookings: Booking[]) => {
    if (!token || bookings.length === 0) return bookings;

    // Recolectar IDs de clientes únicos que no están ya poblados ni en caché ni fallidos
    const clientIdsToFetch = new Set<string>();
    bookings.forEach(booking => {
      if (typeof booking.clienteId === 'string' && !booking.cliente) {
        if (!clientsCache.has(booking.clienteId) && !failedClientIds.has(booking.clienteId)) {
          clientIdsToFetch.add(booking.clienteId);
        }
      }
    });

    // Si no hay nuevos IDs que buscar, retornar los bookings tal cual (sin esperar)
    if (clientIdsToFetch.size === 0) return bookings;

    logger.debug(`Loading client data for ${clientIdsToFetch.size} clients`, { clientIds: Array.from(clientIdsToFetch) }, 'useAppointmentCalendar');

    // Estrategia: Cargar cada usuario individualmente para evitar 403 en /users
    const newClients = new Map(clientsCache);
    const newFailedIds = new Set(failedClientIds);
    
    // Cargar usuarios en paralelo
    const promises = Array.from(clientIdsToFetch).map(async (clientId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${clientId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const userData = await res.json();
          newClients.set(clientId, {
            _id: userData._id,
            nombre: userData.nombre || '',
            apellido: userData.apellido || '',
            email: userData.email || '',
            role: userData.role || 'client'
          });
          logger.debug(`Client loaded successfully`, { clientId }, 'useAppointmentCalendar');
        } else if (res.status === 403 || res.status === 404) {
          // Usuario sin permisos o no encontrado
          newFailedIds.add(clientId);
          logger.warn(`Client not accessible`, { clientId, status: res.status }, 'useAppointmentCalendar');
        }
      } catch (err) {
        newFailedIds.add(clientId);
        logger.warn(`Error loading client`, { clientId, error: err }, 'useAppointmentCalendar');
      }
    });

    await Promise.all(promises);

    setClientsCache(newClients);
    setFailedClientIds(newFailedIds);
    logger.debug(`Client data enrichment complete`, { cachedClients: newClients.size, failedClients: newFailedIds.size }, 'useAppointmentCalendar');

    // Retornar bookings enriquecidos
    return bookings.map(booking => {
      if (typeof booking.clienteId === 'string' && !booking.cliente) {
        const clientData = newClients.get(booking.clienteId);
        if (clientData) {
          return {
            ...booking,
            cliente: {
              _id: clientData._id,
              nombre: clientData.nombre,
              apellido: clientData.apellido,
              email: clientData.email,
              role: clientData.role
            }
          };
        }
      }
      return booking;
    });
  }, [token, clientsCache, failedClientIds]);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    logger.debug('Fetching appointments', { selectedDate: selectedDate?.toISOString(), selectedStylistId, viewAllDates }, 'useAppointmentCalendar');
    
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

      // Enriquecer con datos de clientes SOLO si es necesario (Admin/Manager)
      const enriched = enrichWithClientData 
        ? await enrichBookingsWithClientData(filtered)
        : filtered;

      setBookings(enriched);

      // Calcular fechas ocupadas para el calendario UI
      const dates = data.map(b => new Date(b.inicio));
      setBookedDates(dates);

      logger.info('Appointments fetched successfully', { count: enriched.length, filtered: enriched.length }, 'useAppointmentCalendar');

    } catch (err) {
      logger.error("Error fetching bookings", { error: err }, 'useAppointmentCalendar');
      toast.error("Error al cargar el calendario");
    } finally {
      setLoading(false);
    }
  }, [token, selectedDate, selectedStylistId, selectedStatus, viewAllDates, enrichBookingsWithClientData, enrichWithClientData]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // === HELPERS INTELIGENTES ===

  const getServiceName = (booking: Booking) => {
    // 1. Intentar leer del objeto poblado 'servicio'
    if (booking.servicio?.nombre) return booking.servicio.nombre;
    
    // 2. Fallback: Buscar en servicioId si viene poblado como objeto
    const servicio = booking.servicioId as any;
    if (servicio && typeof servicio === 'object' && servicio.nombre) {
      return servicio.nombre;
    }
    
    // 3. Buscar en la lista de servicios del contexto usando el ID
    if (typeof booking.servicioId === 'string' && services) {
      const found = services.find(s => s._id === booking.servicioId || s.id === booking.servicioId);
      if (found) return found.nombre;
    }
    
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
    const isStylist = user?.role?.toLowerCase() === 'stylist' || user?.role?.toLowerCase() === 'estilista';
    
    // 1. Intentar leer del objeto poblado 'cliente' (nuevo campo en Booking)
    if (booking.cliente) {
      const { nombre, apellido, email } = booking.cliente;
      if (nombre) return `${nombre} ${apellido || ''}`.trim();
      if (email) return email;
    }
    
    // 2. Si el ID es desconocido/fallido, mostrar ID parcial
    if (typeof booking.clienteId === 'string') {
      if (failedClientIds.has(booking.clienteId)) {
        // Si es estilista sin permiso, mostrar "Nombre oculto"
        if (isStylist) {
          return 'Cliente (Nombre oculto)';
        }
        return `Cliente (${booking.clienteId.slice(-6)})`;
      }
      
      // 3. Buscar en el caché de clientes
      if (clientsCache.has(booking.clienteId)) {
        const client = clientsCache.get(booking.clienteId)!;
        if (client.nombre) return `${client.nombre} ${client.apellido || ''}`.trim();
        if (client.email) return client.email;
      }
    }
    
    // 4. Intentar leer del objeto clienteId si viene poblado
    const c = booking.clienteId as any; 
    if (c && typeof c === 'object') {
        if (c.nombre) return `${c.nombre} ${c.apellido || ''}`.trim();
        if (c.firstName) return `${c.firstName} ${c.lastName || ''}`.trim();
        if (c.email) return c.email;
    }

    // 5. Fallback: clientName (usado en Appointment)
    if ((booking as any).clientName) return (booking as any).clientName;

    // 6. Mostrar "Nombre oculto" para estilistas, ID parcial para admin/manager
    if (typeof booking.clienteId === 'string') {
      if (isStylist) {
        return 'Cliente (Nombre oculto)';
      }
      return `Cliente (${booking.clienteId.slice(-6)})`;
    }

    return "Cliente Registrado";
  };

  // Acciones (Usando tu dataService)
  const handleConfirm = async (id: string) => { 
      if (!token) return;
      try {
        const booking = bookings.find(b => b._id === id);
        
        console.log('✅ [CONFIRM] Intentando confirmar booking:', {
          bookingId: id,
          endpoint: `${id}/confirm`,
          currentUser: {
            id: user?.id,
            role: user?.role
          },
          booking: {
            estilistaId: booking?.estilistaId,
            estado: booking?.estado
          }
        });
        
        await dataService.updateBookingStatus(token, id, 'confirm', {}); 
        
        toast.success("Cita confirmada");
        fetchBookings();
      } catch(e: any) { 
        console.error('❌ [CONFIRM] Error completo:', e);
        console.error('❌ [CONFIRM] Mensaje:', e.message);
        
        const errorMsg = e.message || "Error al confirmar, el estilista asignado debe confirmar la cita";
        toast.error(errorMsg); 
      }
  };

  const handleComplete = async (id: string, notes: string) => { 
      if (!token) return;
      try {
        const booking = bookings.find(b => b._id === id);
        
        console.log('📝 [COMPLETE] Intentando completar booking:', {
          bookingId: id,
          notes,
          endpoint: `${id}/complete`,
          method: 'PATCH',
          currentUser: {
            id: user?.id,
            role: user?.role
          },
          booking: {
            estilistaId: booking?.estilistaId,
            estado: booking?.estado
          }
        });

        // Verificar si el usuario es el estilista asignado
        if (booking && user) {
          const estilistaId = typeof booking.estilistaId === 'string' 
            ? booking.estilistaId 
            : booking.estilistaId?._id;
          
          console.log('🔍 [COMPLETE] Comparando IDs:', {
            userId: user.id,
            estilistaId: estilistaId,
            match: user.id === estilistaId
          });

          if (user.role === 'stylist' && user.id !== estilistaId) {
            console.warn('⚠️ [COMPLETE] Usuario no es el estilista asignado');
          }
        }
        
        // ✅ El backend requiere clienteAsistio: true/false
        await dataService.updateBookingStatus(token, id, 'complete', { 
          notas: notes,
          clienteAsistio: true // Si estamos completando la cita, el cliente sí asistió
        });
        toast.success("Cita completada");
        fetchBookings();
      } catch(e: any) { 
        console.error('❌ [COMPLETE] Error completo:', e);
        console.error('❌ [COMPLETE] Mensaje:', e.message);
        console.error('❌ [COMPLETE] Stack:', e.stack);
        
        const errorMsg = e.message || "Error al completar, el estilista asignado debe completar la cita";
        toast.error(errorMsg); 
      }
  };

  const handleCancel = async (id: string, motivo: string) => { 
      if (!token) return;
      try {
        console.log('🚫 [CANCEL] Intentando cancelar booking:', { bookingId: id, motivo });
        
        await dataService.updateBookingStatus(token, id, 'cancel', { motivo });
        toast.success("Cita cancelada");
        fetchBookings();
      } catch(e: any) { 
        console.error('❌ [CANCEL] Error:', e);
        toast.error(e.message || "Error al cancelar"); 
      }
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