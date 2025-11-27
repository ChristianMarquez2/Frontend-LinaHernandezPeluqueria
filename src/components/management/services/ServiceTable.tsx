import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Service } from "./types";

interface ServiceTableProps {
  services: Service[];
  getCategoryName: (id: string) => string;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceTable({ services, getCategoryName, onEdit, onDelete }: ServiceTableProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No se encontraron servicios
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800">
          <TableHead className="text-gray-400">Código</TableHead>
          <TableHead className="text-gray-400">Nombre</TableHead>
          <TableHead className="text-gray-400">Categoría</TableHead>
          <TableHead className="text-gray-400">Precio</TableHead>
          <TableHead className="text-gray-400">Duración</TableHead>
          <TableHead className="text-gray-400">Estado</TableHead>
          <TableHead className="text-gray-400">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service._id} className="border-gray-800">
            <TableCell className="text-gray-300 font-mono">
              {service.codigo}
            </TableCell>
            <TableCell className="text-white">
              <p className="font-medium">{service.nombre}</p>
              {service.descripcion && (
                <p className="text-sm text-gray-400 truncate max-w-[200px]">
                  {service.descripcion}
                </p>
              )}
            </TableCell>
            <TableCell className="text-gray-300">
              {getCategoryName(service.categoria || "")}
            </TableCell>
            <TableCell className="text-[#D4AF37] font-semibold">
              ${service.precio.toLocaleString()}
            </TableCell>
            <TableCell className="text-gray-300">
              {service.duracionMin} min
            </TableCell>
            <TableCell>
              <Badge
                className={
                  service.activo
                    ? "bg-green-900 text-green-200"
                    : "bg-red-900 text-red-200"
                }
              >
                {service.activo ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(service)}
                  className="text-[#D4AF37] hover:bg-gray-800"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(service._id)}
                  className="text-red-400 hover:bg-gray-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}