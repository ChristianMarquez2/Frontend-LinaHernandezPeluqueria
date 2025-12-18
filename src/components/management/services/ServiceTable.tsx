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
import { Service } from "../../../contexts/data/types";

interface ServiceTableProps {
  services: Service[];
  getCategoryName: (serviceId: string) => string; // Cambiamos la firma para que espere serviceId
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceTable({ services, getCategoryName, onEdit, onDelete }: ServiceTableProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-black/20 rounded-lg border border-dashed border-gray-800">
        No se encontraron servicios registrados
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800 hover:bg-transparent">
          <TableHead className="text-gray-400 w-[100px]">Código</TableHead>
          <TableHead className="text-gray-400">Nombre / Descripción</TableHead>
          <TableHead className="text-gray-400">Categoría</TableHead>
          <TableHead className="text-gray-400">Precio</TableHead>
          <TableHead className="text-gray-400">Duración</TableHead>
          <TableHead className="text-gray-400">Estado</TableHead>
          <TableHead className="text-gray-400 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service._id} className="border-gray-800 hover:bg-gray-800/30 transition-colors">
            <TableCell className="text-gray-400 font-mono text-xs">
              {service.codigo || "---"}
            </TableCell>
            <TableCell className="text-white">
              <p className="font-medium text-[#D4AF37]">{service.nombre}</p>
              {service.descripcion && (
                <p className="text-xs text-gray-500 truncate max-w-[250px]" title={service.descripcion}>
                  {service.descripcion}
                </p>
              )}
            </TableCell>
            
            {/* SOLUCIÓN: Usamos service._id para la búsqueda inversa en categorías */}
            <TableCell className="text-gray-300">
              <Badge variant="outline" className="bg-purple-900 text-purple-200">
                {getCategoryName(service._id)}
              </Badge>
            </TableCell>

            <TableCell className="text-white font-medium">
              {formatCurrency(service.precio)}
            </TableCell>
            <TableCell className="text-gray-400">
              <span className="text-gray-200">{service.duracionMin}</span> min
            </TableCell>
            <TableCell>
              <Badge
                className={
                  service.activo
                    ? "bg-green-900 text-green-200"
                    : "bg-red-900 text-red-200"
                }
                variant="outline"
              >
                {service.activo ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(service)}
                  className="text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(service._id)}
                  className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
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