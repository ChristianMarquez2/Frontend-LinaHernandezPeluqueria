import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { cn } from "../../ui/utils"; // o tu ruta real
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
// Importamos Stylist desde types (que a su vez importa de global)
import { Stylist } from './types';
import { StylistScheduleButton } from '../schedule/StylistScheduleButton';

interface StylistTableProps {
  stylists: Stylist[];
  onEdit: (stylist: Stylist) => void;
  onDelete: (id: string) => void;
}

export function StylistTable({ stylists, onEdit, onDelete }: StylistTableProps) {

  // Helper para obtener nombre del servicio de forma segura
  const getMainServiceName = (stylist: Stylist) => {
    if (!stylist.servicesOffered || stylist.servicesOffered.length === 0) {
      return <span className="text-gray-500 italic">Sin asignar</span>;
    }
    const first = stylist.servicesOffered[0];
    // Si viene populado (objeto) tiene .nombre, si no es solo un ID string
    if (typeof first === 'object' && 'nombre' in first) {
      return first.nombre;
    }
    return "Servicio asignado";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800 hover:bg-gray-900/50">
          <TableHead className="text-gray-400">Nombre</TableHead>
          <TableHead className="text-gray-400">Cédula</TableHead>
          <TableHead className="text-gray-400">Email</TableHead>
          <TableHead className="text-gray-400">Teléfono</TableHead>
          <TableHead className="text-gray-400">Especialidad</TableHead>
          <TableHead className="text-gray-400 text-center">Estado</TableHead>
          <TableHead className="text-gray-400 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stylists.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-500 py-8">
              No hay estilistas registrados.
            </TableCell>
          </TableRow>
        ) : (
          stylists.map((s) => (
            <TableRow key={s._id} className="border-gray-800 hover:bg-gray-800/30">
              <TableCell className="text-white font-medium">
                {s.nombre} {s.apellido}
              </TableCell>
              <TableCell className="text-gray-300">{s.cedula}</TableCell>
              <TableCell className="text-gray-300">{s.email}</TableCell>
              <TableCell className="text-gray-300">{s.telefono}</TableCell>
              <TableCell className="text-gray-300">
                {getMainServiceName(s)}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  className={
                    s.isActive
                      ? '!bg-green-900/40 !text-green-300 !border-green-800'
                      : '!bg-red-900/40 !text-red-300 !border-red-800'
                  }
                >
                  {s.isActive ? 'Activo' : 'Inactivo'}
                </Badge>

              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(s)}
                    className="text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                    title="Editar información"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  {/* Botón de Horarios */}
                  <StylistScheduleButton stylistId={s._id} />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(s._id)}
                    className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                    title={s.isActive ? "Desactivar estilista" : "Activar estilista"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}