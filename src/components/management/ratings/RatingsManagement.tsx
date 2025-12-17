import { Plus, Star, Filter, User } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'; // Importar Selects
import { useRatingsLogic } from './useRatingsLogic';
import { RatingCard } from './RatingCard';
import { CreateRatingDialog } from './CreateRatingDialog';
import { useAppointments } from '../../../contexts/data/index';

export function RatingsManagement() {
  const {
    visibleRatings,       // Data filtrada
    unratedBookings,
    isDialogOpen,
    setIsDialogOpen,
    getBookingTitle,
    getStylistNameById,
    handleCreateRating,
    
    // Nuevos props del hook
    isAdmin,
    isClient,
    filterStar, setFilterStar,
    filterStylist, setFilterStylist,
    stylists
  } = useRatingsLogic();

  const { myBookings } = useAppointments();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h2 className="text-[#D4AF37] text-xl font-semibold">
                  {isAdmin ? "Gestión de Calificaciones" : "Historial de Calificaciones"}
               </h2>
               <p className="text-gray-400 text-sm">
                  {isAdmin 
                    ? "Monitorea la satisfacción de los clientes." 
                    : "Gestiona tus opiniones sobre nuestros servicios."}
               </p>
            </div>
            
            {/* Botón de crear solo para clientes */}
            {isClient && unratedBookings.length > 0 && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-medium shadow-lg shadow-[#9D8EC1]/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Calificar Pendiente ({unratedBookings.length})
              </Button>
            )}
        </div>

        {/* BARRA DE FILTROS (Solo Admin) */}
        {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-3 mt-2 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div className="w-full sm:w-48">
                    <Select value={filterStar} onValueChange={setFilterStar}>
                        <SelectTrigger className="bg-black border-gray-700 text-white">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-[#D4AF37]" />
                                <SelectValue placeholder="Estrellas" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="ALL">Todas las estrellas</SelectItem>
                            <SelectItem value="5">5 Estrellas</SelectItem>
                            <SelectItem value="4">4 Estrellas</SelectItem>
                            <SelectItem value="3">3 Estrellas</SelectItem>
                            <SelectItem value="2">2 Estrellas</SelectItem>
                            <SelectItem value="1">1 Estrella</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full sm:w-64">
                    <Select value={filterStylist} onValueChange={setFilterStylist}>
                        <SelectTrigger className="bg-black border-gray-700 text-white">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-[#9D8EC1]" />
                                <SelectValue placeholder="Estilista" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="ALL">Todos los Estilistas</SelectItem>
                            {stylists.map(s => (
                                <SelectItem key={s._id} value={s._id}>{s.nombre} {s.apellido}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        )}
      </div>

      {/* Lista de Calificaciones */}
      {visibleRatings.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-500">
              <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-lg font-medium text-gray-400">
                 {isAdmin ? "No se encontraron calificaciones con estos filtros." : "Aún no has calificado ningún servicio."}
              </p>
              
              {isClient && unratedBookings.length > 0 && (
                <p className="text-sm mt-2 text-[#D4AF37]">
                  ¡Tienes {unratedBookings.length} servicio(s) esperando tu opinión!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleRatings.map((rating) => {
            // Nota: Si eres admin, 'myBookings' no tendrá las citas de otros.
            // Para el admin, idealmente el objeto 'rating' del backend ya debería venir populado con el servicio.
            // Si no viene populado, tendrás que manejar un fallback.
            
            // Intento de fallback para nombre de servicio
            let serviceName = 'Servicio realizado';
            
            // Si soy cliente, lo busco en mis bookings
            if (isClient) {
                const originalBooking = myBookings.find(b => b._id === rating.bookingId);
                serviceName = originalBooking ? getBookingTitle(originalBooking) : 'Servicio Completado';
            } 
            
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

      {isClient && (
          <CreateRatingDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            unratedBookings={unratedBookings}
            getServiceName={getBookingTitle} 
            onSubmit={handleCreateRating}
          />
      )}
    </div>
  );
}