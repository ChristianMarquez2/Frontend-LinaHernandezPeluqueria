import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useAppointments } from '../../../contexts/data/index'; // 🔥 Importamos directo el contexto
import { useData } from '../../../contexts/data/index'; // Para servicios y stylists
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
  
  // Usamos useAppointments para obtener myBookings (que viene de /bookings/me)
  const { myBookings, refreshMyBookings } = useAppointments();
  
  const {
    services,
    stylists,
    ratings,
    getUserNotifications,
    fetchData, // Para refrescar datos generales
  } = useData();

  // Estados de UI
  const [showRatings, setShowRatings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Estados Modal
  const [showBooking, setShowBooking] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = extractId(user);

  // Carga inicial
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchData(); // Carga servicios, estilistas, etc.
        await refreshMyBookings(); // Carga reservas específicas
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Refresco de sesión silencioso
    const interval = setInterval(() => refreshSession(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData, refreshMyBookings, refreshSession]);

  // Notificaciones
  const notifications = getUserNotifications(userId);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Estadísticas derivadas de myBookings
  const upcomingCount = myBookings.filter(a => 
    ["SCHEDULED", "CONFIRMED", "PENDING_STYLIST_CONFIRMATION"].includes(a.estado)
  ).length;

  const completedCount = myBookings.filter(a => a.estado === "COMPLETED").length;
  // Pending en tu lógica puede ser las agendadas a futuro o pendientes de pago/confirmación
  const pendingCount = myBookings.filter(a => a.estado === "SCHEDULED").length;

  // Acciones
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
    if (!confirm("¿Estás seguro que deseas cancelar esta cita? Esta acción podría tener penalizaciones si es muy próxima.")) return;
    
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

  // Guardar Reserva (Create o Reschedule)
  const handleSaveBooking = async ({ slotId, date, notes }: { slotId: string, date: string, notes?: string }) => {
    setBookingLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      if (editingAppointmentId) {
        // --- MODO EDICIÓN (PUT /reschedule) ---
        // Tu backend espera { slotId, date } en el body para reprogramar
        const res = await fetch(`${API_BASE_URL}/bookings/${editingAppointmentId}/reschedule`, {
          method: "PUT",
          headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ slotId, date }) // El backend reprograma en base al nuevo slot
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Error al reprogramar");
        }

      } else {
        // --- MODO CREACIÓN (POST /) ---
        await dataService.createBooking(token, {
          slotId,
          date,
          notas: notes
        });
      }

      // Éxito
      await refreshMyBookings();
      setShowBooking(false);
      // alert(editingAppointmentId ? "Cita reprogramada con éxito" : "¡Cita agendada con éxito!");

    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "No se pudo procesar la solicitud"));
    } finally {
      setBookingLoading(false);
    }
  };

  // CORRECCIÓN: el role se normaliza en el AuthProvider a 'client' | 'stylist' | 'admin' | 'manager'
  // Por eso la comparación debe usar el valor normalizado ('client'), no "CLIENTE".
  if (!user) {
    // Si no hay usuario, mostramos loader simple (evita render nulo)
    return <div className="flex h-screen items-center justify-center bg-black text-[#9D8EC1]">Cargando...</div>;
  }

  if (user.role !== "client") {
    // Fallback visible y claro (fondo oscuro para que el texto sea legible)
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
    <div className="min-h-screen bg-black text-white">
      <ClientHeader
        user={user}
        unreadCount={unreadCount}
        onOpenBooking={openNewBooking}
        onOpenProfile={() => setShowProfile(true)}
        onLogout={logout}
      />

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <ClientStats
          upcomingCount={upcomingCount}
          pendingCount={pendingCount}
          completedCount={completedCount}
          ratingsCount={ratings.length}
        />

        <ClientAppointments
          showRatings={showRatings}
          setShowRatings={setShowRatings}
          appointments={myBookings} // Pasamos la data real
          onEdit={openEditBooking}
          onCancel={handleCancelAppointment}
        />
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