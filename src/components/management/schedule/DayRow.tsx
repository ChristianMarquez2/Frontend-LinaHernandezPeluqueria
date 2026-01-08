import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Save } from 'lucide-react';
import { DayOfWeekIndex, WeekdayName } from '../../../contexts/data/types';

interface DayRowProps {
  dayName: WeekdayName;
  dayIndex: DayOfWeekIndex;
  initialStart?: string;
  initialEnd?: string;
  hasSchedule: boolean;
  onSave: (index: DayOfWeekIndex, start: string, end: string, isOff: boolean) => void;
}

export function DayRow({ dayName, dayIndex, initialStart, initialEnd, hasSchedule, onSave }: DayRowProps) {
  const [start, setStart] = useState(initialStart || "09:00");
  const [end, setEnd] = useState(initialEnd || "18:00");
  const [isWorking, setIsWorking] = useState(hasSchedule);
  const [isDirty, setIsDirty] = useState(false);

  // Sincronizar si cambia el prop externo (al cargar otro estilista)
  useEffect(() => {
    setStart(initialStart || "09:00");
    setEnd(initialEnd || "18:00");
    setIsWorking(hasSchedule);
    setIsDirty(false);
  }, [initialStart, initialEnd, hasSchedule]);

  const handleChange = (field: 'start' | 'end', val: string) => {
    // ✅ Validar que sea HH:00 o HH:30
    const timeRegex = /^([01]\d|2[0-3]):(00|30)$/;
    if (val && !timeRegex.test(val)) {
      return; // No actualizar si formato inválido
    }
    
    if (field === 'start') setStart(val);
    else setEnd(val);
    setIsDirty(true);
  };

  const handleToggle = (checked: boolean) => {
    setIsWorking(checked);
    setIsDirty(true);
  };

  const handleSaveClick = () => {
    onSave(dayIndex, start, end, !isWorking);
    setIsDirty(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg mb-2">
      <div className="flex items-center gap-4 w-32">
        <Switch checked={isWorking} onCheckedChange={handleToggle} />
        <span className={`font-medium ${isWorking ? 'text-white' : 'text-gray-500'}`}>
          {dayName}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="time"
            value={start}
            disabled={!isWorking}
            onChange={(e) => handleChange('start', e.target.value)}
            className="bg-black border border-gray-700 text-white rounded p-2 disabled:opacity-50"
          />
          <span className="text-gray-500 self-center">a</span>
          <input
            type="time"
            value={end}
            disabled={!isWorking}
            onChange={(e) => handleChange('end', e.target.value)}
            className="bg-black border border-gray-700 text-white rounded p-2 disabled:opacity-50"
          />
        </div>

        {isDirty && (
          <Button 
            size="sm" 
            onClick={handleSaveClick}
            className="bg-[#9D8EC1] hover:bg-[#9D8EC1]/90 text-black"
          >
            <Save className="h-4 w-4 mr-1" />
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
}