import { Clock } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';

// Interfaces necesarias para las props
export interface DayData {
  dayOfWeek: number;
  open: string;
  close: string;
}

interface DayRowProps {
  day: DayData;
  dayName: string;
  index: number;
  onToggle: (index: number, closed: boolean) => void;
  onTimeChange: (index: number, field: "open" | "close", value: string) => void;
}

export function DayRow({ day, dayName, index, onToggle, onTimeChange }: DayRowProps) {
  const closed = !day.open && !day.close;

  return (
    <div className="flex items-center gap-6 border-b border-gray-800 pb-4 last:border-0">
      {/* Nombre del día */}
      <div className="w-32">
        <p className="text-white">{dayName}</p>
      </div>

      {/* Switch Activo/Inactivo */}
      <div className="flex items-center gap-2">
        <Switch
          checked={!closed}
          onCheckedChange={(checked) => onToggle(index, !checked)}
          className="data-[state=checked]:bg-[#9D8EC1]"
        />
        <span className="text-sm text-gray-400">
          {closed ? "Cerrado" : "Abierto"}
        </span>
      </div>

      {/* Inputs de hora (si está abierto) */}
      {!closed && (
        <div className="flex items-center gap-4">
          <div>
            <Label className="text-gray-400 text-xs">Apertura</Label>
            <Input
              type="time"
              value={day.open}
              onChange={(e) => onTimeChange(index, "open", e.target.value)}
              className="bg-black border-gray-700 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-400 text-xs">Cierre</Label>
            <Input
              type="time"
              value={day.close}
              onChange={(e) => onTimeChange(index, "close", e.target.value)}
              className="bg-black border-gray-700 text-white"
            />
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {day.open} - {day.close}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}