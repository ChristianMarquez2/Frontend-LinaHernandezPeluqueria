import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../../auth/index";
import { dataService } from "../service";
import { Rating, CreateRatingPayload } from "../types";

interface RatingsContextType {
  ratings: Rating[];
  refreshRatings: () => Promise<void>;
  createRating: (payload: CreateRatingPayload) => Promise<boolean>;
}

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export function RatingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem("accessToken");
  const [ratings, setRatings] = useState<Rating[]>([]);

  const refreshRatings = useCallback(async () => {
    if (!token || !user) return;
    
    // Frontend-fix: Solo los clientes pueden ver "mis ratings" en este endpoint
    const userRole = (user.role || '').toString().toUpperCase();
    if (userRole !== 'CLIENTE' && userRole !== 'CLIENT') {
        return; 
    }

    try {
      const data = await dataService.fetchMyRatings(token);
      setRatings(data);
    } catch (err) {
      // Ignorar error
    }
  }, [token, user]);

  useEffect(() => {
    if (user && token) {
        refreshRatings();
    }
  }, [user, token, refreshRatings]);

  const createRating = async (payload: CreateRatingPayload): Promise<boolean> => {
    if (!token) return false;
    try {
      const newRating = await dataService.createRating(token, payload);
      setRatings((prev) => [newRating, ...prev]);
      return true;
    } catch (error: any) {
      console.error("❌ Error al crear la calificación:", error);
      toast.error(error.message);
      return false;
    }
  };

  return (
    <RatingsContext.Provider value={{ ratings, refreshRatings, createRating }}>
      {children}
    </RatingsContext.Provider>
  );
}

export const useRatings = () => {
  const context = useContext(RatingsContext);
  if (!context) throw new Error("useRatings debe usarse dentro de RatingsProvider");
  return context;
};