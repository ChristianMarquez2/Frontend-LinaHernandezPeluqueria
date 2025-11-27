import { useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/auth/index';
import { useData, Appointment } from '../../../contexts/data/index';

export function useAppointmentCalendar() {
  const { user } = useAuth();
  const { appointments = [] } = useData();

  // Fecha seleccionada: hoy por defecto
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // === Filtrado y ordenamiento ===
  const appointmentsForDate = useMemo(() => {
    if (!user?.id) return [];

    return appointments
      .filter((a) => {
        // 1. Obtener ID del estilista de forma segura
        // Según tus types, 'stylist' puede ser un string (ID) o un objeto (PopulatedStylist)
        const appointmentStylistId = typeof a.stylist === 'object' 
          ? a.stylist._id 
          : a.stylist;

        // 2. Verificar si la cita es mía (comparando con user.id)
        const isMyAppointment = String(appointmentStylistId) === String(user.id);

        // 3. Verificar fecha (Usando 'start' en lugar de 'inicio')
        // Nota: a.start viene en ISO. split('T')[0] funciona para fechas UTC/ISO estándar.
        const appointmentDate = a.start.split('T')[0];
        const isSelectedDate = appointmentDate === selectedDate;

        return isMyAppointment && isSelectedDate;
      })
      .sort(
        (a, b) =>
          new Date(a.start).getTime() - new Date(b.start).getTime()
      );
  }, [appointments, user, selectedDate]);

  // === Helpers ===

  // Corrección: Ahora una cita tiene un ARRAY de servicios (services: Service[])
  // Ya no necesitamos buscar en la lista global por ID, el objeto ya viene dentro.
  const getServiceNames = (appointment: Appointment) => {
    if (!appointment.services || appointment.services.length === 0) return 'Sin servicio';
    return appointment.services.map(s => s.nombre).join(', ');
  };

  // Corrección: Manejo de Cliente Manual vs Registrado
  const getClientLabel = (a: Appointment) => {
    // Caso 1: Cliente manual (sin cuenta)
    if (a.clientName) return `${a.clientName} (Manual)`;

    // Caso 2: Cliente registrado populado
    if (typeof a.clientId === 'object' && a.clientId !== null) {
      return `${a.clientId.nombre} ${a.clientId.apellido}`;
    }

    // Caso 3: Fallback (solo tenemos ID o es null)
    return 'Cliente Registrado';
  };

  // Corrección: Usar 'start' en lugar de 'inicio'
  const formatTime = (isoDate: string) =>
    new Date(isoDate).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDateLabel = (dateStr: string) =>
    // Agregamos hora mediodía para evitar problemas de timezone al renderizar el label
    new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return {
    user,
    selectedDate,
    setSelectedDate,
    appointmentsForDate,
    getServiceNames, // Renombrado para reflejar que puede haber múltiples
    getClientLabel,
    formatTime,
    formatDateLabel,
  };
}