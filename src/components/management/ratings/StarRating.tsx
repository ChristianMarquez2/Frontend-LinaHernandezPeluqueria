import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export function StarRating({ rating, interactive = false, onRate, className = "" }: StarRatingProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 transition-colors ${
            star <= rating
              ? 'fill-[#D4AF37] text-[#D4AF37]'
              : 'text-gray-600'
          } ${interactive ? 'cursor-pointer hover:text-[#D4AF37] hover:scale-110' : ''}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}