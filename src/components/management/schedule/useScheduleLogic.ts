import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const daysOfWeek = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];

export interface Day {
  dayOfWeek: number;
  open: string;
  close: string;
}

export interface BusinessHoursResponse {
  _id?: string;
  days: Day[];
  exceptions: any[];
}

export function useScheduleLogic() {
  const [businessHours, setBusinessHours] = useState<BusinessHoursResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Generador de defaults
  const createDefaultDays = (): Day[] => 
    Array.from({ length: 7 }).map((_, i) => ({
      dayOfWeek: i,
      open: "09:00",
      close: "18:00",
    }));

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/v1/schedules/business`);
        
        if (res.status === 200) {
          const data: BusinessHoursResponse = await res.json();
          if (data && data.days) {
            setBusinessHours(data);
          } else {
            setBusinessHours({ days: createDefaultDays(), exceptions: [] });
          }
        } else if (res.status === 404) {
          setBusinessHours({ days: createDefaultDays(), exceptions: [] });
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar horarios");
        setBusinessHours({ days: createDefaultDays(), exceptions: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // HANDLERS
  const handleTimeChange = (index: number, field: "open" | "close", value: string) => {
    if (!businessHours) return;
    const newDays = [...businessHours.days];
    newDays[index][field] = value;
    setBusinessHours({ ...businessHours, days: newDays });
  };

  const handleToggle = (index: number, closed: boolean) => {
    if (!businessHours) return;
    const newDays = [...businessHours.days];
    if (closed) {
      newDays[index].open = "";
      newDays[index].close = "";
    } else {
      newDays[index].open = "09:00";
      newDays[index].close = "18:00";
    }
    setBusinessHours({ ...businessHours, days: newDays });
  };

  // VALIDATIONS
  const isValidTimeFormat = (time: string): boolean => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  
  const isValidTimeRange = (open: string, close: string): boolean => {
    if (!open || !close) return false;
    const [oh, om] = open.split(':').map(Number);
    const [ch, cm] = close.split(':').map(Number);
    return (ch * 60 + cm) > (oh * 60 + om);
  };

  // SAVE
  const handleSave = async () => {
    try {
      if (!businessHours) return;

      const daysToSave = businessHours.days
        .filter(d => d.open && d.close)
        .map(d => {
          if (!isValidTimeFormat(d.open) || !isValidTimeFormat(d.close)) {
            throw new Error(`Formato de hora inválido para ${daysOfWeek[d.dayOfWeek]}.`);
          }
          if (!isValidTimeRange(d.open, d.close)) {
            throw new Error(`Horario inválido para ${daysOfWeek[d.dayOfWeek]}. Cierre debe ser mayor a apertura.`);
          }
          return { dayOfWeek: d.dayOfWeek, open: d.open, close: d.close };
        });

      if (daysToSave.length === 0) {
        throw new Error("Debe configurar al menos un día con horario válido");
      }

      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Token no encontrado");

      const res = await fetch(`${API_URL}/v1/schedules/business`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days: daysToSave,
          exceptions: businessHours.exceptions || []
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);

      toast.success("Horarios guardados exitosamente");
    } catch (err: any) {
      toast.error("Error al guardar", { description: err.message });
    }
  };

  return {
    businessHours,
    loading,
    handleTimeChange,
    handleToggle,
    handleSave,
  };
}