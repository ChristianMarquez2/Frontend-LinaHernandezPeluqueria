import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useAppointments } from '../../../contexts/data/index'; 
import { useData } from '../../../contexts/data/index'; 
import { UserProfile } from '../../UserProfile';
import { API_BASE_URL } from '../../../config/api';

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

  const [bookingLoading, setBookingLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = extractId(user);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchData();
        await refreshMyBookings();
      } catch (err) {
        console.error("Error loading dashboard:", err);
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

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas cancelar esta cita?")) return;
    
    try {
      const token = localStorage.getItem("accessToken");
      if(!token) return;

      const res = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ motivo: "Cancelado por el cliente desde dashboard" })
      });

      if (!res.ok) {
         const errData = await res.json();
         alert("Error: " + (errData.message || "No se pudo cancelar"));
         return;
      }

      await refreshMyBookings();
      alert("Cita cancelada correctamente.");

    } catch (err) {
      console.error(err);
      alert("Error de conexión al cancelar.");
    }
  };

  const handleSaveBooking = async ({ slotId, date, notes }: { slotId: string, date: string, notes?: string }) => {
    setBookingLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      if (editingAppointmentId) {
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
            throw new Error(errorData.message || "Error al reprogramar");
        }
      } else {
        await dataService.createBooking(token, {
          slotId,
          date,
          notas: notes
        });
      }

      await refreshMyBookings();
      await fetchData();
      
      setShowBooking(false);
      alert(editingAppointmentId ? "Cita reprogramada con éxito" : "¡Cita agendada con éxito!");

    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "No se pudo procesar la solicitud"));
    } finally {
      setBookingLoading(false);
    }
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center bg-black text-[#9D8EC1]">Cargando...</div>;
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
    return <div className="flex h-screen items-center justify-center bg-black text-[#9D8EC1]">Cargando tu panel...</div>;
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
            onCancel={handleCancelAppointment}
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
    </div>
  );
}