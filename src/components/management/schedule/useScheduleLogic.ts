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
      if (isOff) {
        // Si marca "descanso", borramos el horario de ese día
        await dataService.deleteStylistScheduleDay(token, selectedStylistId, dayIndex);
        toast.success(`Día ${DAY_NAMES[dayIndex]} marcado como libre`);
      } else {
        // Guardamos horario
        await dataService.upsertStylistSchedule(token, {
          stylistId: selectedStylistId,
          dayOfWeek: dayIndex,
          slots: [{ start, end }] // Tu backend soporta múltiples, por ahora UI simple de 1 turno
        });
        toast.success(`Horario guardado para ${DAY_NAMES[dayIndex]}`);
      }
      
      // Recargar
      const data = await dataService.fetchStylistSchedules(token, selectedStylistId);
      setSchedules(data);

    } catch (err: any) {
      toast.error(err.message);
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
      
      toast.success(`Disponibilidad generada para el ${dayName} (${generationDate})`);
      
      // Refrescar vista de slots generados
      loadExistingSlots();

    } catch (err: any) {
      toast.error(err.message || "Error al generar slots");
    } finally {
      setIsGenerating(false);
    }
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