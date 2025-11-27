import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { useScheduleLogic, daysOfWeek } from "./useScheduleLogic";
import { DayRow } from "./DayRow";

export function ScheduleManagement() {
  const {
    businessHours,
    loading,
    handleTimeChange,
    handleToggle,
    handleSave
  } = useScheduleLogic();

  if (loading) return <p className="text-gray-400">Cargando horarios...</p>;
  if (!businessHours) return <p className="text-gray-400">No se pudieron cargar los horarios</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[#D4AF37] text-xl font-semibold">
          Horarios de Atención
        </h2>
        <Button
          onClick={handleSave}
          className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 flex items-center gap-2"
        >
          <Save className="h-4 w-4" /> Guardar Cambios
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Configuración de Horarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {businessHours.days.map((day, index) => (
            <DayRow
              key={day.dayOfWeek}
              index={index}
              day={day}
              dayName={daysOfWeek[day.dayOfWeek]}
              onToggle={handleToggle}
              onTimeChange={handleTimeChange}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Nota: Exportamos StylistScheduleButton desde su propio archivo, 
// así que ya no es necesario tenerlo aquí abajo.
export { StylistScheduleButton } from './StylistScheduleButton';