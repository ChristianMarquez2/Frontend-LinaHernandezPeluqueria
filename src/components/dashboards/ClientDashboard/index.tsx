import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useAppointments } from '../../../contexts/data/index'; 
import { useData } from '../../../contexts/data/index'; 
import { logger } from '../../../services/logger';
import { UserProfile } from '../../UserProfile';
import { LoadingAnimation } from '../../LoadingAnimation';
import { API_BASE_URL } from '../../../config/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';

// Sub-componentes
import { ClientHeader } from './ClientHeader';
import { ClientStats } from './ClientStats';
import { ClientAppointments } from './ClientAppointments';
import { ClientBookingModal } from './ClientBookingModal';
import { extractId } from './utils';
import { Booking } from '../../../contexts/data/types';
import { dataService } from '../../../contexts/data/service';

export function ClientDashboard() {
  const { user, logout, refreshSession } = useAuth();
  
  const { myBookings, refreshMyBookings } = useAppointments();
  
  const {
    services,
    stylists,
    ratings,
    getUserNotifications,
    fetchData,
  } = useData();

  const [showRatings, setShowRatings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const [showBooking, setShowBooking] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string>("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = extractId(user);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      logger.info('ClientDashboard: Loading dashboard data', { userId }, 'ClientDashboard');
      try {
        await fetchData();
        await refreshMyBookings();
        logger.debug('ClientDashboard: Data loaded successfully', {}, 'ClientDashboard');
      } catch (err) {
        logger.error('ClientDashboard: Error loading dashboard', { error: err }, 'ClientDashboard');
      } finally {
        setLoading(false);
      }
    };
    load();

    const interval = setInterval(() => refreshSession(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData, refreshMyBookings, refreshSession]);

  const notifications = getUserNotifications(userId);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const upcomingCount = myBookings.filter(a => 
    ["SCHEDULED", "CONFIRMED", "PENDING_STYLIST_CONFIRMATION"].includes(a.estado)
  ).length;

  const completedCount = myBookings.filter(a => a.estado === "COMPLETED").length;
  const pendingCount = myBookings.filter(a => a.estado === "SCHEDULED").length;

  const openNewBooking = () => {
    setEditingAppointmentId(null);
    setEditingData(null);
    setShowBooking(true);
  };

  const openEditBooking = (booking: Booking) => {
    setEditingAppointmentId(booking._id);
    setEditingData(booking);
    setShowBooking(true);
  };

  const handleCancelClick = (id: string) => {
    setCancellingAppointmentId(id);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      logger.info('ClientDashboard: Cancelling appointment', { appointmentId: cancellingAppointmentId }, 'ClientDashboard');
      
      const token = localStorage.getItem("accessToken");
      if(!token) {
        logger.warn('ClientDashboard: No auth token found', {}, 'ClientDashboard');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/bookings/${cancellingAppointmentId}/cancel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ motivo: "Cancelado por el cliente desde dashboard" })
      });

      if (!res.ok) {
         const errData = await res.json();
         logger.warn('ClientDashboard: Failed to cancel appointment', { error: errData }, 'ClientDashboard');
         toast.error("Error al cancelar", {
           description: errData.message || "No se pudo cancelar la cita"
         });
         return;
      }

      logger.info('ClientDashboard: Appointment cancelled successfully', { appointmentId: cancellingAppointmentId }, 'ClientDashboard');
      await refreshMyBookings();
      toast.success("Cita cancelada correctamente");
      setCancelDialogOpen(false);

    } catch (err) {
      logger.error('ClientDashboard: Error cancelling appointment', { error: err }, 'ClientDashboard');
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor"
      });
    }
  };

  const handleSaveBooking = async ({ slotId, date, notes }: { slotId: string, date: string, notes?: string }) => {
    setBookingLoading(true);
    logger.info('ClientDashboard: Saving booking', { slotId, date, editing: !!editingAppointmentId }, 'ClientDashboard');
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      logger.warn('ClientDashboard: No auth token found', {}, 'ClientDashboard');
      return;
    }

    try {
      if (editingAppointmentId) {
        logger.debug('ClientDashboard: Rescheduling existing appointment', { appointmentId: editingAppointmentId }, 'ClientDashboard');
        
        const res = await fetch(`${API_BASE_URL}/bookings/${editingAppointmentId}/reschedule`, {
          method: "PUT",
          headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ slotId, date })
        });

        if (!res.ok) {
            const errorData = await res.json();
            logger.warn('ClientDashboard: Failed to reschedule', { error: errorData }, 'ClientDashboard');
            throw new Error(errorData.message || "Error al reprogramar");
        }
      } else {
        logger.debug('ClientDashboard: Creating new appointment', { slotId, date }, 'ClientDashboard');
        await dataService.createBooking(token, {
          slotId,
          date,
          notas: notes
        });
      }

      await refreshMyBookings();
      await fetchData();
      
      setShowBooking(false);
      logger.info('ClientDashboard: Booking saved successfully', { appointmentId: editingAppointmentId }, 'ClientDashboard');
      toast.success(
        editingAppointmentId ? "Cita reprogramada con éxito" : "¡Cita agendada con éxito!"
      );

    } catch (err: any) {
      logger.error('ClientDashboard: Error saving booking', { error: err }, 'ClientDashboard');
      toast.error("Error al procesar", {
        description: err.message || "No se pudo procesar la solicitud"
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (!user) {
    return <LoadingAnimation message="Cargando..." fullScreen />;
  }

  if (user.role !== "client") {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso restringido</h2>
          <p className="text-gray-300">Tu cuenta no tiene permisos para ver este panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingAnimation message="Cargando tu panel..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#9D8EC1]/30">
      <ClientHeader
        user={user}
        unreadCount={unreadCount}
        onOpenBooking={openNewBooking}
        onOpenProfile={() => setShowProfile(true)}
        onLogout={logout}
      />

      {/* CAMBIO CLAVE: Se aumentó el espaciado (py-12 y space-y-16) 
          y se agregaron separadores sutiles para que el panel respire.
      */}
      <main className="px-4 py-12 md:px-8 max-w-7xl mx-auto space-y-16">
        
        {/* Sección de Estadísticas con animación de entrada */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <ClientStats
            upcomingCount={upcomingCount}
            pendingCount={pendingCount}
            completedCount={completedCount}
            ratingsCount={ratings.length}
          />
        </section>

        {/* Separador visual sutil */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

        {/* Sección de Citas / Calificaciones */}
        <section className="pb-20">
          <ClientAppointments
            showRatings={showRatings}
            setShowRatings={setShowRatings}
            appointments={myBookings}
            onEdit={openEditBooking}
            onCancel={handleCancelClick}
          />
        </section>
      </main>

      <ClientBookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        isEditing={!!editingAppointmentId}
        initialData={editingData}
        services={services}
        stylists={stylists}
        onSave={handleSaveBooking}
        loading={bookingLoading}
      />

      <UserProfile open={showProfile} onOpenChange={setShowProfile} />

      {/* Diálogo de Cancelación */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#D4AF37]">
              Cancelar Cita
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              ¿Estás seguro que deseas cancelar esta cita? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setCancelDialogOpen(false)}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              No, mantener cita
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sí, cancelar cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}