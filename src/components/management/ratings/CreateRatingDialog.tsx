import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { toast } from 'sonner';
import { Booking } from '../../../contexts/data/types'; // 🔥 Tipo Booking

interface CreateRatingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  unratedBookings: Booking[]; 
  getServiceName: (booking: Booking) => string; 
  onSubmit: (data: { bookingId: string; estrellas: number; comentario: string }) => Promise<void>;
}

export function CreateRatingDialog({
  isOpen,
  onOpenChange,
  unratedBookings,
  getServiceName,
  onSubmit
}: CreateRatingDialogProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      toast.error('Por favor selecciona las estrellas');
      return;
    }
    if (!selectedBookingId) {
      toast.error('Por favor selecciona qué cita quieres calificar');
      return;
    }

    setIsSubmitting(true);
    await onSubmit({
      bookingId: selectedBookingId,
      estrellas: selectedRating,
      comentario: comment,
    });
    
    setIsSubmitting(false);
    // Resetear form al cerrar
    setSelectedRating(0);
    setSelectedBookingId('');
    setComment('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#D4AF37]">Calificar Servicio</DialogTitle>
          <DialogDescription className="text-gray-400">
            Cuéntanos cómo fue tu experiencia. Tu opinión nos ayuda a mejorar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* SELECTOR DE CITA */}
          <div className="space-y-2">
            <Label className="text-gray-300">Selecciona el servicio</Label>
            <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
              <SelectTrigger className="bg-black border-gray-700 text-white focus:ring-[#9D8EC1]">
                <SelectValue placeholder="Seleccione una cita..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                {unratedBookings.map((booking) => (
                  <SelectItem key={booking._id} value={booking._id}>
                    {/* Formateamos fecha ISO */}
                    {getServiceName(booking)} - {new Date(booking.inicio).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ESTRELLAS */}
          <div className="space-y-2 text-center">
            <Label className="text-gray-300">Tu Calificación</Label>
            <div className="flex justify-center p-3 bg-black/30 rounded-lg border border-gray-800">
              <StarRating 
                rating={selectedRating} 
                interactive={true} 
                onRate={setSelectedRating} 
                className="gap-2"
              />
            </div>
            <p className="text-xs text-[#D4AF37] h-4">
                {selectedRating > 0 ? 
                    selectedRating === 5 ? "¡Excelente!" : 
                    selectedRating === 4 ? "Muy bueno" : 
                    selectedRating === 3 ? "Regular" : 
                    selectedRating <= 2 ? "Malo" : "" 
                : "Toca las estrellas"}
            </p>
          </div>

          {/* COMENTARIO */}
          <div className="space-y-2">
            <Label className="text-gray-300">Comentario (Opcional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Qué fue lo que más te gustó?"
              className="bg-black border-gray-700 text-white resize-none focus:border-[#9D8EC1]"
              rows={3}
              maxLength={70}
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/70
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}