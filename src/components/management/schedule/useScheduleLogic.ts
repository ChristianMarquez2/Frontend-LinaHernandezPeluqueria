import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useData } from '../../../contexts/data/index';
import { dataService } from '../../../contexts/data/service';
import { StylistSchedule, ServiceSlot, DayOfWeekIndex, WeekdayName } from '../../../contexts/data/types';

// Mapeo de índices 0-6 a nombres de backend
const DAY_NAMES = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'] as const;

export function useScheduleLogic() {
  const token = localStorage.getItem("accessToken");
  const { stylists, services } = useData();

  // Estados de Selección
  const [selectedStylistId, setSelectedStylistId] = useState<string>('');
  
  // === ESTADOS PARA PLANTILLA (Workflow 1) ===
  const [schedules, setSchedules] = useState<StylistSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // === ESTADOS PARA GENERAR SLOTS (Workflow 2) ===
  const [generationDate, setGenerationDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [genStart, setGenStart] = useState('09:00');
  const [genEnd, setGenEnd] = useState('18:00');
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingSlots, setExistingSlots] = useState<ServiceSlot[]>([]);

  // 1. Cargar Plantillas al seleccionar estilista
  useEffect(() => {
    if (!selectedStylistId || !token) {
      setSchedules([]);
      return;
    }

    const load = async () => {
      setLoadingSchedules(true);
      try {
        const data = await dataService.fetchStylistSchedules(token, selectedStylistId);
        setSchedules(data);
      } catch (err: any) {
        toast.error(err?.message || 'No se pudo cargar la plantilla');
        setSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    load();
  }, [selectedStylistId, token]);

  // 2. Guardar Plantilla de un día (Configuración Base)
  const handleSaveDayConfig = async (dayIndex: DayOfWeekIndex, start: string, end: string, isOff: boolean) => {
    if (!token || !selectedStylistId) return;

    try {
      // ✅ VALIDACIÓN: Si no está de descanso, validar que las horas sean válidas
      if (!isOff) {
        // Validar formato HH:00 o HH:30
        const timeRegex = /^([01]\d|2[0-3]):(00|30)$/;
        if (!timeRegex.test(start) || !timeRegex.test(end)) {
          toast.error("❌ Las horas deben ser HH:00 o HH:30");
          return;
        }

        // Validar que start < end
        const startMin = timeToMinutes(start);
        const endMin = timeToMinutes(end);
        if (endMin <= startMin) {
          toast.error("❌ La hora de fin debe ser mayor que la de inicio");
          return;
        }
      }

      if (isOff) {
        // Si marca "descanso", borramos el horario de ese día
        await dataService.deleteStylistScheduleDay(token, selectedStylistId, dayIndex);
        toast.success(`✅ Día ${DAY_NAMES[dayIndex]} marcado como descanso`);
      } else {
        // Guardamos horario
        await dataService.upsertStylistSchedule(token, {
          stylistId: selectedStylistId,
          dayOfWeek: dayIndex,
          slots: [{ start, end }]
        });
        toast.success(`✅ Horario guardado para ${DAY_NAMES[dayIndex]}`);
      }
      
      // Recargar
      const data = await dataService.fetchStylistSchedules(token, selectedStylistId);
      setSchedules(data);

    } catch (err: any) {
      toast.error(err.message || "Error al guardar horario");
    }
  };

  // 3. Generar Slots Reales (Acción Crítica)
  const handleGenerateSlots = async () => {
    if (!token || !selectedStylistId || !selectedServiceId || !generationDate) {
      toast.error("Faltan datos para generar (Estilista, Servicio y Fecha son obligatorios)");
      return;
    }

    // Calcular día de la semana basado en la fecha
    const dateObj = new Date(generationDate + 'T00:00:00'); // Forzar local
    const dayName = DAY_NAMES[dateObj.getDay()];
    const dayIndex = dateObj.getDay() as DayOfWeekIndex;

    // ✅ VALIDACIÓN 1: Verificar que el día esté activo en la plantilla semanal
    const plantillaDelDia = schedules.find(s => s.dayOfWeek === dayIndex);
    if (!plantillaDelDia || plantillaDelDia.slots.length === 0) {
      toast.error(`❌ No puedes generar disponibilidad para ${dayName} porque ese día está marcado como descanso.`);
      return;
    }

    // ✅ VALIDACIÓN 2: Validar formato de hora (HH:00 o HH:30)
    const timeRegex = /^([01]\d|2[0-3]):(00|30)$/;
    if (!timeRegex.test(genStart) || !timeRegex.test(genEnd)) {
      toast.error("❌ Las horas deben ser HH:00 o HH:30 (ej: 09:00, 14:30)");
      return;
    }

    // ✅ VALIDACIÓN 3: Validar que genStart < genEnd
    const startMinutes = timeToMinutes(genStart);
    const endMinutes = timeToMinutes(genEnd);
    if (endMinutes <= startMinutes) {
      toast.error("❌ La hora de fin debe ser mayor que la hora de inicio");
      return;
    }

    // ✅ VALIDACIÓN 4: Validar que las horas estén dentro del rango de la plantilla del día
    const plantillaStart = timeToMinutes(plantillaDelDia.slots[0].start);
    const plantillaEnd = timeToMinutes(plantillaDelDia.slots[0].end);

    if (startMinutes < plantillaStart || endMinutes > plantillaEnd) {
      const plantillaFormatted = `${plantillaDelDia.slots[0].start} - ${plantillaDelDia.slots[0].end}`;
      toast.error(
        `❌ Las horas deben estar dentro del rango de la plantilla semanal (${plantillaFormatted})`
      );
      return;
    }

    setIsGenerating(true);
    try {
      await dataService.generateDaySlots(token, {
        stylistId: selectedStylistId,
        serviceId: selectedServiceId,
        date: generationDate, // Solo referencia
        dayOfWeek: dayName,   // Lo que pide el backend
        dayStart: genStart,
        dayEnd: genEnd
      });
      
      toast.success(`✅ Disponibilidad generada para el ${dayName} (${generationDate})`);
      
      // Refrescar vista de slots generados
      loadExistingSlots();

    } catch (err: any) {
      toast.error(err.message || "Error al generar slots");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper para convertir HH:MM a minutos
  const timeToMinutes = (time: string): number => {
    const [hh, mm] = time.split(':').map(Number);
    return hh * 60 + mm;
  };

  // 4. Ver qué slots ya existen para esa fecha/estilista
  const loadExistingSlots = useCallback(async () => {
    if (!token || !selectedStylistId || !generationDate) {
      setExistingSlots([]);
      return;
    }

    const dayName: WeekdayName = DAY_NAMES[new Date(generationDate + 'T00:00:00').getDay()];
    const slots = await dataService.listSlots(token, {
      stylistId: selectedStylistId,
      serviceId: selectedServiceId || undefined,
      dayOfWeek: dayName,
    });
    setExistingSlots(slots);
  }, [token, selectedStylistId, generationDate, selectedServiceId]);

  useEffect(() => {
    loadExistingSlots();
  }, [loadExistingSlots]);

  // Helper para autocompletar horas de generación basado en la plantilla del día seleccionado
  useEffect(() => {
    if (generationDate && schedules.length > 0) {
      const dateObj = new Date(generationDate + 'T00:00:00');
      const dayIndex = dateObj.getDay();
      const template = schedules.find(s => s.dayOfWeek === dayIndex);
      
      if (template && template.slots.length > 0) {
        setGenStart(template.slots[0].start);
        setGenEnd(template.slots[0].end);
      }
    }
  }, [generationDate, schedules]);

  return {
    stylists,
    services,
    
    // Selección
    selectedStylistId,
    setSelectedStylistId,
    
    // Plantillas
    schedules,
    loadingSchedules,
    handleSaveDayConfig,
    
    // Generación
    generationDate, setGenerationDate,
    selectedServiceId, setSelectedServiceId,
    genStart, setGenStart,
    genEnd, setGenEnd,
    isGenerating,
    handleGenerateSlots,
    existingSlots,
    
    // Constantes
    DAY_NAMES
  };
}