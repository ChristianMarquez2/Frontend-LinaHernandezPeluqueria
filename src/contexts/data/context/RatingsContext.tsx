import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../../auth/index";
import { dataService } from "../service";
import { Rating, CreateRatingPayload, ReportRangeParams } from "../types";

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
    
    const userRole = (user.role || '').toString().toUpperCase();

    try {
      if (userRole === 'CLIENTE' || userRole === 'CLIENT') {
        // 1. Cliente: API directa (trae todos los campos reales)
        const data = await dataService.fetchMyRatings(token);
        setRatings(data);
      } 
      else if (userRole === 'ADMIN' || userRole === 'GERENTE') {
        // 2. Admin: Simulamos Ratings desde Reportes
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);

        const params: ReportRangeParams = {
            from: start.toISOString().split('T')[0],
            to: end.toISOString().split('T')[0]
        };

        const reportData = await dataService.fetchStylistReports(token, params, false);
        
        if (reportData && reportData.reports) {
            const allRatings: any[] = [];

            reportData.reports.forEach(stylistReport => {
                const sId = stylistReport.stylist.id;
                
                stylistReport.ratings.latestComments.forEach((comment, index) => {
                    allRatings.push({
                        _id: `simulated-${sId}-${index}`,
                        estilistaId: sId,
                        estrellas: comment.estrellas,
                        comentario: comment.commentText,
                        createdAt: comment.createdAt,
                        
                        // 🔥 FIX: Rellenamos campos obligatorios con datos ficticios
                        bookingId: "virtual-booking", 
                        clienteId: "virtual-client",
                        
                        // Propiedad extra para la UI
                        clienteNombre: comment.clientName 
                    });
                });
            });

            allRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            // Forzamos el tipo porque 'clienteNombre' no existe en Rating oficial
            setRatings(allRatings as Rating[]);
        }
      }
      else if (userRole === 'ESTILISTA' || userRole === 'STYLIST' || userRole === 'stylist') {
        // 3. Estilista: Simulamos Ratings desde SU Reporte
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);

        const params: ReportRangeParams = {
            from: start.toISOString().split('T')[0],
            to: end.toISOString().split('T')[0]
        };

        const reportData = await dataService.fetchStylistReports(token, params, true);
        
        if (reportData && reportData.reports && reportData.reports.length > 0) {
             const myReport = reportData.reports[0];
             
             const myRatings = myReport.ratings.latestComments.map((comment, index) => ({
                _id: `simulated-me-${index}`,
                estilistaId: user.id,
                estrellas: comment.estrellas,
                comentario: comment.commentText,
                createdAt: comment.createdAt,

                // 🔥 FIX: Rellenamos campos obligatorios
                bookingId: "virtual-booking",
                clienteId: "virtual-client",

                clienteNombre: comment.clientName
             }));
             
             setRatings(myRatings as Rating[]);
        }
      }

    } catch (err) {
      console.error("Error loading ratings via reports:", err);
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
      await dataService.createRating(token, payload);
      refreshRatings();
      return true;
    } catch (error: any) {
      console.error("❌ Error al crear rating:", error);
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