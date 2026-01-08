import { useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useData } from '../../../contexts/data/index';
import { useAppointments } from '../../../contexts/data/index';
import { Booking } from '../../../contexts/data/types';
import { toast } from 'sonner';

export function useRatingsLogic() {
  const { user } = useAuth();
  const { ratings, stylists, createRating } = useData();
  const { myBookings } = useAppointments();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estados para filtros (Solo Admin)
  const [filterStar, setFilterStar] = useState<string>('ALL');
  const [filterStylist, setFilterStylist] = useState<string>('ALL');

  const role = (user?.role || '').toString().toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'MANAGER';
  const isClient = role === 'CLIENTE' || role === 'CLIENT';

  // 1. Lógica de Visualización (Filtered Ratings)
  const visibleRatings = useMemo(() => {
    let result = ratings;

    // Si es admin, aplicamos filtros de UI
    if (isAdmin) {
      if (filterStar !== 'ALL') {
        result = result.filter(r => r.estrellas === Number(filterStar));
      }
      if (filterStylist !== 'ALL') {
        result = result.filter(r => r.estilistaId === filterStylist);
      }
    }
    
    return result;
  }, [ratings, isAdmin, filterStar, filterStylist]);

  // 2. Lógica de Creación (Solo Clientes)
  // Obtenemos IDs de citas ya calificadas por el usuario actual
  // Nota: Si ratings trae TODAS las del sistema (admin), esto podría fallar.
  // Pero para el cliente, el context solo trae las suyas, así que funciona.
  const ratedBookingIds = isClient ? ratings.map(r => r.bookingId) : [];

  const unratedBookings = isClient ? myBookings.filter((booking) => {
    return (
      booking.estado === 'COMPLETED' && 
      !ratedBookingIds.includes(booking._id)
    );
  }) : [];

  // === Helpers ===
  const getBookingTitle = (booking: Booking) => {
    if (booking.servicio && typeof booking.servicio === 'object') {
        return booking.servicio.nombre;
    }
    return 'Servicio General';
  };

  const getStylistNameById = (id: string) => {
    const s = stylists.find((stylist) => stylist._id === id);
    return s ? `${s.nombre} ${s.apellido}` : 'Estilista';
  };

  const handleCreateRating = async (data: { bookingId: string; estrellas: number; comentario: string }) => {
    const success = await createRating(data);
    if (success) {
      toast.success('¡Gracias por tu calificación!');
      setIsDialogOpen(false);
    }
  };

  return {
    visibleRatings,      // Usar esto en lugar de myRatings
    unratedBookings,
    isDialogOpen,
    setIsDialogOpen,
    getBookingTitle, 
    getStylistNameById,
    handleCreateRating,
    
    // Filtros y Roles
    isAdmin,
    isClient,
    filterStar, setFilterStar,
    filterStylist, setFilterStylist,
    stylists, // Para llenar el select de estilistas
  };
}