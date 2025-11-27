import { Plus, Star } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { useRatingsLogic } from './useRatingsLogic';
import { RatingCard } from './RatingCard';
import { CreateRatingDialog } from './CreateRatingDialog';
import { useAppointments } from '../../../contexts/data/index';

export function RatingsManagement() {
  const {
    myRatings,
    unratedBookings,
    isDialogOpen,
    setIsDialogOpen,
    getBookingTitle,
    getStylistNameById,
    handleCreateRating,
  } = useRatingsLogic();

  // Necesitamos acceso a myBookings para buscar nombres en el historial
  const { myBookings } = useAppointments();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header con botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
           <h2 className="text-[#D4AF37] text-xl font-semibold">Historial de Calificaciones</h2>
           <p className="text-gray-400 text-sm">Gestiona tus opiniones sobre nuestros servicios.</p>
        </div>
        
        {unratedBookings.length > 0 && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-medium shadow-lg shadow-[#9D8EC1]/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Calificar Pendiente ({unratedBookings.length})
          </Button>
        )}
      </div>

      {/* Lista de Calificaciones */}
      {myRatings.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-500">
              <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-lg font-medium text-gray-400">Aún no has calificado ningún servicio</p>
              
              {unratedBookings.length > 0 ? (
                <p className="text-sm mt-2 text-[#D4AF37]">
                  ¡Tienes {unratedBookings.length} servicio(s) esperando tu opinión!
                </p>
              ) : (
                <p className="text-sm mt-2">
                   Cuando completes una cita, podrás dejar tu opinión aquí.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myRatings.map((rating) => {
            // Buscamos la reserva original para mostrar el nombre del servicio
            // Si la reserva ya no existe en el contexto (ej. paginación), mostramos genérico
            const originalBooking = myBookings.find(b => b._id === rating.bookingId);
            const serviceName = originalBooking ? getBookingTitle(originalBooking) : 'Servicio Completado';
            
            // Nombre del estilista usando helper
            const stylistName = getStylistNameById(rating.estilistaId);

            return (
              <RatingCard
                key={rating._id}
                rating={rating}
                serviceName={serviceName}
                stylistName={stylistName}
              />
            );
          })}
        </div>
      )}

      <CreateRatingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        unratedBookings={unratedBookings}
        getServiceName={getBookingTitle} 
        onSubmit={handleCreateRating}
      />
    </div>
  );
}