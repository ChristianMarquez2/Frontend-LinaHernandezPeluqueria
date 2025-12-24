import { useMemo } from 'react';
import { useScheduleLogic } from './useScheduleLogic';
import { DayRow } from './DayRow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Calendar, Clock } from 'lucide-react';
import { DayOfWeekIndex } from '../../../contexts/data/types';

export function ScheduleManagement() {
  const {
    stylists,
    services,
    selectedStylistId, setSelectedStylistId,
    schedules,
    handleSaveDayConfig,

    // Generación
    generationDate, setGenerationDate,
    selectedServiceId, setSelectedServiceId,
    genStart, setGenStart,
    genEnd, setGenEnd,
    isGenerating,
    handleGenerateSlots,
    existingSlots,

    DAY_NAMES
  } = useScheduleLogic();

  // 2. Lógica para filtrar servicios según el estilista seleccionado
  const filteredServices = useMemo(() => {
    if (!selectedStylistId) return [];

    const stylist = stylists.find(s => s._id === selectedStylistId);

    // Si el estilista no tiene la propiedad servicesOffered o está vacía, retornamos vacío
    if (!stylist || !stylist.servicesOffered) return [];

    // Obtenemos los IDs de los servicios que ofrece el estilista
    // (Manejamos el caso de que servicesOffered sea un array de strings o de objetos)
    const offeredIds = stylist.servicesOffered.map(s =>
      typeof s === 'string' ? s : s._id
    );

    // Filtramos la lista maestra de servicios
    return services.filter(service => offeredIds.includes(service._id));
  }, [selectedStylistId, stylists, services]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* 1. SELECCIÓN DE ESTILISTA */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#D4AF37] text-2xl font-semibold">Gestión de Horarios</h2>
        <div className="w-64">
          <Select value={selectedStylistId} onValueChange={setSelectedStylistId}>
            <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Seleccionar Estilista" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 text-white">
              {stylists.map(s => (
                <SelectItem key={s._id} value={s._id}>
                  {s.nombre} {s.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedStylistId ? (
        <div className="text-center py-20 text-gray-500 bg-gray-900/50 rounded-lg border border-dashed border-gray-800">
          <p>Selecciona un estilista para gestionar sus turnos</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">

          {/* COLUMNA IZQ: PLANTILLA SEMANAL */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="text-[#9D8EC1]" />
                Plantilla Semanal
              </CardTitle>
              <CardDescription>
                Define el horario base. Esto sirve como referencia para generar la disponibilidad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {DAY_NAMES.map((dayName, index) => {
                const dayIndex = index as DayOfWeekIndex;
                // Buscar si existe config para este día
                const schedule = schedules.find(s => s.dayOfWeek === dayIndex);
                const hasSchedule = !!schedule && schedule.slots.length > 0;
                const start = hasSchedule ? schedule!.slots[0].start : "09:00";
                const end = hasSchedule ? schedule!.slots[0].end : "18:00";

                return (
                  <DayRow
                    key={dayName}
                    dayName={dayName}
                    dayIndex={dayIndex}
                    initialStart={start}
                    initialEnd={end}
                    hasSchedule={hasSchedule}
                    onSave={handleSaveDayConfig}
                  />
                );
              })}
            </CardContent>
          </Card>

          {/* COLUMNA DER: GENERADOR DE DISPONIBILIDAD */}
          <div className="space-y-6">

            {/* Panel de Generación */}
            <Card className="bg-black border border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#D4AF37] flex items-center gap-2">
                  {/* Se añade la clase text-[#D4AF37] al icono */}
                  <Calendar className="h-5 w-5 glow-gold" />
                  Generar Disponibilidad Real
                </CardTitle>
                <CardDescription>
                  Crea los huecos (slots) para que los clientes puedan reservar.
                  <br />
                  <span className="text-yellow-600/80 text-xs">
                    *Nota: Tu sistema requiere generar slots por servicio.
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Inputs de Generación */}
                <div>
                  <Label className="text-gray-300">Fecha a generar</Label>
                  <input
                    type="date"
                    value={generationDate}
                    onChange={(e) => setGenerationDate(e.target.value)}
                    className="w-full mt-1 bg-gray-900 border border-gray-700 text-white p-2 rounded generation-date-input"
                  />
                </div>


                <div>
                  <Label className="text-gray-300">Servicio</Label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger className="mt-1 bg-gray-900 border-gray-700 text-white">
                      <SelectValue placeholder="Selecciona el servicio..." />
                    </SelectTrigger>
                    {/* 3. Usamos filteredServices aquí */}
                    <SelectContent className="bg-gray-900 border-gray-800 text-white max-h-60">
                      {filteredServices.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          Este estilista no tiene servicios asignados.
                        </div>
                      ) : (
                        filteredServices.map(svc => (
                          <SelectItem key={svc._id} value={svc._id}>
                            {svc.nombre} ({svc.duracionMin} min)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Hora Inicio</Label>
                    <input
                      type="time"
                      value={genStart}
                      onChange={(e) => setGenStart(e.target.value)}
                      className="w-full mt-1 bg-gray-900 border border-gray-700 text-white p-2 rounded time-input-gold"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Hora Fin</Label>
                    <input
                      type="time"
                      value={genEnd}
                      onChange={(e) => setGenEnd(e.target.value)}
                      className="w-full mt-1 bg-gray-900 border border-gray-700 text-white p-2 rounded time-input-gold"
                    />
                  </div>
                </div>


                <Button
                  onClick={handleGenerateSlots}
                  disabled={isGenerating}
                  className="w-full bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black font-semibold"
                >
                  {isGenerating ? "Generando..." : "Generar Espacios Disponibles"}
                </Button>

              </CardContent>
            </Card>

            {/* Vista Previa de Slots Existentes */}
            {generationDate && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-sm">
                    Espacios ya generados para {generationDate}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {existingSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No hay disponibilidad generada para esta fecha/estilista.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {existingSlots.map(slot => (
                        <div key={slot.id} className="bg-black border border-gray-700 p-2 rounded text-center">
                          <p className="text-white font-bold text-sm">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {typeof slot.service === 'object' ? slot.service.nombre : 'Servicio'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      )}
    </div>
  );
}