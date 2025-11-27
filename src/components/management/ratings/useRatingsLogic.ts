import { useState } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useData } from '../../../contexts/data/index'; // Para stylists y createRating
import { useAppointments } from '../../../contexts/data/index'; // 🔥 Para myBookings
import { Booking } from '../../../contexts/data/types';
import { toast } from 'sonner';

export function useRatingsLogic() {
  const { user } = useAuth();
  const { ratings, stylists, createRating } = useData();
  const { myBookings } = useAppointments(); // Usamos las reservas del cliente
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Filtrar mis ratings (Historial)
  // Como 'ratings' viene del backend filtrado por usuario (si es cliente), esto es seguro
  const myRatings = ratings; 

  // 2. Obtener IDs de citas ya calificadas
  const ratedBookingIds = myRatings.map(r => r.bookingId);

  // 3. Filtrar citas disponibles para calificar
  // Deben estar COMPLETADAS y NO estar en la lista de ratedBookingIds
  const unratedBookings = myBookings.filter((booking) => {
    return (
      booking.estado === 'COMPLETED' &&     // Estado del backend
      !ratedBookingIds.includes(booking._id) // No calificada aún
    );
  });

  // === Helpers ===

  // Obtener nombre del servicio (Booking trae objeto servicio populado)
  const getBookingTitle = (booking: Booking) => {
    if (booking.servicio && typeof booking.servicio === 'object') {
        return booking.servicio.nombre;
    }
    return 'Servicio General';
  };

  // Obtener nombre del estilista para el historial
  // (En el historial solo tenemos estilistaId en el rating, buscamos en la lista global de stylists)
  const getStylistNameById = (id: string) => {
    const s = stylists.find((stylist) => stylist._id === id);
    return s ? `${s.nombre} ${s.apellido}` : 'Estilista';
  };

  // Handler para crear
  const handleCreateRating = async (data: { bookingId: string; estrellas: number; comentario: string }) => {
    const success = await createRating(data);

    if (success) {
      toast.success('¡Gracias por tu calificación!');
      setIsDialogOpen(false);
    }
  };

  return {
    myRatings,
    unratedBookings, // Usamos Bookings
    isDialogOpen,
    setIsDialogOpen,
    getBookingTitle, 
    getStylistNameById,
    handleCreateRating,
  };
}