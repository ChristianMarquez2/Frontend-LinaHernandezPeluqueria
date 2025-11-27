import { Card, CardContent } from '../../ui/card';
import { StarRating } from './StarRating';
import { Rating } from '../../../contexts/data/index'; // Usamos los tipos centralizados

interface RatingCardProps {
  rating: Rating;
  serviceName: string; 
  stylistName: string; 
}

export function RatingCard({ rating, serviceName, stylistName }: RatingCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800/50 transition-colors">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-medium text-lg">{serviceName}</p>
              <p className="text-sm text-gray-400">Atendido por <span className="text-gray-300">{stylistName}</span></p>
            </div>
            <StarRating rating={rating.estrellas} />
          </div>
          
          {rating.comentario && (
            <div className="bg-black/40 rounded-lg p-3 border border-gray-800/50">
              <p className="text-gray-300 text-sm italic">"{rating.comentario}"</p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 text-right">
            {new Date(rating.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}