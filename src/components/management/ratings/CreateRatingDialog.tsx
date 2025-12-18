import { useState } from 'react';
import { toast } from 'sonner';
import { StarRating } from './StarRating';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Booking } from '../../../contexts/data/types';
import { useData } from '../../../contexts/data/index';

interface CreateRatingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  unratedBookings: Booking[];
  onSubmit: (data: { bookingId: string; estrellas: number; comentario: string }) => Promise<void>;
}

export function CreateRatingDialog({
  isOpen,
  onOpenChange,
  unratedBookings,
  onSubmit
}: CreateRatingDialogProps) {
  const { services } = useData();
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Búsqueda del nombre real del servicio (Búsqueda inversa)
  const getFullServiceName = (booking: Booking) => {
    if (booking.servicio && typeof booking.servicio === 'object') return booking.servicio.nombre;
    const serviceId = typeof booking.servicioId === 'string' ? booking.servicioId : (booking as any).servicio;
    const found = services.find(s => s._id === serviceId);
    return found ? found.nombre : "Servicio de Belleza";
  };

  const handleClose = () => {
    setSelectedRating(0);
    setSelectedBookingId('');
    setComment('');
    setFormErrors({});
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: any = {};

    if (!selectedBookingId) errors.booking = "Seleccione una cita";
    if (selectedRating === 0) errors.rating = "Califique con estrellas";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Complete los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        bookingId: selectedBookingId,
        estrellas: selectedRating,
        comentario: comment,
      });
      toast.success("¡Gracias por tu opinión!");
      handleClose();
    } catch (error) {
      toast.error("No se pudo enviar la calificación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#D4AF37] flex items-center gap-2">
            Calificar Servicio
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Tu opinión nos ayuda a mejorar y reconoce el trabajo de nuestro equipo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* SELECTOR DE CITA (CATEGORÍA EN TU REFERENCIA) */}
          <div className="space-y-2">
            <Label htmlFor="booking">Cita a calificar *</Label>
            <select
              id="booking"
              value={selectedBookingId}
              onChange={(e) => {
                setSelectedBookingId(e.target.value);
                setFormErrors(prev => ({ ...prev, booking: "" }));
              }}
              className="w-full bg-black border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
            >
              <option value="">Seleccione una cita...</option>
              {unratedBookings.map((booking) => (
                <option key={booking._id} value={booking._id}>
                  {getFullServiceName(booking)} - {new Date(booking.inicio).toLocaleDateString()}
                </option>
              ))}
            </select>
            {formErrors.booking && <p className="text-red-400 text-xs">{formErrors.booking}</p>}
          </div>

          {/* ESTRELLAS (INPUTS NUMÉRICOS EN TU REFERENCIA) */}
          <div className="space-y-2">
            <Label>Tu Calificación *</Label>
            <div className="flex flex-col items-center justify-center bg-black/30 p-4 rounded-lg border border-gray-800 space-y-2">
              <StarRating 
                rating={selectedRating} 
                interactive={true} 
                onRate={(val) => {
                  setSelectedRating(val);
                  setFormErrors(prev => ({ ...prev, rating: "" }));
                }} 
                className="gap-3"
              />
              <p className="text-xs font-medium text-[#D4AF37] min-h-[1rem]">
                {selectedRating === 5 && "¡Excelente servicio!"}
                {selectedRating === 4 && "Muy buena atención"}
                {selectedRating === 3 && "Servicio aceptable"}
                {selectedRating <= 2 && selectedRating > 0 && "Podemos mejorar"}
              </p>
            </div>
            {formErrors.rating && <p className="text-red-400 text-xs text-center">{formErrors.rating}</p>}
          </div>

          {/* COMENTARIO (DESCRIPCIÓN EN TU REFERENCIA) */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentario adicional (Opcional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-black border-gray-700 resize-none h-24 text-sm"
              placeholder="¿Qué te pareció la atención?"
              maxLength={70}
            />
            <p className="text-[10px] text-gray-500 text-right">{comment.length}/70</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="btn-red"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-bold"
            >
              {isSubmitting ? "Enviando..." : "Publicar Calificación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}